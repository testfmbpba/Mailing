import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: logs } = await supabase
    .from('email_logs')
    .select('email, status, sent_at, opened_at, error_message')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: true })

  const exportData = (logs || []).map(l => ({
    Email: l.email,
    Estado: l.status,
    'Fecha envío': l.sent_at ? new Date(l.sent_at).toLocaleString('es-AR') : '',
    'Fecha apertura': l.opened_at ? new Date(l.opened_at).toLocaleString('es-AR') : '',
    'Error': l.error_message || '',
  }))

  return NextResponse.json(exportData)
}
