'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import RichText from '@/components/cms/RichText';
import type { MediaAsset } from '@/lib/org-site-helpers';
import { ORG_REGISTRATION_STATUSES } from '@/lib/org-site-status';
import type {
  PaymentConfirmationRequest,
  RegistrationStatus,
  RegistrationStatusResponse,
  RegistrationSubmissionRequest,
  RegistrationSubmissionResponse,
} from '@plenor/contracts/forms';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

type OrgEventRegistrationFlowProps = {
  event: {
    id: string;
    title: string;
    slug: string;
    registrationRequired: boolean;
    paymentRequired: boolean;
    paymentReferenceFormat?: string | null;
    paymentInstructions?: SerializedEditorState | null;
    zelleQr: MediaAsset | null;
    venmoQr: MediaAsset | null;
  };
  basePath: string;
  initialPublicId?: string;
};

type ErrorBody = {
  message?: string;
  error?: string;
};

const STATUS_SUBMITTED = ORG_REGISTRATION_STATUSES[0];
const STATUS_PAYMENT_PENDING = ORG_REGISTRATION_STATUSES[1];
const STATUS_PAYMENT_CONFIRMATION_SUBMITTED = ORG_REGISTRATION_STATUSES[2];
const STATUS_PAYMENT_CONFIRMED = ORG_REGISTRATION_STATUSES[3];
const STATUS_REGISTRATION_CONFIRMED = ORG_REGISTRATION_STATUSES[4];
const STATUS_CANCELLED_REJECTED = ORG_REGISTRATION_STATUSES[5];

function readErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const typed = body as ErrorBody;
  if (typeof typed.message === 'string' && typed.message.trim()) return typed.message;
  if (typeof typed.error === 'string' && typed.error.trim()) return typed.error;
  return fallback;
}

function normalizePublicId(input: string): string {
  return input.trim();
}

function normalizeStatusPath(basePath: string): string {
  const withoutQueryOrHash = basePath.trim().split(/[?#]/, 1)[0] || '';
  if (!withoutQueryOrHash) return '';
  const normalized = withoutQueryOrHash.replace(/\/+$/, '');
  if (!normalized) return '/';
  return normalized.startsWith('/') ? normalized : `/${normalized.replace(/^\/+/, '')}`;
}

function getStatusMessage(
  status: RegistrationStatus,
  userFacingReason: string | null,
  isPaidEvent: boolean,
): string {
  if (status === STATUS_SUBMITTED) {
    return isPaidEvent
      ? 'Registration received. Check back here or your email for payment instructions.'
      : "Your registration has been received. We'll notify you with next steps.";
  }

  if (status === STATUS_PAYMENT_PENDING) {
    return 'Payment instructions are now available. Complete payment and submit confirmation below.';
  }

  if (status === STATUS_PAYMENT_CONFIRMATION_SUBMITTED) {
    return 'Payment confirmation received. Pending admin verification.';
  }

  if (status === STATUS_PAYMENT_CONFIRMED) {
    return 'Payment verified. Awaiting final registration confirmation.';
  }

  if (status === STATUS_REGISTRATION_CONFIRMED) {
    return "You're confirmed! See you at the event.";
  }

  if (status === STATUS_CANCELLED_REJECTED) {
    return userFacingReason?.trim() || 'Registration cancelled.';
  }

  return 'Status unavailable.';
}

function PublicIdLookup({
  onLoad,
  disabled,
  defaultValue,
}: {
  onLoad: (publicId: string) => void;
  disabled: boolean;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue || '');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const normalized = normalizePublicId(value);
        if (!normalized) return;
        onLoad(normalized);
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '10px',
        marginBottom: '18px',
      }}
    >
      <label style={{ display: 'grid', gap: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ui-color-text-muted)' }}>
          Check existing status by public ID
        </span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter your registration ID"
          disabled={disabled}
          style={{
            width: '100%',
            borderRadius: '8px',
            border: '1px solid var(--ui-color-border)',
            padding: '10px 12px',
            fontSize: '15px',
          }}
        />
      </label>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="btn-primary"
        style={{ alignSelf: 'end', width: 'auto' }}
      >
        Check
      </button>
    </form>
  );
}

