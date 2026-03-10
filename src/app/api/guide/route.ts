import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendGuideEmail } from '@/lib/email';
import { logGuideSubmission } from '@/lib/db';

const LOG_PATH = path.join(process.cwd(), 'data', 'guide_submissions.json');

function ensureLogFile() {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, '[]', 'utf8');
}

function appendSubmission(entry: Record<string, string>) {
  ensureLogFile();
  const raw = fs.readFileSync(LOG_PATH, 'utf8');
  const log: unknown[] = JSON.parse(raw);
  log.push(entry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body as { name?: string; email?: string };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'A valid email address is required.' }, { status: 400 });
    }

    const entry = {
      type: 'guide',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      submittedAt: new Date().toISOString(),
    };

    // Persist to DB (production) with file fallback (local dev)
    try {
      await logGuideSubmission(entry.name, entry.email);
    } catch {
      // DB unavailable — fall back to file log
      try { appendSubmission(entry); } catch { /* non-fatal */ }
      console.error('DB log failed for guide submission');
    }

    // Send guide delivery email via Resend
    await sendGuideEmail({ name: entry.name, email: entry.email });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Guide form error:', err);
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 });
  }
}
