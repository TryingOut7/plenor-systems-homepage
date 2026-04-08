import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import {
  REGISTRATION_STATUSES,
  type RegistrationStatus,
} from '@/domain/org-site/constants';
import type {
  PaymentConfirmationPayload,
  RegistrationPayload,
} from '@/domain/org-site/registrationValidator';
import { resolveDbConnectionString } from '@/infrastructure/db/connectionConfig';
import type { OutboundEventV1, OutboxProvider } from '@plenor/contracts/events';

type RegistrationSubmissionRow = {
  id: number;
  public_id: string;
  event_id: string | null;
  status: RegistrationStatus;
  registration_payload: RegistrationPayload;
  payment_confirmation_payload: PaymentConfirmationPayload | null;
  internal_reason: string | null;
  user_facing_reason: string | null;
  submitted_at: string;
  updated_at: string;
};

type EventRegistrationConfigRow = {
  id: number;
  title: string | null;
  payment_required: boolean | null;
  registration_required: boolean | null;
  max_registrations: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  _status: 'draft' | 'published' | null;
};

export type EventRegistrationConfig = {
  eventId: string;
  eventTitle: string;
  paymentRequired: boolean;
  registrationRequired: boolean;
  maxRegistrations: number | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  status: 'draft' | 'published' | null;
};

