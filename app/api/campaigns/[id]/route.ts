import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()

    // Verify ownership (unless admin)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: campaign } = await service.from('campaigns').select('user_id').eq('id', params.id).single()
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (profile?.role !== 'admin' && campaign.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete logs first (FK constraint), then campaign
    await service.from('email_logs').delete().eq('campaign_id', params.id)
    await service.from('campaigns').delete().eq('id', params.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
