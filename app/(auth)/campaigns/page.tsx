import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Mail, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CampaignActions from './CampaignActions'

const statusLabels: Record<string, string> = {
  draft: 'Borrador', scheduled: 'Programado', sending: 'Enviando',
  sent: 'Enviado', failed: 'Fallido', paused: 'Pausado'
}
const statusClass: Record<string, string> = {
  draft: 'badge-draft', scheduled: 'badge-scheduled', sending: 'badge-sending',
  sent: 'badge-sent', failed: 'badge-failed', paused: 'badge-paused'
}

export default async function CampaignsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  const query = supabase.from('campaigns')
    .select('*, email_templates(name), contact_lists(name)')
    .order('created_at', { ascending: false })
  if (profile?.role !== 'admin') query.eq('user_id', user!.id)
  const { data: campaigns } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Campañas</h1>
          <p className="text-gray-500 mt-1">Gestioná y monitoreá todos tus envíos</p>
        </div>
        <Link href="/campaigns/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva campaña
        </Link>
      </div>

      {(!campaigns || campaigns.length === 0) ? (
        <div className="card p-16 text-center">
          <Mail className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">Sin campañas</h3>
          <p className="text-gray-400 mb-6">Creá tu primera campaña de email</p>
          <Link href="/campaigns/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Nueva campaña
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Campaña</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Estado</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Template</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Destinatarios</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Abiertos</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Tasa</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Programado</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((c: { id: string; name: string; status: string; from_email: string; total_recipients: number; opened_count: number; sent_count: number; failed_count: number; scheduled_at: string | null; email_templates: { name: string } | null }) => {
                  const delivered = Math.max(0, (c.total_recipients || 0) - (c.failed_count || 0))
                  const rate = delivered > 0 ? Math.min(100, Math.round((c.opened_count / delivered) * 100)) : 0
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.from_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusClass[c.status]}`}>
                          {statusLabels[c.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.email_templates?.name || '—'}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">{c.total_recipients.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">{c.opened_count.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-[#67b960]">{rate}%</td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400">{formatDate(c.scheduled_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 justify-end">
                          <Link href={`/campaigns/${c.id}`} className="text-[#4ea1ee] hover:underline text-sm flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" /> Ver
                          </Link>
                          <CampaignActions
                            campaignId={c.id}
                            campaignName={c.name}
                            status={c.status}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
