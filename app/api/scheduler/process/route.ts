import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// This endpoint is called by a cron job (e.g. Vercel Cron or external scheduler)
// to process campaigns that are due to be sent.
// Configure in vercel.json: { "crons": [{ "path": "/api/scheduler/process", "schedule": "*/5 * * * *" }] }
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date().toISOString()

  // Find scheduled campaigns that are due
  const { data: dueCampaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)

  if (!dueCampaigns || dueCampaigns.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  let processed = 0

  for (const campaign of dueCampaigns) {
    // Mark as sending first
    await supabase.from('campaigns').update({ status: 'sending' }).eq('id', campaign.id)

    // Trigger send (fire and forget in production, use queue)
    fetch(`${baseUrl}/api/campaigns/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaign.id }),
    }).catch(console.error)

    processed++
  }

  return NextResponse.json({ processed })
}
