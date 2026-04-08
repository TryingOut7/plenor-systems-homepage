'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { ORG_REGISTRATION_STATUSES } from '@/lib/org-site-status';
import type { FormSubmissionErrorResponse } from '@plenor/contracts/forms';

function readErrorMessage(value: unknown, fallback: string): string {
  if (!value || typeof value !== 'object') return fallback;
  const typed = value as FormSubmissionErrorResponse;
  if (typeof typed.message === 'string' && typed.message.trim()) return typed.message;
  if (typeof typed.error === 'string' && typed.error.trim()) return typed.error;
  return fallback;
}

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `diag-${Date.now()}`;
}

function asPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function RegistrationSubmissionsDiagnosticsPage() {
  const [apiKey, setApiKey] = useState('');
  const [listLimit, setListLimit] = useState('20');
  const [listStatus, setListStatus] = useState('');
  const [listEventId, setListEventId] = useState('');
  const [lookupPublicId, setLookupPublicId] = useState('');
  const [updatePublicId, setUpdatePublicId] = useState('');
  const [updateStatus, setUpdateStatus] = useState<(typeof ORG_REGISTRATION_STATUSES)[number]>(
    ORG_REGISTRATION_STATUSES[0],
  );
  const [internalReason, setInternalReason] = useState('');
  const [userFacingReason, setUserFacingReason] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canRun = useMemo(() => apiKey.trim().length > 0, [apiKey]);

  async function fetchJson(
    path: string,
    options: RequestInit,
    fallbackError: string,
  ): Promise<unknown> {
    const response = await fetch(path, options);
    const body = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new Error(readErrorMessage(body, fallbackError));
    }

    return body;
  }

  async function handleList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRun) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', listLimit.trim() || '20');
      if (listStatus.trim()) params.set('status', listStatus.trim());
      if (listEventId.trim()) params.set('eventId', listEventId.trim());
      const body = await fetchJson(
        `/api/admin/registration-submissions?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey.trim(),
          },
          cache: 'no-store',
        },
        'Unable to list registration submissions.',
      );

      setResult(body);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRun) return;
    const publicId = lookupPublicId.trim();
    if (!publicId) return;

    setLoading(true);
    setError(null);

    try {
      const body = await fetchJson(
        `/api/admin/registration-submissions/${encodeURIComponent(publicId)}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey.trim(),
          },
          cache: 'no-store',
        },
        'Unable to load registration submission.',
      );

      setResult(body);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRun) return;
    const publicId = updatePublicId.trim();
    if (!publicId) return;

    setLoading(true);
    setError(null);

    try {
      const body = await fetchJson(
        `/api/admin/registration-submissions/${encodeURIComponent(publicId)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey.trim(),
            'Idempotency-Key': newIdempotencyKey(),
          },
          body: JSON.stringify({
            status: updateStatus,
            ...(internalReason.trim() ? { internalReason: internalReason.trim() } : {}),
            ...(userFacingReason.trim() ? { userFacingReason: userFacingReason.trim() } : {}),
          }),
        },
        'Unable to update registration status.',
      );

      setResult(body);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ display: 'grid', gap: '20px', maxWidth: '980px' }}>
      <h1 style={{ margin: 0 }}>Registration Submissions Diagnostics</h1>
      <p style={{ margin: 0, opacity: 0.82 }}>
        Admin helper for listing, reviewing, and updating registration submissions via existing admin
        APIs.
      </p>

      <label style={{ display: 'grid', gap: '6px', maxWidth: '520px' }}>
        <span>Admin API key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Enter admin x-api-key"
          style={{
            borderRadius: '8px',
            border: '1px solid #4a5568',
            background: '#0f172a',
            color: '#e5e7eb',
            padding: '10px 12px',
          }}
        />
      </label>

      <section style={{ border: '1px solid #374151', borderRadius: '10px', padding: '14px' }}>
        <h2 style={{ marginTop: 0 }}>List Submissions</h2>
        <form onSubmit={handleList} style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Limit</span>
              <input
                value={listLimit}
                onChange={(event) => setListLimit(event.target.value)}
                inputMode="numeric"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #4a5568',
                  background: '#0f172a',
                  color: '#e5e7eb',
                  padding: '10px 12px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Status (optional)</span>
              <select
                value={listStatus}
                onChange={(event) => setListStatus(event.target.value)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #4a5568',
                  background: '#0f172a',
                  color: '#e5e7eb',
                  padding: '10px 12px',
                }}
              >
                <option value="">All statuses</option>
                {ORG_REGISTRATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Event ID (optional)</span>
              <input
                value={listEventId}
                onChange={(event) => setListEventId(event.target.value)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #4a5568',
                  background: '#0f172a',
                  color: '#e5e7eb',
                  padding: '10px 12px',
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canRun || loading}
            style={{
              width: 'fit-content',
              borderRadius: '8px',
              padding: '10px 14px',
              border: '1px solid #334155',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {loading ? 'Loading...' : 'List'}
          </button>
        </form>
      </section>

      <section style={{ border: '1px solid #374151', borderRadius: '10px', padding: '14px' }}>
        <h2 style={{ marginTop: 0 }}>Lookup Submission</h2>
        <form onSubmit={handleLookup} style={{ display: 'grid', gap: '10px', maxWidth: '560px' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Public ID</span>
            <input
              value={lookupPublicId}
              onChange={(event) => setLookupPublicId(event.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{
                borderRadius: '8px',
                border: '1px solid #4a5568',
                background: '#0f172a',
                color: '#e5e7eb',
                padding: '10px 12px',
              }}
            />
          </label>
          <button
            type="submit"
            disabled={!canRun || loading || !lookupPublicId.trim()}
            style={{
              width: 'fit-content',
              borderRadius: '8px',
              padding: '10px 14px',
              border: '1px solid #334155',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {loading ? 'Loading...' : 'Lookup'}
          </button>
        </form>
      </section>

      <section style={{ border: '1px solid #374151', borderRadius: '10px', padding: '14px' }}>
        <h2 style={{ marginTop: 0 }}>Update Status</h2>
        <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '10px', maxWidth: '720px' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Public ID</span>
            <input
              value={updatePublicId}
              onChange={(event) => setUpdatePublicId(event.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{
                borderRadius: '8px',
                border: '1px solid #4a5568',
                background: '#0f172a',
                color: '#e5e7eb',
                padding: '10px 12px',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px', maxWidth: '320px' }}>
            <span>Next status</span>
            <select
              value={updateStatus}
              onChange={(event) =>
                setUpdateStatus(
                  (event.target.value as (typeof ORG_REGISTRATION_STATUSES)[number]) ||
                    ORG_REGISTRATION_STATUSES[0],
                )
              }
              style={{
                borderRadius: '8px',
                border: '1px solid #4a5568',
                background: '#0f172a',
                color: '#e5e7eb',
                padding: '10px 12px',
              }}
            >
              {ORG_REGISTRATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Internal reason (optional)</span>
            <input
              value={internalReason}
              onChange={(event) => setInternalReason(event.target.value)}
              style={{
                borderRadius: '8px',
                border: '1px solid #4a5568',
                background: '#0f172a',
                color: '#e5e7eb',
                padding: '10px 12px',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>User-facing reason (optional)</span>
            <input
              value={userFacingReason}
              onChange={(event) => setUserFacingReason(event.target.value)}
              style={{
                borderRadius: '8px',
                border: '1px solid #4a5568',
                background: '#0f172a',
                color: '#e5e7eb',
                padding: '10px 12px',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={!canRun || loading || !updatePublicId.trim()}
            style={{
              width: 'fit-content',
              borderRadius: '8px',
              padding: '10px 14px',
              border: '1px solid #334155',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {loading ? 'Saving...' : 'Update status'}
          </button>
        </form>
      </section>

      {error ? (
        <p role="alert" style={{ margin: 0, color: '#fca5a5', fontWeight: 700 }}>
          {error}
        </p>
      ) : null}

      <section style={{ border: '1px solid #374151', borderRadius: '10px', padding: '14px' }}>
        <h2 style={{ marginTop: 0 }}>Last Response</h2>
        <pre
          style={{
            margin: 0,
            padding: '12px',
            borderRadius: '8px',
            background: '#020617',
            border: '1px solid #1f2937',
            color: '#cbd5e1',
            overflowX: 'auto',
            fontSize: '12px',
          }}
        >
          {asPrettyJson(result)}
        </pre>
      </section>
    </main>
  );
}
