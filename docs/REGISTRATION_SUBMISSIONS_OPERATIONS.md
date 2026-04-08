# Registration Submissions Operations

This document provides operator SQL snippets for the `registration_submissions` table.

## Data Scope

Stored JSON payloads are intentionally limited to:

- `registration_payload`: `name`, `email`, `participantCount`, `instrument`, `ageGroup`, `contactPreferences`
- `payment_confirmation_payload`: `payerName`, `paymentMethod`, `amount`, `paymentDate`, `referenceNote`

No payment card data is stored.

## Lookup By Public ID

```sql
SELECT
  public_id,
  event_id,
  status,
  registration_payload,
  payment_confirmation_payload,
  user_facing_reason,
  submitted_at,
  updated_at
FROM public.registration_submissions
WHERE public_id = '00000000-0000-0000-0000-000000000000'::uuid;
```

## Lookup By Email

```sql
SELECT
  public_id,
  event_id,
  status,
  registration_payload,
  payment_confirmation_payload,
  submitted_at,
  updated_at
FROM public.registration_submissions
WHERE lower(registration_payload->>'email') = lower('user@example.com')
ORDER BY submitted_at DESC;
```

## Hard Delete By Public ID

Use only for authorized data deletion workflows.

```sql
DELETE FROM public.registration_submissions
WHERE public_id = '00000000-0000-0000-0000-000000000000'::uuid;
```

## Hard Delete By Email

```sql
DELETE FROM public.registration_submissions
WHERE lower(registration_payload->>'email') = lower('user@example.com');
```

## Notes

- `PATCH /v1/admin/registration-submissions/{publicId}` writes audit rows with action `registration_status_update`.
- `public.registration_submissions` currently has no automated retention purge at MVP.
- Recommended alerting: create a Supabase alert for submissions stuck in `payment_pending` for more than 72 hours.

```sql
SELECT
  public_id,
  event_id,
  status,
  submitted_at,
  updated_at
FROM public.registration_submissions
WHERE status = 'payment_pending'
  AND updated_at < NOW() - INTERVAL '72 hours'
ORDER BY updated_at ASC;
```
