import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export type SubmissionKind = 'guide' | 'inquiry';

type GuideSubmissionRow = {
  id: number;
  name: string;
  email: string;
  submitted_at: string;
};

type InquirySubmissionRow = {
  id: number;
  name: string;
  email: string;
  company: string;
  challenge: string;
  submitted_at: string;
};

type IdempotencyRow = {
  route: string;
  key: string;
  fingerprint: string;
  status: number;
  body: Record<string, unknown> | null;
  headers: Record<string, string> | null;
  created_at: string;
};

type OutboxJobRow = {
  id: string;
  submission_id: string;
  provider: string;
  status: OutboxStatus;
  attempts: number;
  max_attempts: number;
  next_attempt_at: string;
  last_error: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export interface StoredSubmission {
  id: string;
  kind: SubmissionKind;
  name: string;
  email: string;
  company?: string;
  challenge?: string;
  submittedAt: string;
}

export interface IdempotencyRecord {
  key: string;
  route: string;
  fingerprint: string;
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  createdAt: string;
}

export type OutboxStatus =
  | 'pending'
  | 'processing'
  | 'retrying'
  | 'succeeded'
  | 'dead_letter';

export interface OutboxJob {
  id: string;
  submissionId: string;
  provider: string;
  status: OutboxStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lastError?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface SupabaseStore {
  enabled: boolean;
  client: ReturnType<typeof createClient> | null;
  tableMissing: Set<string>;
}

const supabase: SupabaseStore = {
  enabled:
    !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  client:
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        )
      : null,
  tableMissing: new Set(),
};

const inMemory = {
  submissions: [] as StoredSubmission[],
  idempotency: new Map<string, IdempotencyRecord>(),
  outbox: new Map<string, OutboxJob>(),
};

function isMissingTableError(message: string): boolean {
  return /relation .* does not exist/i.test(message);
}

function markMissingTable(table: string): void {
  if (!supabase.tableMissing.has(table)) {
    supabase.tableMissing.add(table);
    console.warn(
      `[backend-store] Missing table "${table}". Falling back to in-memory storage for this table.`,
    );
  }
}

function tableAvailable(table: string): boolean {
  return supabase.enabled && !!supabase.client && !supabase.tableMissing.has(table);
}

interface DbError {
  message: string;
}

interface DbResponse<T> {
  data: T | null;
  error: DbError | null;
}

interface DbQuery {
  insert(values: unknown, options?: unknown): DbQuery;
  upsert(values: unknown, options?: unknown): DbQuery;
  update(values: unknown, options?: unknown): DbQuery;
  select(columns: string): DbQuery;
  eq(column: string, value: unknown): DbQuery;
  order(column: string, options?: { ascending?: boolean }): DbQuery;
  limit(value: number): DbQuery;
  single(): DbQuery;
  maybeSingle(): DbQuery;
}

interface DbClient {
  from(table: string): DbQuery;
}

function db(): DbClient {
  return supabase.client as unknown as DbClient;
}

async function executeQuery<T>(query: DbQuery): Promise<DbResponse<T>> {
  return (await (query as unknown as Promise<DbResponse<T>>)) as DbResponse<T>;
}

function idempotencyKey(route: string, key: string): string {
  return `${route}::${key}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function isPersistentStoreConfigured(): boolean {
  return tableAvailable('backend_idempotency_keys') && tableAvailable('backend_outbox_jobs');
}

export function hasDatabaseCredentials(): boolean {
  return supabase.enabled;
}

export async function persistGuideSubmissionRecord(input: {
  name: string;
  email: string;
}): Promise<StoredSubmission> {
  const submittedAt = nowIso();
  const fallbackRecord: StoredSubmission = {
    id: `guide_${randomUUID()}`,
    kind: 'guide',
    name: input.name,
    email: input.email,
    submittedAt,
  };

  if (tableAvailable('guide_submissions')) {
    const { data, error } = await executeQuery<GuideSubmissionRow>(
      db()
        .from('guide_submissions')
        .insert({
          name: input.name,
          email: input.email,
        })
        .select('id, submitted_at')
        .single(),
    );

    if (!error && data) {
      const record: StoredSubmission = {
        id: `guide_${String(data.id)}`,
        kind: 'guide',
        name: input.name,
        email: input.email,
        submittedAt:
          typeof data.submitted_at === 'string' ? data.submitted_at : submittedAt,
      };
      inMemory.submissions.unshift(record);
      return record;
    }

    if (error && isMissingTableError(error.message)) {
      markMissingTable('guide_submissions');
    } else if (error) {
      throw new Error(error.message);
    }
  }

  inMemory.submissions.unshift(fallbackRecord);
  return fallbackRecord;
}

export async function persistInquirySubmissionRecord(input: {
  name: string;
  email: string;
  company: string;
  challenge: string;
}): Promise<StoredSubmission> {
  const submittedAt = nowIso();
  const fallbackRecord: StoredSubmission = {
    id: `inquiry_${randomUUID()}`,
    kind: 'inquiry',
    name: input.name,
    email: input.email,
    company: input.company,
    challenge: input.challenge,
    submittedAt,
  };

  if (tableAvailable('inquiry_submissions')) {
    const { data, error } = await executeQuery<InquirySubmissionRow>(
      db()
        .from('inquiry_submissions')
        .insert({
          name: input.name,
          email: input.email,
          company: input.company,
          challenge: input.challenge,
        })
        .select('id, submitted_at')
        .single(),
    );

    if (!error && data) {
      const record: StoredSubmission = {
        id: `inquiry_${String(data.id)}`,
        kind: 'inquiry',
        name: input.name,
        email: input.email,
        company: input.company,
        challenge: input.challenge,
        submittedAt:
          typeof data.submitted_at === 'string' ? data.submitted_at : submittedAt,
      };
      inMemory.submissions.unshift(record);
      return record;
    }

    if (error && isMissingTableError(error.message)) {
      markMissingTable('inquiry_submissions');
    } else if (error) {
      throw new Error(error.message);
    }
  }

  inMemory.submissions.unshift(fallbackRecord);
  return fallbackRecord;
}

export async function listStoredSubmissions(params: {
  page: number;
  limit: number;
}): Promise<{ items: StoredSubmission[]; total: number }> {
  const start = (params.page - 1) * params.limit;
  const end = start + params.limit;

  if (
    tableAvailable('guide_submissions') &&
    tableAvailable('inquiry_submissions')
  ) {
    const [guideRows, inquiryRows] = await Promise.all([
      executeQuery<GuideSubmissionRow[]>(
        db()
          .from('guide_submissions')
          .select('id, name, email, submitted_at')
          .order('submitted_at', { ascending: false })
          .limit(500),
      ),
      executeQuery<InquirySubmissionRow[]>(
        db()
          .from('inquiry_submissions')
          .select('id, name, email, company, challenge, submitted_at')
          .order('submitted_at', { ascending: false })
          .limit(500),
      ),
    ]);

    if (guideRows.error && isMissingTableError(guideRows.error.message)) {
      markMissingTable('guide_submissions');
    } else if (guideRows.error) {
      throw new Error(guideRows.error.message);
    }

    if (inquiryRows.error && isMissingTableError(inquiryRows.error.message)) {
      markMissingTable('inquiry_submissions');
    } else if (inquiryRows.error) {
      throw new Error(inquiryRows.error.message);
    }

    if (!guideRows.error && !inquiryRows.error) {
      const guides: StoredSubmission[] = (guideRows.data || []).map((row) => ({
        id: `guide_${String(row.id)}`,
        kind: 'guide',
        name: String(row.name || ''),
        email: String(row.email || ''),
        submittedAt: String(row.submitted_at || nowIso()),
      }));

      const inquiries: StoredSubmission[] = (inquiryRows.data || []).map(
        (row) => ({
          id: `inquiry_${String(row.id)}`,
          kind: 'inquiry',
          name: String(row.name || ''),
          email: String(row.email || ''),
          company: String(row.company || ''),
          challenge: String(row.challenge || ''),
          submittedAt: String(row.submitted_at || nowIso()),
        }),
      );

      const merged = [...guides, ...inquiries].sort((a, b) =>
        b.submittedAt.localeCompare(a.submittedAt),
      );

      return {
        items: merged.slice(start, end),
        total: merged.length,
      };
    }
  }

  const snapshot = [...inMemory.submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
  return {
    items: snapshot.slice(start, end),
    total: snapshot.length,
  };
}

export async function getStoredSubmissionById(
  submissionId: string,
): Promise<StoredSubmission | null> {
  const inMemoryHit = inMemory.submissions.find((s) => s.id === submissionId);
  if (inMemoryHit) {
    return inMemoryHit;
  }

  const [kind, rawId] = submissionId.split('_');
  if (!rawId) return null;

  if (kind === 'guide' && tableAvailable('guide_submissions')) {
    const { data, error } = await executeQuery<GuideSubmissionRow>(
      db()
        .from('guide_submissions')
        .select('id, name, email, submitted_at')
        .eq('id', rawId)
        .maybeSingle(),
    );

    if (!error && data) {
      return {
        id: `guide_${String(data.id)}`,
        kind: 'guide',
        name: String(data.name || ''),
        email: String(data.email || ''),
        submittedAt: String(data.submitted_at || nowIso()),
      };
    }

    if (error && isMissingTableError(error.message)) {
      markMissingTable('guide_submissions');
    }
  }

  if (kind === 'inquiry' && tableAvailable('inquiry_submissions')) {
    const { data, error } = await executeQuery<InquirySubmissionRow>(
      db()
        .from('inquiry_submissions')
        .select('id, name, email, company, challenge, submitted_at')
        .eq('id', rawId)
        .maybeSingle(),
    );

    if (!error && data) {
      return {
        id: `inquiry_${String(data.id)}`,
        kind: 'inquiry',
        name: String(data.name || ''),
        email: String(data.email || ''),
        company: String(data.company || ''),
        challenge: String(data.challenge || ''),
        submittedAt: String(data.submitted_at || nowIso()),
      };
    }

    if (error && isMissingTableError(error.message)) {
      markMissingTable('inquiry_submissions');
    }
  }

  return null;
}

export async function readIdempotencyRecord(input: {
  route: string;
  key: string;
}): Promise<IdempotencyRecord | null> {
  const memoryKey = idempotencyKey(input.route, input.key);
  const local = inMemory.idempotency.get(memoryKey);
  if (local) return local;

  if (tableAvailable('backend_idempotency_keys')) {
    const { data, error } = await executeQuery<IdempotencyRow>(
      db()
        .from('backend_idempotency_keys')
        .select('route, key, fingerprint, status, body, headers, created_at')
        .eq('route', input.route)
        .eq('key', input.key)
        .maybeSingle(),
    );

    if (!error && data) {
      const parsed: IdempotencyRecord = {
        route: String(data.route),
        key: String(data.key),
        fingerprint: String(data.fingerprint),
        status: Number(data.status),
        body: (data.body ?? {}) as unknown,
        headers:
          data.headers && typeof data.headers === 'object'
            ? (data.headers as Record<string, string>)
            : undefined,
        createdAt: String(data.created_at || nowIso()),
      };
      inMemory.idempotency.set(memoryKey, parsed);
      return parsed;
    }

    if (error && isMissingTableError(error.message)) {
      markMissingTable('backend_idempotency_keys');
    } else if (error) {
      throw new Error(error.message);
    }
  }

  return null;
}

export async function writeIdempotencyRecord(
  record: IdempotencyRecord,
): Promise<void> {
  const memoryKey = idempotencyKey(record.route, record.key);
  inMemory.idempotency.set(memoryKey, record);

  if (!tableAvailable('backend_idempotency_keys')) {
    return;
  }

  const { error } = await executeQuery<IdempotencyRow>(
    db()
      .from('backend_idempotency_keys')
      .upsert(
        {
          route: record.route,
          key: record.key,
          fingerprint: record.fingerprint,
          status: record.status,
          body: (record.body ?? {}) as Record<string, unknown>,
          headers: (record.headers || {}) as Record<string, string>,
          created_at: record.createdAt,
        },
        { onConflict: 'route,key' },
      ),
  );

  if (error && isMissingTableError(error.message)) {
    markMissingTable('backend_idempotency_keys');
    return;
  }

  if (error) {
    throw new Error(error.message);
  }
}

export async function enqueueOutboxJobs(
  jobs: Array<{
    submissionId: string;
    provider: string;
    payload: Record<string, unknown>;
    maxAttempts?: number;
    nextAttemptAt?: string;
  }>,
): Promise<OutboxJob[]> {
  const timestamp = nowIso();
  const created: OutboxJob[] = jobs.map((job) => ({
    id: randomUUID(),
    submissionId: job.submissionId,
    provider: job.provider,
    status: 'pending',
    attempts: 0,
    maxAttempts: job.maxAttempts ?? 5,
    nextAttemptAt: job.nextAttemptAt ?? timestamp,
    payload: job.payload,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  for (const job of created) {
    inMemory.outbox.set(job.id, job);
  }

  if (tableAvailable('backend_outbox_jobs')) {
    const { error } = await executeQuery<OutboxJobRow[]>(
      db().from('backend_outbox_jobs').insert(
        created.map((job) => ({
          id: job.id,
          submission_id: job.submissionId,
          provider: job.provider,
          status: job.status,
          attempts: job.attempts,
          max_attempts: job.maxAttempts,
          next_attempt_at: job.nextAttemptAt,
          payload: job.payload,
          created_at: job.createdAt,
          updated_at: job.updatedAt,
        })),
      ),
    );

    if (error && isMissingTableError(error.message)) {
      markMissingTable('backend_outbox_jobs');
    } else if (error) {
      throw new Error(error.message);
    }
  }

  return created;
}

export async function listOutboxJobsBySubmission(
  submissionId: string,
): Promise<OutboxJob[]> {
  const local = [...inMemory.outbox.values()]
    .filter((job) => job.submissionId === submissionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!tableAvailable('backend_outbox_jobs')) {
    return local;
  }

  const { data, error } = await executeQuery<OutboxJobRow[]>(
    db()
      .from('backend_outbox_jobs')
      .select(
        'id, submission_id, provider, status, attempts, max_attempts, next_attempt_at, last_error, payload, created_at, updated_at',
      )
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false }),
  );

  if (!error && data) {
    return data.map((row) => ({
      id: String(row.id),
      submissionId: String(row.submission_id),
      provider: String(row.provider),
      status: row.status as OutboxStatus,
      attempts: Number(row.attempts ?? 0),
      maxAttempts: Number(row.max_attempts ?? 5),
      nextAttemptAt: String(row.next_attempt_at || nowIso()),
      lastError: row.last_error ? String(row.last_error) : undefined,
      payload: (row.payload || {}) as Record<string, unknown>,
      createdAt: String(row.created_at || nowIso()),
      updatedAt: String(row.updated_at || nowIso()),
    }));
  }

  if (error && isMissingTableError(error.message)) {
    markMissingTable('backend_outbox_jobs');
    return local;
  }

  if (error) {
    throw new Error(error.message);
  }

  return local;
}

export async function claimDueOutboxJobs(limit: number): Promise<OutboxJob[]> {
  const now = nowIso();
  const due = [...inMemory.outbox.values()]
    .filter(
      (job) =>
        (job.status === 'pending' || job.status === 'retrying') &&
        job.nextAttemptAt <= now,
    )
    .sort((a, b) => a.nextAttemptAt.localeCompare(b.nextAttemptAt))
    .slice(0, limit);

  for (const job of due) {
    const updated: OutboxJob = {
      ...job,
      status: 'processing',
      updatedAt: nowIso(),
    };
    inMemory.outbox.set(job.id, updated);
  }

  return due.map((job) => ({
    ...job,
    status: 'processing',
  }));
}

export async function markOutboxJobSucceeded(jobId: string): Promise<void> {
  const existing = inMemory.outbox.get(jobId);
  if (!existing) return;
  const updated: OutboxJob = {
    ...existing,
    status: 'succeeded',
    updatedAt: nowIso(),
  };
  inMemory.outbox.set(jobId, updated);

  if (!tableAvailable('backend_outbox_jobs')) return;
  const { error } = await executeQuery<OutboxJobRow>(
    db()
      .from('backend_outbox_jobs')
      .update({
        status: 'succeeded',
        updated_at: updated.updatedAt,
        last_error: null,
      })
      .eq('id', jobId),
  );

  if (error && isMissingTableError(error.message)) {
    markMissingTable('backend_outbox_jobs');
    return;
  }
  if (error) {
    throw new Error(error.message);
  }
}

export async function markOutboxJobFailed(
  jobId: string,
  errorMessage: string,
): Promise<void> {
  const existing = inMemory.outbox.get(jobId);
  if (!existing) return;

  const attempts = existing.attempts + 1;
  const reachedLimit = attempts >= existing.maxAttempts;
  const nextAttemptAt = reachedLimit
    ? existing.nextAttemptAt
    : new Date(Date.now() + Math.min(60_000, 1_000 * 2 ** attempts)).toISOString();

  const updated: OutboxJob = {
    ...existing,
    attempts,
    status: reachedLimit ? 'dead_letter' : 'retrying',
    lastError: errorMessage,
    nextAttemptAt,
    updatedAt: nowIso(),
  };
  inMemory.outbox.set(jobId, updated);

  if (!tableAvailable('backend_outbox_jobs')) return;
  const { error } = await executeQuery<OutboxJobRow>(
    db()
      .from('backend_outbox_jobs')
      .update({
        attempts,
        status: updated.status,
        last_error: errorMessage,
        next_attempt_at: updated.nextAttemptAt,
        updated_at: updated.updatedAt,
      })
      .eq('id', jobId),
  );

  if (error && isMissingTableError(error.message)) {
    markMissingTable('backend_outbox_jobs');
    return;
  }
  if (error) {
    throw new Error(error.message);
  }
}

export async function outboxStatsBySubmission(submissionId: string): Promise<{
  total: number;
  pending: number;
  retrying: number;
  succeeded: number;
  deadLetter: number;
}> {
  const jobs = await listOutboxJobsBySubmission(submissionId);
  return jobs.reduce(
    (acc, job) => {
      acc.total += 1;
      if (job.status === 'pending' || job.status === 'processing') {
        acc.pending += 1;
      } else if (job.status === 'retrying') {
        acc.retrying += 1;
      } else if (job.status === 'succeeded') {
        acc.succeeded += 1;
      } else if (job.status === 'dead_letter') {
        acc.deadLetter += 1;
      }
      return acc;
    },
    { total: 0, pending: 0, retrying: 0, succeeded: 0, deadLetter: 0 },
  );
}
