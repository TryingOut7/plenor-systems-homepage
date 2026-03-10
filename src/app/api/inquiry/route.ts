import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendInquiryEmails } from '@/lib/email';
import { logInquirySubmission } from '@/lib/db';

const LOG_PATH = path.join(process.cwd(), 'data', 'inquiry_submissions.json');

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
    const { name, email, company, challenge } = body as {
      name?: string;
      email?: string;
      company?: string;
      challenge?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'A valid email address is required.' }, { status: 400 });
    }
    if (!company || typeof company !== 'string' || company.trim().length === 0) {
      return NextResponse.json({ message: 'Company name is required.' }, { status: 400 });
    }
    if (!challenge || typeof challenge !== 'string' || challenge.trim().length === 0) {
      return NextResponse.json({ message: 'Please describe your product and challenge.' }, { status: 400 });
    }

    const entry = {
      type: 'inquiry',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      challenge: challenge.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Persist to DB (production) with file fallback (local dev)
    try {
      await logInquirySubmission(entry.name, entry.email, entry.company, entry.challenge);
    } catch {
      try { appendSubmission(entry); } catch { /* non-fatal */ }
      console.error('DB log failed for inquiry submission');
    }

    // Route inquiry to Plenor Systems inbox + send acknowledgment to visitor
    await sendInquiryEmails({
      name: entry.name,
      email: entry.email,
      company: entry.company,
      challenge: entry.challenge,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Inquiry form error:', err);
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 });
  }
}
