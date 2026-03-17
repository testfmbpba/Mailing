import { createClient } from '@/lib/supabase/server'
import { BarChart3, Mail, MousePointerClick, AlertCircle, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

async function getStats(userId: string, isAdmin: boolean) {
  const supabase = createClient()
  const query = supabase.from('campaigns').select('*').order('created_at', { ascending: false })
  if (!isAdmin) query.eq('user_id', userId)

  const { data: campaigns } = await query.limit(5)
  const allQuery = supabase.from('campaigns').select('sent_count, opened_count, failed_count, total_recipients')
  if (!isAdmin) allQuery.eq('user_id', userId)
  const { data: allCampaigns } = await allQuery

const totals = (allCampaigns || []).reduce((acc: { sent: number; opened: number; failed: number; recipients: number }, c: { sent_count: number; opened_count: number; failed_count: number; total_recipients: number }) => ({
    sent: acc.sent + (c.sent_count || 0),
    opened: acc.opened + (c.opened_count || 0),
    failed: acc.failed + (c.failed_count || 0),
    recipients: acc.recipients + (c.total_recipients || 0),
  }), { sent: 0, opened: 0, failed: 0, recipients: 0 })

  return { campaigns: campaigns || [], totals }
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador', scheduled: 'Programado', sending: 'Enviando',
  sent: 'Enviado', failed: 'Fallido', paused: 'Pausado'
}
const statusClass: Record<string, string> = {
  draft: 'badge-draft', scheduled: 'badge-scheduled', sending: 'badge-sending',
  sent: 'badge-sent', failed: 'badge-failed', paused: 'badge-paused'
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user!.id).single()

  const isAdmin = profile?.role === 'admin'
  const { campaigns, totals } = await getStats(user!.id, isAdmin)
  const openRate = totals.sent > 0 ? ((totals.opened / totals.sent) * 100).toFixed(1) : '0'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-gray-500 mt-1">Resumen de tus campañas de email</p>
        </div>
        <Link href="/campaigns/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva campaña
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500">Enviados</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{totals.sent.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <MousePointerClick className="w-4 h-4 text-[#67b960]" />
            </div>
            <span className="text-sm text-gray-500">Abiertos</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{totals.opened.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-sm text-gray-500">Tasa apertura</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{openRate}%</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm text-gray-500">Fallidos</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{totals.failed.toLocaleString()}</div>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-semibold text-gray-900">Campañas recientes</h2>
          <Link href="/campaigns" className="text-sm text-[#4ea1ee] hover:underline font-medium">Ver todas →</Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Todavía no hay campañas.</p>
            <Link href="/campaigns/new" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Crear primera campaña
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Campaña</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Estado</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Enviados</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Abiertos</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Tasa</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((c: any) => {
                  const rate = c.sent_count > 0 ? ((c.opened_count / c.sent_count) * 100).toFixed(0) : '0'
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-[#67b960]">{c.name}</Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusClass[c.status]}`}>
                          {statusLabels[c.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">{c.sent_count.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">{c.opened_count.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-[#67b960]">{rate}%</td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400">{formatDate(c.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
