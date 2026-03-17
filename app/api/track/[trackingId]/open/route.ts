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
    // Atomic update: only succeeds if opened_at is still null
    const { data: updatedLog } = await supabase
      .from('email_logs')
      .update({ 
        status: 'opened', 
        opened_at: new Date().toISOString() 
      })
      .eq('tracking_id', params.trackingId)
      .is('opened_at', null)
      .select('campaign_id')
      .single()

    if (updatedLog) {
      // Only increment if we were the ones who actually marked it as opened
      await supabase.rpc('increment_opened_count', { campaign_id: updatedLog.campaign_id })
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
