import { NextRequest, NextResponse } from 'next/server';
import { sendInquiryEmails } from '@/lib/email';
import { logInquirySubmission } from '@/lib/db';
import { verifyOrigin } from '@/lib/verify-origin';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const rlError = rateLimit(req);
  if (rlError) return rlError;

  const originError = verifyOrigin(req);
  if (originError) return originError;

  try {
    const body = await req.json();
    const { name, email, company, challenge } = body as {
      name?: string;
      email?: string;
      company?: string;
      challenge?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 200) {
      return NextResponse.json({ message: 'Name is required (max 200 characters).' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'A valid email address is required.' }, { status: 400 });
    }
    if (!company || typeof company !== 'string' || company.trim().length === 0 || company.length > 300) {
      return NextResponse.json({ message: 'Company name is required (max 300 characters).' }, { status: 400 });
    }
    if (!challenge || typeof challenge !== 'string' || challenge.trim().length === 0 || challenge.length > 5000) {
      return NextResponse.json({ message: 'Please describe your product and challenge (max 5000 characters).' }, { status: 400 });
    }

    const entry = {
      type: 'inquiry',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      challenge: challenge.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Persist to DB
    try {
      await logInquirySubmission(entry.name, entry.email, entry.company, entry.challenge);
    } catch {
      console.error('DB log failed for inquiry submission — entry:', JSON.stringify(entry));
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
