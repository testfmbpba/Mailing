import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(
  request: Request,
  { params }: { params: { trackingId: string } }
) {
  try {
    const supabase = createServiceClient()
    const { data: log } = await supabase
      .from('email_logs')
      .select('id, campaign_id, opened_at, status')
      .eq('tracking_id', params.trackingId)
      .single()

    if (log && !log.opened_at) {
      const now = new Date().toISOString()
      // Update log
      await supabase
        .from('email_logs')
        .update({ status: 'opened', opened_at: now })
        .eq('id', log.id)

      // Increment campaign opened_count
      await supabase.rpc('increment_opened_count', { campaign_id: log.campaign_id })
    }
  } catch {}

  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
}
