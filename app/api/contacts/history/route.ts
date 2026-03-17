import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user is admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    const service = createServiceClient()

    // Fetch logs joined with campaigns
    let query = service
      .from('email_logs')
      .select(`
        *,
        campaigns (
          name,
          user_id
        )
      `)
      .eq('email', email)
      .order('created_at', { ascending: false })

    const { data: logs, error } = await query

    if (error) throw error

    // Filter by ownership if not admin
    const filteredLogs = isAdmin 
      ? logs 
      : logs?.filter(log => log.campaigns?.user_id === user.id)

    return NextResponse.json(filteredLogs || [])
  } catch (err) {
    console.error('History API Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
