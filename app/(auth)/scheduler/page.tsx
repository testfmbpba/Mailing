import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Clock, Calendar, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  draft: 'Borrador', scheduled: 'Programado', sending: 'Enviando',
  sent: 'Enviado', failed: 'Fallido', paused: 'Pausado'
}
const statusClass: Record<string, string> = {
  draft: 'badge-draft', scheduled: 'badge-scheduled', sending: 'badge-sending',
  sent: 'badge-sent', failed: 'badge-failed', paused: 'badge-paused'
}

export default async function SchedulerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  const query = supabase.from('campaigns')
    .select('*, email_templates(name)')
    .not('scheduled_at', 'is', null)
    .order('scheduled_at', { ascending: true })
  if (profile?.role !== 'admin') query.eq('user_id', user!.id)
  const { data: campaigns } = await query

  const upcoming = (campaigns || []).filter((c: any) => c.status === 'scheduled')
  const past = (campaigns || []).filter((c: any) => c.status !== 'scheduled')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Programación</h1>
          <p className="text-gray-500 mt-1">Campañas programadas y enviadas</p>
        </div>
        <Link href="/campaigns/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Programar envío
        </Link>
      </div>

      {/* Upcoming */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#67b960]" /> Próximos envíos
        </h2>
        {upcoming.length === 0 ? (
          <div className="card p-10 text-center">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No hay envíos programados próximamente</p>
            <Link href="/campaigns/new" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Programar campaña
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((c: any) => (
              <div key={c.id} className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#67b960]/10 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#67b960]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-sm text-gray-500">Template: {c.email_templates?.name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-medium text-[#67b960]">{formatDate(c.scheduled_at)}</div>
                  <div className="text-sm text-gray-400">{c.total_recipients.toLocaleString()} destinatarios</div>
                </div>
                <span className={`badge-scheduled inline-flex px-3 py-1 rounded-lg text-xs font-medium`}>Programado</span>
                <Link href={`/campaigns/${c.id}`} className="text-[#4ea1ee] text-sm hover:underline shrink-0">Ver →</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {past.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">Historial programado</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Campaña</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Estado</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Programado</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Enviados</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Abiertos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {past.map((c: any) => {
                  const rate = c.sent_count > 0 ? ((c.opened_count / c.sent_count) * 100).toFixed(0) : '0'
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusClass[c.status]}`}>
                          {statusLabels[c.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-gray-400">{formatDate(c.scheduled_at)}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">{c.sent_count.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-[#67b960]">{rate}%</td>
                      <td className="px-6 py-3 text-right">
                        <Link href={`/campaigns/${c.id}`} className="text-[#4ea1ee] text-sm hover:underline">Ver →</Link>
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