export type RegistrationSubmissionRecord = {
  id: number;
  publicId: string;
  eventId: string | null;
  status: RegistrationStatus;
  registrationPayload: RegistrationPayload;
  paymentConfirmationPayload: PaymentConfirmationPayload | null;
  internalReason: string | null;
  userFacingReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type PublicRegistrationStatusRecord = {
  publicId: string;
  status: RegistrationStatus;
  userFacingReason: string | null;
};

export type RegistrationSubmissionListRecord = Pick<
  RegistrationSubmissionRecord,
  | 'publicId'
  | 'eventId'
  | 'status'
  | 'registrationPayload'
  | 'paymentConfirmationPayload'
  | 'internalReason'
  | 'userFacingReason'
  | 'submittedAt'
  | 'updatedAt'
>;

const SUBMITTED = REGISTRATION_STATUSES[0];
const PAYMENT_PENDING = REGISTRATION_STATUSES[1];
const PAYMENT_CONFIRMATION_SUBMITTED = REGISTRATION_STATUSES[2];
const PAYMENT_CONFIRMED = REGISTRATION_STATUSES[3];
const REGISTRATION_CONFIRMED = REGISTRATION_STATUSES[4];
const CANCELLED_REJECTED = REGISTRATION_STATUSES[5];

const STATUS_SEQUENCE: readonly RegistrationStatus[] = [
  SUBMITTED,
  PAYMENT_PENDING,
  PAYMENT_CONFIRMATION_SUBMITTED,
  PAYMENT_CONFIRMED,
  REGISTRATION_CONFIRMED,
  CANCELLED_REJECTED,
];

function cleanConnectionString(uri: string): string {
  return uri
    .replace(/[?&]sslmode=[^&]*/gi, (match) => (match.startsWith('?') ? '?' : ''))
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

declare global {
  var _registrationSubmissionPool: Pool | undefined;
}

function getRegistrationSubmissionPool(): Pool {
  if (globalThis._registrationSubmissionPool) {
    return globalThis._registrationSubmissionPool;
  }

  const rawConnection = resolveDbConnectionString();
  if (!rawConnection) {
    throw new Error('No database connection string configured');
  }
  const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';
  globalThis._registrationSubmissionPool = new Pool({
    connectionString: cleanConnectionString(rawConnection),
    ssl: { rejectUnauthorized },
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 30_000,
  });
  return globalThis._registrationSubmissionPool;
}

function parseNumberish(value: string | number | null | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function mapSubmissionRow(row: RegistrationSubmissionRow): RegistrationSubmissionRecord {
  return {
    id: row.id,
    publicId: row.public_id,
    eventId: row.event_id,
    status: row.status,
    registrationPayload: row.registration_payload,
    paymentConfirmationPayload: row.payment_confirmation_payload,
    internalReason: row.internal_reason,
    userFacingReason: row.user_facing_reason,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getRegistrationSubmissionPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getEventRegistrationConfigById(
  eventId: string,
  options?: { publishedOnly?: boolean },
): Promise<EventRegistrationConfig | null> {
  const publishedOnly = options?.publishedOnly !== false;
  const values: unknown[] = [eventId];
  const statusClause = publishedOnly ? `AND _status = 'published'` : '';

  const result = await getRegistrationSubmissionPool().query<EventRegistrationConfigRow>(
    `
      SELECT
        id,
        title,
        payment_required,
        registration_required,
        max_registrations,
        registration_opens_at,
        registration_closes_at,
        _status
      FROM public.org_events
      WHERE id::text = $1
      ${statusClause}
      LIMIT 1
    `,
    values,
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    eventId: String(row.id),
    eventTitle: row.title?.trim() || 'Event',
    paymentRequired: row.payment_required === true,
    registrationRequired: row.registration_required === true,
    maxRegistrations: parseNumberish(row.max_registrations),
    registrationOpensAt: row.registration_opens_at,
    registrationClosesAt: row.registration_closes_at,
    status: row._status,
  };
}

export async function findSubmissionByEventAndEmail(
  eventId: string,
  email: string,
): Promise<RegistrationSubmissionRecord | null> {
  const result = await getRegistrationSubmissionPool().query<RegistrationSubmissionRow>(
    `
      SELECT
        id,
        public_id,
        event_id,
        status,
        registration_payload,
        payment_confirmation_payload,
        internal_reason,
        user_facing_reason,
        submitted_at,
        updated_at
      FROM public.registration_submissions
      WHERE event_id = $1
        AND lower(registration_payload->>'email') = lower($2)
      ORDER BY submitted_at DESC
      LIMIT 1
    `,
    [eventId, email],
  );

  const row = result.rows[0];
  return row ? mapSubmissionRow(row) : null;
}

export async function countActiveSubmissionsForEvent(eventId: string): Promise<number> {
  const result = await getRegistrationSubmissionPool().query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM public.registration_submissions
      WHERE event_id = $1
        AND status <> $2
    `,
    [eventId, CANCELLED_REJECTED],
  );

  const countRaw = result.rows[0]?.count;
  return parseNumberish(countRaw) || 0;
}

async function insertOutboxJob(
  client: PoolClient,
  input: {
    submissionId: string;
    provider: OutboxProvider;
    event: OutboundEventV1<unknown>;
    deduplicationKey: string;
    maxAttempts?: number;
  },
): Promise<void> {
  const now = new Date().toISOString();
  const maxAttempts = input.maxAttempts ?? 3;
  await client.query(
    `
      INSERT INTO public.backend_outbox_jobs (
        id,
        submission_id,
        provider,
        status,
        attempts,
        max_attempts,
        next_attempt_at,
        payload,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
    `,
    [
      randomUUID(),
      input.submissionId,
      input.provider,
      'pending',
      0,
      maxAttempts,
      now,
      JSON.stringify({
        event: input.event,
        deduplicationKey: input.deduplicationKey,
      }),
      now,
      now,
    ],
  );
}

export async function persistRegistrationSubmissionWithOutbox(input: {
  eventId: string;
  registrationPayload: RegistrationPayload;
  eventTitle: string;
  isPaid: boolean;
}): Promise<RegistrationSubmissionRecord> {
  return withTransaction(async (client) => {
    const inserted = await client.query<RegistrationSubmissionRow>(
      `
        INSERT INTO public.registration_submissions (
          event_id,
          status,
          registration_payload
        )
        VALUES ($1, $2, $3::jsonb)
        RETURNING
          id,
          public_id,
          event_id,
          status,
          registration_payload,
          payment_confirmation_payload,
          internal_reason,
          user_facing_reason,
          submitted_at,
          updated_at
      `,
      [input.eventId, SUBMITTED, JSON.stringify(input.registrationPayload)],
    );

    const row = inserted.rows[0];
    const record = mapSubmissionRow(row);
    const submissionId = `registration_${record.publicId}`;

    const event: OutboundEventV1<{
      publicId: string;
      eventId: string;
      eventTitle: string;
      submittedAt: string;
      isPaid: boolean;
    }> = {
      version: 'v1',
      id: randomUUID(),
      type: 'submission.registration.created',
      occurredAt: record.submittedAt,
      payload: {
        publicId: record.publicId,
        eventId: input.eventId,
        eventTitle: input.eventTitle,
        submittedAt: record.submittedAt,
        isPaid: input.isPaid,
      },
    };

    const deduplicationKey = `${event.type}:${record.publicId}`;
    await Promise.all([
      insertOutboxJob(client, {
        submissionId,
        provider: 'email.registration',
        event,
        deduplicationKey,
      }),
      insertOutboxJob(client, {
        submissionId,
        provider: 'webhook',
        event,
        deduplicationKey,
      }),
    ]);

    return record;
  });
}

export async function getSubmissionByPublicId(
  publicId: string,
): Promise<RegistrationSubmissionRecord | null> {
  const result = await getRegistrationSubmissionPool().query<RegistrationSubmissionRow>(
    `
      SELECT
        id,
        public_id,
        event_id,
        status,
        registration_payload,
        payment_confirmation_payload,
        internal_reason,
        user_facing_reason,
        submitted_at,
        updated_at
      FROM public.registration_submissions
      WHERE public_id::text = $1
      LIMIT 1
    `,
    [publicId],
  );

  const row = result.rows[0];
  return row ? mapSubmissionRow(row) : null;
}

export async function getSubmissionStatusByPublicId(
  publicId: string,
): Promise<PublicRegistrationStatusRecord | null> {
  const result = await getRegistrationSubmissionPool().query<{
    public_id: string;
    status: RegistrationStatus;
    user_facing_reason: string | null;
  }>(
    `
      SELECT public_id, status, user_facing_reason
      FROM public.registration_submissions
      WHERE public_id::text = $1
      LIMIT 1
    `,
    [publicId],
  );

  const row = result.rows[0];
  if (!row) return null;
  return {
    publicId: row.public_id,
    status: row.status,
    userFacingReason: row.user_facing_reason,
  };
}

export async function persistPaymentConfirmationWithOutbox(input: {
  publicId: string;
  payload: PaymentConfirmationPayload;
}): Promise<RegistrationSubmissionRecord | null> {
  return withTransaction(async (client) => {
    const updated = await client.query<RegistrationSubmissionRow>(
      `
        UPDATE public.registration_submissions
        SET
          payment_confirmation_payload = $2::jsonb,
          status = $3,
          updated_at = NOW()
        WHERE public_id::text = $1
        RETURNING
          id,
          public_id,
          event_id,
          status,
          registration_payload,
          payment_confirmation_payload,
          internal_reason,
          user_facing_reason,
          submitted_at,
          updated_at
      `,
      [input.publicId, JSON.stringify(input.payload), PAYMENT_CONFIRMATION_SUBMITTED],
    );

    const row = updated.rows[0];
    if (!row) return null;
    const record = mapSubmissionRow(row);
    const submissionId = `registration_${record.publicId}`;
    const confirmedAt = record.updatedAt;

    const event: OutboundEventV1<{
      publicId: string;
      eventId: string;
      confirmedAt: string;
    }> = {
      version: 'v1',
      id: randomUUID(),
      type: 'submission.registration.payment_confirmation.submitted',
      occurredAt: confirmedAt,
      payload: {
        publicId: record.publicId,
        eventId: record.eventId || '',
        confirmedAt,
      },
    };

    const deduplicationKey = `${event.type}:${record.publicId}`;
    await Promise.all([
      insertOutboxJob(client, {
        submissionId,
        provider: 'email.registration',
        event,
        deduplicationKey,
      }),
      insertOutboxJob(client, {
        submissionId,
        provider: 'webhook',
        event,
        deduplicationKey,
      }),
    ]);

    return record;
  });
}

export async function listSubmissions(input: {
  page: number;
  limit: number;
  status?: RegistrationStatus;
  eventId?: string;
}): Promise<{
  items: RegistrationSubmissionListRecord[];
  total: number;
  byStatus: Partial<Record<RegistrationStatus, number>>;
}> {
  const whereParts: string[] = [];
  const values: Array<string | number> = [];
  let index = 1;

  if (input.status) {
    whereParts.push(`status = $${index}`);
    values.push(input.status);
    index += 1;
  }

  if (input.eventId) {
    whereParts.push(`event_id = $${index}`);
    values.push(input.eventId);
    index += 1;
  }

  const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
  const offset = (input.page - 1) * input.limit;

  const [itemsResult, totalResult, byStatusResult] = await Promise.all([
    getRegistrationSubmissionPool().query<RegistrationSubmissionRow>(
      `
        SELECT
          id,
          public_id,
          event_id,
          status,
          registration_payload,
          payment_confirmation_payload,
          internal_reason,
          user_facing_reason,
          submitted_at,
          updated_at
        FROM public.registration_submissions
        ${whereClause}
        ORDER BY submitted_at DESC
        LIMIT $${index}
        OFFSET $${index + 1}
      `,
      [...values, input.limit, offset],
    ),
    getRegistrationSubmissionPool().query<{ total: string }>(
      `
        SELECT COUNT(*)::text AS total
        FROM public.registration_submissions
        ${whereClause}
      `,
      values,
    ),
    getRegistrationSubmissionPool().query<{ status: RegistrationStatus; count: string }>(
      `
        SELECT status, COUNT(*)::text AS count
        FROM public.registration_submissions
        ${whereClause}
        GROUP BY status
      `,
      values,
    ),
  ]);

  const byStatus: Partial<Record<RegistrationStatus, number>> = {};
  for (const row of byStatusResult.rows) {
    byStatus[row.status] = parseNumberish(row.count) || 0;
  }

  return {
    items: itemsResult.rows.map((row) => {
      const mapped = mapSubmissionRow(row);
      return {
        publicId: mapped.publicId,
        eventId: mapped.eventId,
        status: mapped.status,
        registrationPayload: mapped.registrationPayload,
        paymentConfirmationPayload: mapped.paymentConfirmationPayload,
        internalReason: mapped.internalReason,
        userFacingReason: mapped.userFacingReason,
        submittedAt: mapped.submittedAt,
        updatedAt: mapped.updatedAt,
      };
    }),
    total: parseNumberish(totalResult.rows[0]?.total) || 0,
    byStatus,
  };
}

export async function updateSubmissionStatusWithAudit(input: {
  publicId: string;
  nextStatus: RegistrationStatus;
  internalReason?: string;
  userFacingReason?: string;
  actorKeyId: string;
}): Promise<{
  before: RegistrationSubmissionRecord | null;
  after: RegistrationSubmissionRecord | null;
}> {
  return withTransaction(async (client) => {
    const currentResult = await client.query<RegistrationSubmissionRow>(
      `
        SELECT
          id,
          public_id,
          event_id,
          status,
          registration_payload,
          payment_confirmation_payload,
          internal_reason,
          user_facing_reason,
          submitted_at,
          updated_at
        FROM public.registration_submissions
        WHERE public_id::text = $1
        LIMIT 1
        FOR UPDATE
      `,
      [input.publicId],
    );

    const currentRow = currentResult.rows[0];
    if (!currentRow) {
      return { before: null, after: null };
    }

    const before = mapSubmissionRow(currentRow);

    const updateResult = await client.query<RegistrationSubmissionRow>(
      `
        UPDATE public.registration_submissions
        SET
          status = $2,
          internal_reason = $3,
          user_facing_reason = $4,
          updated_at = NOW()
        WHERE public_id::text = $1
        RETURNING
          id,
          public_id,
          event_id,
          status,
          registration_payload,
          payment_confirmation_payload,
          internal_reason,
          user_facing_reason,
          submitted_at,
          updated_at
      `,
      [
        input.publicId,
        input.nextStatus,
        input.internalReason || null,
        input.userFacingReason || null,
      ],
    );

    const updatedRow = updateResult.rows[0];
    const after = updatedRow ? mapSubmissionRow(updatedRow) : null;
    if (!after) {
      return { before, after: null };
    }

    const reasonText = input.internalReason || input.userFacingReason || null;

    await client.query(
      `
        INSERT INTO public.audit_logs (
          action,
          collection,
          document_id,
          document_title,
          field_path,
          old_value_summary,
          new_value_summary,
          risk_tier,
          summary,
          actor_key_id,
          target_id,
          old_status,
          new_status,
          reason
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14
        )
      `,
      [
        'registration_status_update',
        'registration_submissions',
        input.publicId,
        input.publicId,
        'status',
        before.status,
        after.status,
        'system',
        `Registration status updated from ${before.status} to ${after.status}.`,
        input.actorKeyId,
        input.publicId,
        before.status,
        after.status,
        reasonText,
      ],
    );

    return { before, after };
  });
}

export function isStatusAtOrBeyond(
  status: RegistrationStatus,
  baseline: RegistrationStatus,
): boolean {
  const statusIndex = STATUS_SEQUENCE.indexOf(status);
  const baselineIndex = STATUS_SEQUENCE.indexOf(baseline);
  if (statusIndex < 0 || baselineIndex < 0) return false;
  return statusIndex >= baselineIndex;
}
