import { type NextRequest, NextResponse } from 'next/server';

// Called daily by Vercel Cron (see vercel.json schedule: "0 3 * * *").
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

  const timestamp = new Date().toISOString();

  // Database backups for Vercel-hosted deployments are handled by Supabase.
  // Enable Point-in-Time Recovery (PITR) on your Supabase Pro plan at:
  // Supabase Dashboard → Project Settings → Database → Backups
  //
  // This endpoint exists as the cron target and logs a heartbeat so you can
  // verify the schedule is firing. Add export-to-Blob logic here if you need
  // application-level snapshots in addition to Supabase PITR.

  console.info({ timestamp, event: 'backup_cron_triggered' }, 'Backup cron fired');

  return NextResponse.json({
    success: true,
    message: 'Backup cron heartbeat recorded. Verify Supabase PITR is enabled.',
    timestamp,
  });
}
