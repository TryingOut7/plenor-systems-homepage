import type { RequestContext } from '@/application/shared/requestContext';
import { fail, type ServiceResult } from '@/application/shared/serviceResult';
import { createClient } from '@supabase/supabase-js';

interface Entry {
  count: number;
  resetAt: number;
}

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 20;
const MAX_STORE_SIZE = 10_000;
const store = new Map<string, Entry>();
let warnedPersistentFallback = false;
let warnedPersistentError = false;

type RateLimitPolicy = {
  windowMs: number;
  maxRequests: number;
};

const routePolicies: Array<{ path: string; policy: RateLimitPolicy }> = [
  {
    path: '/api/draft-mode/enable',
    policy: {
      // Live preview can open multiple tabs/iframes and re-trigger preview enables.
      // Keep this route protected, but avoid blocking normal editorial usage.
      windowMs: 60_000,
      maxRequests: 60,
    },
  },
];

function resolveRateLimitPolicy(path: string): RateLimitPolicy {
  for (const rule of routePolicies) {
    if (path === rule.path) {
      return rule.policy;
    }
  }

  return {
    windowMs: DEFAULT_WINDOW_MS,
    maxRequests: DEFAULT_MAX_REQUESTS,
  };
}

type RateLimitRpcRow = {
  allowed: boolean;
  retry_after_seconds: number;
  request_count: number;
};

type SupabaseRpcResponse = {
  data: RateLimitRpcRow[] | null;
  error: { message: string } | null;
};

interface SupabaseRateLimitClient {
  rpc(
    name: string,
    params: Record<string, unknown>,
  ): Promise<SupabaseRpcResponse>;
}

const supabaseRateLimitClient: SupabaseRateLimitClient | null =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? (createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      ) as unknown as SupabaseRateLimitClient)
    : null;

function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getClientIp(context: RequestContext): string {
  const ip = context.realIp || context.forwardedFor?.split(',')[0]?.trim();
  if (!ip) {
    console.warn('Rate limiter: could not determine client IP, using fallback key');
    return 'unknown';
  }
  return ip;
}

function allowInMemoryFallback(): boolean {
  if (process.env.ALLOW_IN_MEMORY_RATE_LIMIT_FALLBACK === 'true') {
    return true;
  }
  return process.env.NODE_ENV !== 'production';
}

function warnPersistentFallbackOnce(): void {
  if (!warnedPersistentFallback) {
    warnedPersistentFallback = true;
    console.warn(
      '[rate-limit] Persistent shared rate limiter is unavailable; using process-local fallback.',
    );
  }
}

function strictPersistentRateLimitMessage(reason: string): string {
  return `[rate-limit] Persistent shared rate limiter is required in this environment (${reason}).`;
}

function consumeInMemory(
  key: string,
  windowMs: number,
  maxRequests: number,
): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    if (store.size >= MAX_STORE_SIZE) {
      cleanup();
    }

    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfterSeconds: retryAfter };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

function isMissingRateLimitSchemaError(message: string): boolean {
  return (
    /relation .* does not exist/i.test(message) ||
    /could not find the function .*consume_backend_rate_limit/i.test(message)
  );
}

export async function consumeRateLimitBucket(params: {
  key: string;
  windowMs: number;
  maxRequests: number;
}): Promise<{ limited: boolean; retryAfterSeconds: number }> {
  if (supabaseRateLimitClient) {
    const result = await supabaseRateLimitClient.rpc(
      'consume_backend_rate_limit',
      {
        p_bucket_key: params.key,
        p_window_ms: params.windowMs,
        p_max_requests: params.maxRequests,
      },
    );

    if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
      const row = result.data[0];
      return {
        limited: !row.allowed,
        retryAfterSeconds: Number(row.retry_after_seconds || 0),
      };
    }

    if (result.error) {
      if (!warnedPersistentError) {
        warnedPersistentError = true;
        console.error('[rate-limit] Persistent consume failed.', {
          errorMessage: result.error.message,
        });
      }

      if (!allowInMemoryFallback()) {
        throw new Error(
          strictPersistentRateLimitMessage(result.error.message),
        );
      }

      if (process.env.NODE_ENV === 'production' && !isMissingRateLimitSchemaError(result.error.message)) {
        // In production with explicit fallback enabled, transient DB errors
        // can use process-local limiting to preserve availability.
      }
    }
  } else if (!allowInMemoryFallback()) {
    throw new Error(
      strictPersistentRateLimitMessage(
        'missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      ),
    );
  }

  if (!allowInMemoryFallback()) {
    throw new Error(strictPersistentRateLimitMessage('fallback disabled'));
  }

  warnPersistentFallbackOnce();
  return consumeInMemory(params.key, params.windowMs, params.maxRequests);
}

export async function checkRateLimit(
  context: RequestContext,
): Promise<ServiceResult<{ message: string }> | null> {
  const policy = resolveRateLimitPolicy(context.path);
  const key = `${getClientIp(context)}:${context.path}`;

  let result: { limited: boolean; retryAfterSeconds: number };
  try {
    result = await consumeRateLimitBucket({
      key,
      windowMs: policy.windowMs,
      maxRequests: policy.maxRequests,
    });
  } catch (error) {
    if (!warnedPersistentError) {
      warnedPersistentError = true;
      console.error('[rate-limit] Rate limit consume threw unexpectedly.', {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
    if (!allowInMemoryFallback()) {
      return fail(503, {
        message: 'Rate limiting service unavailable. Please try again shortly.',
      });
    }
    warnPersistentFallbackOnce();
    result = consumeInMemory(key, policy.windowMs, policy.maxRequests);
  }

  if (result.limited) {
    return {
      ...fail(429, { message: 'Too many requests.' }),
      headers: { 'Retry-After': String(result.retryAfterSeconds) },
    };
  }

  return null;
}
