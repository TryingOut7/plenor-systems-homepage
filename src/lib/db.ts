/**
 * Persistent submission storage via Vercel Postgres.
 *
 * When POSTGRES_URL is set (production / Vercel preview), submissions are
 * written to the database.  When it is not set (local dev without a DB),
 * the functions are no-ops and the file-based fallback in each API route
 * takes over so nothing breaks locally.
 *
 * Setup (one-time, in Vercel dashboard):
 *   1. Go to your Vercel project → Storage → Create Database → Postgres.
 *   2. Vercel will add POSTGRES_URL (and variants) to your project env vars
 *      automatically.  Pull them locally with: `vercel env pull .env.local`
 *   3. Tables are created automatically on the first submission.
 */

import { sql } from '@vercel/postgres';

const DB_AVAILABLE = !!process.env.POSTGRES_URL;

// ── Schema ────────────────────────────────────────────────────────────────────

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS guide_submissions (
      id          SERIAL PRIMARY KEY,
      name        TEXT        NOT NULL,
      email       TEXT        NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS inquiry_submissions (
      id          SERIAL PRIMARY KEY,
      name        TEXT        NOT NULL,
      email       TEXT        NOT NULL,
      company     TEXT        NOT NULL,
      challenge   TEXT        NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function logGuideSubmission(name: string, email: string): Promise<void> {
  if (!DB_AVAILABLE) return;
  await ensureTables();
  await sql`
    INSERT INTO guide_submissions (name, email)
    VALUES (${name}, ${email})
  `;
}

export async function logInquirySubmission(
  name: string,
  email: string,
  company: string,
  challenge: string
): Promise<void> {
  if (!DB_AVAILABLE) return;
  await ensureTables();
  await sql`
    INSERT INTO inquiry_submissions (name, email, company, challenge)
    VALUES (${name}, ${email}, ${company}, ${challenge})
  `;
}
