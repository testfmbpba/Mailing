import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()

    // Verify ownership
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: campaign } = await service.from('campaigns').select('user_id, status').eq('id', params.id).single()
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (profile?.role !== 'admin' && campaign.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Reset campaign stats and status to draft so send route processes it fresh
    await service.from('campaigns').update({
      status: 'draft',
      sent_count: 0,
      opened_count: 0,
      failed_count: 0,
      sent_at: null,
    }).eq('id', params.id)

    // Delete previous logs so they don't interfere
    await service.from('email_logs').delete().eq('campaign_id', params.id)

    // Trigger the send
    // Trigger the send
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`
    const sendRes = await fetch(`${baseUrl}/api/campaigns/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Forward cookies for authentication in the internal call
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ campaign_id: params.id }),
    })

    const data = await sendRes.json()
    if (!sendRes.ok) {
      console.error('Send trigger failed:', data)
      return NextResponse.json({ error: data.error || 'Send failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ...data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
