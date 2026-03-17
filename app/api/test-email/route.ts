import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Auth check - only logged in users can send test emails
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { to } = await request.json()
    if (!to) return NextResponse.json({ error: 'Missing "to" email address' }, { status: 400 })

    const RESEND_KEY = process.env.RESEND_API_KEY
    if (!RESEND_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY no está configurada en las variables de entorno' }, { status: 500 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Test Mailing <onboarding@resend.dev>',
        to: [to],
        subject: '✅ Email de prueba — Servicio funcionando',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
            <h2 style="color:#67b960;margin-bottom:8px;">✅ ¡El servicio de email funciona!</h2>
            <p style="color:#555;">Este es un email de prueba enviado desde tu plataforma de mailing.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#999;font-size:13px;">
              Enviado a: <strong>${to}</strong><br/>
              Usuario: <strong>${user.email}</strong><br/>
              Fecha: <strong>${new Date().toLocaleString('es-AR')}</strong>
            </p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.message || data.name || 'Error de Resend', details: data }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
