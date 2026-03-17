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
    // Using a more explicit join and returning all matches for the email
    const { data: logs, error } = await service
      .from('email_logs')
      .select(`
        *,
        campaigns:campaign_id (
          id,
          name,
          user_id
        )
      `)
      .eq('email', email)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filter by ownership if not admin
    // We check if campaign object exists and belongs to the user
    const filteredLogs = isAdmin 
      ? logs 
      : logs?.filter((log: any) => log.campaigns && log.campaigns.user_id === user.id)

    return NextResponse.json(filteredLogs || [])
  } catch (err) {
    console.error('History API Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