export default function OrgEventRegistrationFlow({
  event,
  basePath,
  initialPublicId,
}: OrgEventRegistrationFlowProps) {
  const [publicId, setPublicId] = useState(initialPublicId?.trim() || '');
  const [statusRecord, setStatusRecord] = useState<RegistrationStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [registrationForm, setRegistrationForm] = useState<{
    name: string;
    email: string;
    participantCount: string;
    instrument: string;
    ageGroup: string;
    prefEmail: boolean;
    prefSms: boolean;
    prefPhone: boolean;
    preferredChannel: '' | 'email' | 'sms' | 'phone';
  }>({
    name: '',
    email: '',
    participantCount: '',
    instrument: '',
    ageGroup: '',
    prefEmail: true,
    prefSms: false,
    prefPhone: false,
    preferredChannel: 'email',
  });

  const [paymentForm, setPaymentForm] = useState<{
    payerName: string;
    paymentMethod: 'zelle' | 'venmo';
    amount: string;
    paymentDate: string;
    referenceNote: string;
  }>({
    payerName: '',
    paymentMethod: 'zelle',
    amount: '',
    paymentDate: '',
    referenceNote: '',
  });

  const statusBoxRef = useRef<HTMLDivElement | null>(null);
  const initialStatusHydratedRef = useRef(false);

  const statusHref = useMemo(() => {
    if (!publicId) return null;
    const query = `id=${encodeURIComponent(publicId)}`;
    const normalizedPath = normalizeStatusPath(basePath);
    if (!normalizedPath) return `?${query}`;
    return `${normalizedPath}?${query}`;
  }, [basePath, publicId]);

  const statusMessage = useMemo(() => {
    if (!statusRecord) return null;
    return getStatusMessage(
      statusRecord.status,
      statusRecord.userFacingReason || null,
      event.paymentRequired,
    );
  }, [event.paymentRequired, statusRecord]);

  const showPaymentStep = statusRecord?.status === STATUS_PAYMENT_PENDING;

  useEffect(() => {
    if (!statusMessage) return;
    statusBoxRef.current?.focus();
  }, [statusMessage]);

  useEffect(() => {
    if (initialStatusHydratedRef.current) return;
    const explicitInitial = normalizePublicId(initialPublicId || '');
    const queryInitial =
      typeof window !== 'undefined'
        ? normalizePublicId(new URLSearchParams(window.location.search).get('id') || '')
        : '';
    const initial = explicitInitial || queryInitial;
    if (!initial) return;
    initialStatusHydratedRef.current = true;
    void loadStatus(initial);
  }, [initialPublicId]);

  async function loadStatus(targetPublicId: string): Promise<void> {
    const normalized = normalizePublicId(targetPublicId);
    if (!normalized) return;

    setStatusError(null);
    setStatusLoading(true);

    try {
      const response = await fetch(`/api/forms/registration/${encodeURIComponent(normalized)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const body = (await response.json().catch(() => null)) as RegistrationStatusResponse | ErrorBody | null;

      if (!response.ok || !body || typeof body !== 'object' || !('status' in body)) {
        throw new Error(readErrorMessage(body, 'Unable to load registration status.'));
      }

      setPublicId(normalized);
      setStatusRecord(body as RegistrationStatusResponse);
      if (typeof window !== 'undefined') {
        const nextUrl = `${window.location.pathname}?id=${encodeURIComponent(normalized)}`;
        window.history.replaceState({}, '', nextUrl);
      }
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Unable to load registration status.');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleRegistrationSubmit(eventSubmit: FormEvent<HTMLFormElement>): Promise<void> {
    eventSubmit.preventDefault();

    setRegistrationError(null);
    setRegistrationSubmitting(true);

    const payload: RegistrationSubmissionRequest = {
      eventId: event.id,
      name: registrationForm.name,
      email: registrationForm.email,
      ...(registrationForm.participantCount
        ? { participantCount: Number(registrationForm.participantCount) }
        : {}),
      ...(registrationForm.instrument.trim() ? { instrument: registrationForm.instrument } : {}),
      ...(registrationForm.ageGroup.trim() ? { ageGroup: registrationForm.ageGroup } : {}),
      contactPreferences: {
        email: registrationForm.prefEmail,
        sms: registrationForm.prefSms,
        phone: registrationForm.prefPhone,
        ...(registrationForm.preferredChannel
          ? { preferredChannel: registrationForm.preferredChannel }
          : {}),
      },
    };

    try {
      const response = await fetch('/api/forms/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as RegistrationSubmissionResponse | ErrorBody | null;

      if (!response.ok || !body || typeof body !== 'object' || !('publicId' in body) || !('status' in body)) {
        throw new Error(readErrorMessage(body, 'Unable to submit registration.'));
      }

      const nextStatus = body as RegistrationSubmissionResponse;
      setPublicId(nextStatus.publicId);
      setStatusRecord({
        status: nextStatus.status,
        userFacingReason: nextStatus.userFacingReason || null,
      });

      if (typeof window !== 'undefined') {
        const nextUrl = `${window.location.pathname}?id=${encodeURIComponent(nextStatus.publicId)}`;
        window.history.replaceState({}, '', nextUrl);
      }
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : 'Unable to submit registration.');
    } finally {
      setRegistrationSubmitting(false);
    }
  }

  async function handlePaymentConfirmationSubmit(
    eventSubmit: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    eventSubmit.preventDefault();
    if (!publicId) return;

    setPaymentError(null);
    setPaymentSubmitting(true);

    const payload: PaymentConfirmationRequest = {
      payerName: paymentForm.payerName,
      paymentMethod: paymentForm.paymentMethod,
      amount: Number(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      ...(paymentForm.referenceNote.trim() ? { referenceNote: paymentForm.referenceNote } : {}),
    };

    try {
      const response = await fetch(
        `/api/forms/registration/${encodeURIComponent(publicId)}/payment-confirmation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const body = (await response.json().catch(() => null)) as RegistrationStatusResponse | ErrorBody | null;

      if (!response.ok || !body || typeof body !== 'object' || !('status' in body)) {
        throw new Error(readErrorMessage(body, 'Unable to submit payment confirmation.'));
      }

      setStatusRecord(body as RegistrationStatusResponse);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'Unable to submit payment confirmation.',
      );
    } finally {
      setPaymentSubmitting(false);
    }
  }

  if (!event.registrationRequired) {
    return (
      <section
        style={{
          border: '1px solid var(--ui-color-border)',
          borderRadius: '10px',
          padding: '18px',
        }}
      >
        <p style={{ margin: 0 }}>This event does not currently require registration.</p>
      </section>
    );
  }

  return (
    <section style={{ display: 'grid', gap: '20px' }}>
      <PublicIdLookup
        defaultValue={initialPublicId}
        onLoad={(id) => {
          void loadStatus(id);
        }}
        disabled={statusLoading || registrationSubmitting || paymentSubmitting}
      />

      {!publicId ? (
        <form
          onSubmit={(eventSubmit) => {
            void handleRegistrationSubmit(eventSubmit);
          }}
          style={{
            border: '1px solid var(--ui-color-border)',
            borderRadius: '12px',
            padding: '22px',
            display: 'grid',
            gap: '14px',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '2px' }}>Register</h2>
          <p style={{ marginTop: 0, color: 'var(--ui-color-text-muted)' }}>
            {event.paymentRequired
              ? 'Registration received. Check back here or your email for payment instructions.'
              : 'Submit your registration to receive your status ID.'}
          </p>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Name</span>
            <input
              required
              value={registrationForm.name}
              onChange={(eventChange) =>
                setRegistrationForm((prev) => ({ ...prev, name: eventChange.target.value }))
              }
              style={{
                borderRadius: '8px',
                border: '1px solid var(--ui-color-border)',
                padding: '10px 12px',
                fontSize: '15px',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Email</span>
            <input
              type="email"
              required
              value={registrationForm.email}
              onChange={(eventChange) =>
                setRegistrationForm((prev) => ({ ...prev, email: eventChange.target.value }))
              }
              style={{
                borderRadius: '8px',
                border: '1px solid var(--ui-color-border)',
                padding: '10px 12px',
                fontSize: '15px',
              }}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Participant count</span>
              <input
                type="number"
                min={1}
                step={1}
                value={registrationForm.participantCount}
                onChange={(eventChange) =>
                  setRegistrationForm((prev) => ({
                    ...prev,
                    participantCount: eventChange.target.value,
                  }))
                }
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                  padding: '10px 12px',
                  fontSize: '15px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Instrument</span>
              <input
                value={registrationForm.instrument}
                onChange={(eventChange) =>
                  setRegistrationForm((prev) => ({ ...prev, instrument: eventChange.target.value }))
                }
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                  padding: '10px 12px',
                  fontSize: '15px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Age group</span>
              <input
                value={registrationForm.ageGroup}
                onChange={(eventChange) =>
                  setRegistrationForm((prev) => ({ ...prev, ageGroup: eventChange.target.value }))
                }
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                  padding: '10px 12px',
                  fontSize: '15px',
                }}
              />
            </label>
          </div>

          <fieldset
            style={{
              border: '1px solid var(--ui-color-border)',
              borderRadius: '8px',
              padding: '12px',
              display: 'grid',
              gap: '10px',
            }}
          >
            <legend style={{ padding: '0 6px' }}>Contact preferences</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={registrationForm.prefEmail}
                  onChange={(eventChange) =>
                    setRegistrationForm((prev) => ({ ...prev, prefEmail: eventChange.target.checked }))
                  }
                />{' '}
                Email
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={registrationForm.prefSms}
                  onChange={(eventChange) =>
                    setRegistrationForm((prev) => ({ ...prev, prefSms: eventChange.target.checked }))
                  }
                />{' '}
                SMS
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={registrationForm.prefPhone}
                  onChange={(eventChange) =>
                    setRegistrationForm((prev) => ({ ...prev, prefPhone: eventChange.target.checked }))
                  }
                />{' '}
                Phone
              </label>
            </div>
            <label style={{ display: 'grid', gap: '6px', maxWidth: '260px' }}>
              <span>Preferred channel</span>
              <select
                value={registrationForm.preferredChannel}
                onChange={(eventChange) =>
                  setRegistrationForm((prev) => ({
                    ...prev,
                    preferredChannel: eventChange.target.value as 'email' | 'sms' | 'phone',
                  }))
                }
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                  padding: '10px 12px',
                  fontSize: '15px',
                }}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone">Phone</option>
              </select>
            </label>
          </fieldset>

          {registrationError ? (
            <p role="alert" style={{ margin: 0, color: '#b91c1c', fontWeight: 600 }}>
              {registrationError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={registrationSubmitting}
            className="btn-primary"
            style={{ width: 'auto' }}
          >
            {registrationSubmitting ? 'Submitting...' : 'Submit registration'}
          </button>
        </form>
      ) : null}

      {statusLoading ? <p>Loading status...</p> : null}

      {statusError ? (
        <p role="alert" style={{ margin: 0, color: '#b91c1c', fontWeight: 600 }}>
          {statusError}
        </p>
      ) : null}

      {statusRecord ? (
        <div
          ref={statusBoxRef}
          role="status"
          aria-live="polite"
          tabIndex={-1}
          style={{
            border: '1px solid var(--ui-color-border)',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: 'var(--ui-color-section-alt)',
            display: 'grid',
            gap: '10px',
            outline: 'none',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '22px' }}>Registration Status</h2>
          <p style={{ margin: 0 }}>
            <strong>ID:</strong> {publicId}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Current state:</strong> {statusRecord.status.replace(/_/g, ' ')}
          </p>
          <p style={{ margin: 0, color: 'var(--ui-color-text-muted)' }}>{statusMessage}</p>

          {statusHref ? (
            <p style={{ margin: 0 }}>
              Bookmark this status link:{' '}
              <Link href={statusHref}>{statusHref}</Link>
            </p>
          ) : null}

          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto' }}
            onClick={() => {
              if (!publicId) return;
              void loadStatus(publicId);
            }}
            disabled={statusLoading}
          >
            Refresh status
          </button>
        </div>
      ) : null}

      {showPaymentStep ? (
        <section
          style={{
            border: '1px solid var(--ui-color-border)',
            borderRadius: '12px',
            padding: '20px',
            display: 'grid',
            gap: '14px',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '2px' }}>Payment Confirmation</h2>
          {event.paymentReferenceFormat ? (
            <p style={{ margin: 0 }}>
              <strong>Reference format:</strong> {event.paymentReferenceFormat}
            </p>
          ) : null}

          {event.paymentInstructions ? (
            <RichText data={event.paymentInstructions} />
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <p className="section-label" style={{ marginBottom: '8px' }}>
                Zelle payment destination
              </p>
              {event.zelleQr?.url ? (
                <Image
                  src={event.zelleQr.url}
                  alt={event.zelleQr.alt || 'Zelle QR code for event payment'}
                  width={event.zelleQr.width || 500}
                  height={event.zelleQr.height || 500}
                  style={{
                    width: '100%',
                    maxWidth: '260px',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                  }}
                />
              ) : (
                <Image
                  src="/media/qa-media-1.svg"
                  alt="Zelle QR placeholder"
                  width={260}
                  height={260}
                  style={{
                    width: '100%',
                    maxWidth: '260px',
                    height: 'auto',
                    aspectRatio: '1 / 1',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                    backgroundColor: 'var(--ui-color-section-alt)',
                  }}
                />
              )}
            </div>

            <div>
              <p className="section-label" style={{ marginBottom: '8px' }}>
                Venmo payment destination
              </p>
              {event.venmoQr?.url ? (
                <Image
                  src={event.venmoQr.url}
                  alt={event.venmoQr.alt || 'Venmo QR code for event payment'}
                  width={event.venmoQr.width || 500}
                  height={event.venmoQr.height || 500}
                  style={{
                    width: '100%',
                    maxWidth: '260px',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                  }}
                />
              ) : (
                <Image
                  src="/media/qa-media-2.svg"
                  alt="Venmo QR placeholder"
                  width={260}
                  height={260}
                  style={{
                    width: '100%',
                    maxWidth: '260px',
                    height: 'auto',
                    aspectRatio: '1 / 1',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                    backgroundColor: 'var(--ui-color-section-alt)',
                  }}
                />
              )}
            </div>
          </div>

          <form
            onSubmit={(eventSubmit) => {
              void handlePaymentConfirmationSubmit(eventSubmit);
            }}
            style={{ display: 'grid', gap: '12px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Payer name</span>
                <input
                  required
                  value={paymentForm.payerName}
                  onChange={(eventChange) =>
                    setPaymentForm((prev) => ({ ...prev, payerName: eventChange.target.value }))
                  }
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                    padding: '10px 12px',
                    fontSize: '15px',
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Payment method</span>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(eventChange) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      paymentMethod: eventChange.target.value as 'zelle' | 'venmo',
                    }))
                  }
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                    padding: '10px 12px',
                    fontSize: '15px',
                  }}
                >
                  <option value="zelle">Zelle</option>
                  <option value="venmo">Venmo</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Amount</span>
                <input
                  type="number"
                  required
                  min={0.01}
                  step={0.01}
                  value={paymentForm.amount}
                  onChange={(eventChange) =>
                    setPaymentForm((prev) => ({ ...prev, amount: eventChange.target.value }))
                  }
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                    padding: '10px 12px',
                    fontSize: '15px',
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Payment date</span>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(eventChange) =>
                    setPaymentForm((prev) => ({ ...prev, paymentDate: eventChange.target.value }))
                  }
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--ui-color-border)',
                    padding: '10px 12px',
                    fontSize: '15px',
                  }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Reference note (optional)</span>
              <input
                value={paymentForm.referenceNote}
                onChange={(eventChange) =>
                  setPaymentForm((prev) => ({ ...prev, referenceNote: eventChange.target.value }))
                }
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                  padding: '10px 12px',
                  fontSize: '15px',
                }}
              />
            </label>

            {paymentError ? (
              <p role="alert" style={{ margin: 0, color: '#b91c1c', fontWeight: 600 }}>
                {paymentError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={paymentSubmitting}
              className="btn-primary"
              style={{ width: 'auto' }}
            >
              {paymentSubmitting ? 'Submitting...' : 'Submit payment confirmation'}
            </button>
          </form>
        </section>
      ) : null}
    </section>
  );
}
