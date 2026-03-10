/**
 * Persistent submission storage via Supabase.
 *
 * When SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set, submissions are
 * written to the database. When they are not set (local dev without a DB),
 * the functions are no-ops and the file-based fallback in each API route
 * takes over so nothing breaks locally.
 *
 * Setup (one-time):
 *   1. Create a Supabase project at https://supabase.com
 *   2. In the SQL editor run the CREATE TABLE statements below once.
 *   3. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your env vars
 *      (Vercel dashboard → Settings → Environment Variables, and .env.local).
 *
 * Required tables (run once in Supabase SQL editor):
 *
 *   CREATE TABLE guide_submissions (
 *     id           BIGSERIAL PRIMARY KEY,
 *     name         TEXT        NOT NULL,
 *     email        TEXT        NOT NULL,
 *     submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 *
 *   CREATE TABLE inquiry_submissions (
 *     id           BIGSERIAL PRIMARY KEY,
 *     name         TEXT        NOT NULL,
 *     email        TEXT        NOT NULL,
 *     company      TEXT        NOT NULL,
 *     challenge    TEXT        NOT NULL,
 *     submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 */

import { createClient } from '@supabase/supabase-js';

const DB_AVAILABLE =
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function logGuideSubmission(name: string, email: string): Promise<void> {
  if (!DB_AVAILABLE) return;
  const { error } = await getClient()
    .from('guide_submissions')
    .insert({ name, email });
  if (error) throw new Error(error.message);
}

export async function logInquirySubmission(
  name: string,
  email: string,
  company: string,
  challenge: string
): Promise<void> {
  if (!DB_AVAILABLE) return;
  const { error } = await getClient()
    .from('inquiry_submissions')
    .insert({ name, email, company, challenge });
  if (error) throw new Error(error.message);
}
