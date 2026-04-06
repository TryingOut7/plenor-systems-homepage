import { type NextRequest, NextResponse } from 'next/server';
import { processOutboxTick } from '@/infrastructure/integrations/outboxService';

// Called every 5 minutes by Vercel Cron (see vercel.json schedule: "*/5 * * * *").
// Requires Vercel Pro plan for sub-hourly schedules.
// maxDuration is set to 60 s (Vercel Pro limit) so outbox processing never hits the
// default 10 s serverless function timeout on cold starts or large batches.
// Vercel Cron sends an Authorization header with CRON_SECRET to verify the call is from Vercel.
// See: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export const maxDuration = 60;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');

  if (process.env.NODE_ENV === 'production') {
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const { processed, failed } = await processOutboxTick();
    return NextResponse.json({ success: true, processed, failed });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[outbox-tick] processOutboxTick threw unexpectedly.', { error: message });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
