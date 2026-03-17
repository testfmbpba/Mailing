import { createClient } from '@/lib/supabase/server'
import { Users, Mail, BarChart3, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [
    { count: userCount },
    { count: campaignCount },
    { count: templateCount },
    { data: allCampaigns },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    supabase.from('email_templates').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('sent_count, opened_count, failed_count'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const totals = (allCampaigns || []).reduce((acc: { sent: number; opened: number; failed: number }, c: { sent_count: number | null; opened_count: number | null; failed_count: number | null }) => ({
    sent: acc.sent + (c.sent_count || 0),
    opened: acc.opened + (c.opened_count || 0),
    failed: acc.failed + (c.failed_count || 0),
  }), { sent: 0, opened: 0, failed: 0 })

  const openRate = totals.sent > 0 ? ((totals.opened / totals.sent) * 100).toFixed(1) : '0'

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-blue-400" /><span className="text-xs text-gray-500 uppercase tracking-wide">Usuarios</span></div>
          <div className="font-display text-3xl font-bold text-gray-900">{userCount || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4 text-[#67b960]" /><span className="text-xs text-gray-500 uppercase tracking-wide">Campañas</span></div>
          <div className="font-display text-3xl font-bold text-gray-900">{campaignCount || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-purple-400" /><span className="text-xs text-gray-500 uppercase tracking-wide">Enviados total</span></div>
          <div className="font-display text-3xl font-bold text-gray-900">{totals.sent.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-orange-400" /><span className="text-xs text-gray-500 uppercase tracking-wide">Tasa apertura</span></div>
          <div className="font-display text-3xl font-bold text-gray-900">{openRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-display text-lg font-semibold text-gray-900">Usuarios recientes</h2>
            <Link href="/admin/users" className="text-sm text-[#4ea1ee] hover:underline">Ver todos →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentUsers || []).map((u: { id: string; full_name: string | null; email: string | null; role: string; active: boolean }) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-[#67b960]/10 flex items-center justify-center text-sm font-medium text-[#67b960]">
                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{u.full_name || 'Sin nombre'}</div>
                  <div className="text-xs text-gray-400 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-[#4ea1ee]/10 text-[#4ea1ee]' : 'bg-gray-100 text-gray-500'}`}>
                    {u.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Resumen global</h2>
          <div className="space-y-3">
            {[
              { label: 'Emails enviados', value: totals.sent.toLocaleString(), color: 'bg-blue-500', pct: 100 },
              { label: 'Emails abiertos', value: totals.opened.toLocaleString(), color: 'bg-[#67b960]', pct: totals.sent > 0 ? (totals.opened / totals.sent) * 100 : 0 },
              { label: 'Emails fallidos', value: totals.failed.toLocaleString(), color: 'bg-red-400', pct: totals.sent > 0 ? (totals.failed / totals.sent) * 100 : 0 },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-medium text-gray-900">{s.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${Math.min(s.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
            <span>Templates totales</span>
            <span className="font-medium text-gray-900">{templateCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
