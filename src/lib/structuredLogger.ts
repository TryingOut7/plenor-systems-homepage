type LogLevel = 'info' | 'warn' | 'error';
type LogMeta = Record<string, unknown>;

export type StructuredLogger = {
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
};

function normalizeLogValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
}

function emit(level: LogLevel, scope: string, message: string, meta?: LogMeta): void {
  if (process.env.NODE_ENV === 'test' && process.env.DEBUG_STRUCTURED_LOGGER !== 'true') {
    return;
  }

  const normalizedMeta = meta
    ? Object.fromEntries(
        Object.entries(meta).map(([key, value]) => [key, normalizeLogValue(value)]),
      )
    : undefined;

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    ...(normalizedMeta || {}),
  };
  const line = `${JSON.stringify(payload)}\n`;

  if (level === 'error' || level === 'warn') {
    process.stderr.write(line);
    return;
  }

  process.stdout.write(line);
}

export function createStructuredLogger(scope: string, baseMeta?: LogMeta): StructuredLogger {
  return {
    info(message, meta) {
      emit('info', scope, message, {
        ...(baseMeta || {}),
        ...(meta || {}),
      });
    },
    warn(message, meta) {
      emit('warn', scope, message, {
        ...(baseMeta || {}),
        ...(meta || {}),
      });
    },
    error(message, meta) {
      emit('error', scope, message, {
        ...(baseMeta || {}),
        ...(meta || {}),
      });
    },
  };
}
