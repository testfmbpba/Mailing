import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { replaceVariables, injectTrackingPixel, generateTrackingId } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { campaign_id } = await request.json()
    const service = createServiceClient()

    // Fetch campaign with template and contacts
    const { data: campaign } = await service
      .from('campaigns')
      .select('*, email_templates(*), contact_lists(*)')
      .eq('id', campaign_id)
      .single()

    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    const { data: contacts } = await service
      .from('contacts')
      .select('*')
      .eq('list_id', campaign.contact_list_id)

    if (!contacts || contacts.length === 0) {
      await service.from('campaigns').update({ status: 'sent' }).eq('id', campaign_id)
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const template = campaign.email_templates
    let sent = 0
    let failed = 0

    // Process in batches - send via Resend API
    const RESEND_KEY = process.env.RESEND_API_KEY
    if (!RESEND_KEY) {
      await service.from('campaigns').update({ status: 'failed' }).eq('id', campaign_id)
      return NextResponse.json({ error: 'No email provider configured' }, { status: 500 })
    }

    for (const contact of contacts) {
      const trackingId = generateTrackingId()
      const personalizedHtml = replaceVariables(template.html_content, contact.data || {})
      const finalHtml = injectTrackingPixel(personalizedHtml, trackingId)
      const personalizedSubject = replaceVariables(template.subject, contact.data || {})

      // Insert log first (pending)
      await service.from('email_logs').insert({
        campaign_id,
        contact_id: contact.id,
        email: contact.email,
        status: 'pending',
        tracking_id: trackingId,
      })

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${campaign.from_name} <${campaign.from_email}>`,
            to: [contact.email],
            subject: personalizedSubject,
            html: finalHtml,
            reply_to: campaign.reply_to || undefined,
          }),
        })

        if (res.ok) {
          await service.from('email_logs')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('tracking_id', trackingId)
          sent++
        } else {
          const errData = await res.json()
          await service.from('email_logs')
            .update({ status: 'failed', error_message: errData.message || 'Send error' })
            .eq('tracking_id', trackingId)
          failed++
        }
      } catch (err) {
        await service.from('email_logs')
          .update({ status: 'failed', error_message: String(err) })
          .eq('tracking_id', trackingId)
        failed++
      }
    }

    // Update campaign stats
    await service.from('campaigns').update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: sent,
      failed_count: failed,
    }).eq('id', campaign_id)

    return NextResponse.json({ ok: true, sent, failed })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
