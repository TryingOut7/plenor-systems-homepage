import { NextRequest, NextResponse } from 'next/server';
import { sendGuideEmail } from '@/lib/email';
import { logGuideSubmission } from '@/lib/db';

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

    // Persist to DB
    try {
      await logGuideSubmission(entry.name, entry.email);
    } catch {
      console.error('DB log failed for guide submission — entry:', JSON.stringify(entry));
    }

    // Send guide delivery email via Resend
    await sendGuideEmail({ name: entry.name, email: entry.email });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Guide form error:', err);
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 });
  }
}
