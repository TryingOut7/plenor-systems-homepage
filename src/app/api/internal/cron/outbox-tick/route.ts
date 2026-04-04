import { type NextRequest, NextResponse } from 'next/server';
import { processOutboxTick } from '@/infrastructure/integrations/outboxService';

// Called every minute by Vercel Cron (see vercel.json schedule: "* * * * *").
// Vercel Cron sends an Authorization header with CRON_SECRET to verify the call is from Vercel.
// See: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');

  if (process.env.NODE_ENV === 'production') {
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { processed, failed } = await processOutboxTick();

  return NextResponse.json({ success: true, processed, failed });
}
