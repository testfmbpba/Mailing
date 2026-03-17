import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, Download, Mail, MousePointerClick, AlertCircle, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import ExportButton from './ExportButton'

const statusLabels: Record<string, string> = {
  draft: 'Borrador', scheduled: 'Programado', sending: 'Enviando',
  sent: 'Enviado', failed: 'Fallido', paused: 'Pausado'
}
const statusClass: Record<string, string> = {
  draft: 'badge-draft', scheduled: 'badge-scheduled', sending: 'badge-sending',
  sent: 'badge-sent', failed: 'badge-failed', paused: 'badge-paused'
}
const emailStatusClass: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600', sent: 'bg-blue-100 text-blue-600',
  delivered: 'bg-cyan-100 text-cyan-700', opened: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600', bounced: 'bg-orange-100 text-orange-700',
}

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, email_templates(name, subject), contact_lists(name)')
    .eq('id', params.id)
    .single()

  if (!campaign) notFound()

  const { data: logs, count } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact' })
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const openRate = campaign.sent_count > 0
    ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1)
    : '0'
  const failRate = campaign.total_recipients > 0
    ? ((campaign.failed_count / campaign.total_recipients) * 100).toFixed(1)
    : '0'

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/campaigns" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${statusClass[campaign.status]}`}>
              {statusLabels[campaign.status]}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Template: <strong>{campaign.email_templates?.name}</strong> · Lista: <strong>{campaign.contact_lists?.name}</strong>
          </p>
        </div>
        <ExportButton campaignId={params.id} campaignName={campaign.name} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{campaign.total_recipients.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Enviados</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{campaign.sent_count.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-[#67b960]" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Abiertos</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{campaign.opened_count.toLocaleString()}</div>
          <div className="text-sm text-[#67b960] font-medium mt-1">{openRate}% tasa</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Fallidos</span>
          </div>
          <div className="font-display text-3xl font-bold text-gray-900">{campaign.failed_count.toLocaleString()}</div>
          <div className="text-sm text-red-400 font-medium mt-1">{failRate}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-5 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso del envío</span>
          <span>{campaign.sent_count} / {campaign.total_recipients}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#67b960] to-[#4ea1ee] rounded-full transition-all"
            style={{ width: campaign.total_recipients > 0 ? `${(campaign.sent_count / campaign.total_recipients) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex gap-6 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#67b960]" /> Abiertos: {campaign.opened_count}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Enviados: {campaign.sent_count}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Fallidos: {campaign.failed_count}</span>
          {campaign.scheduled_at && (
            <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" /> Programado: {formatDate(campaign.scheduled_at)}</span>
          )}
        </div>
      </div>

      {/* Logs table */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-semibold text-gray-900">
            Detalle por destinatario
            {count && <span className="text-gray-400 text-base font-normal ml-2">({count} registros)</span>}
          </h2>
        </div>
        {(!logs || logs.length === 0) ? (
          <div className="p-12 text-center text-gray-400">Sin registros de envío aún</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Estado</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Enviado</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Abierto</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log: { id: string; email: string; status: string; sent_at: string | null; opened_at: string | null; error_message: string | null }) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-700">{log.email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${emailStatusClass[log.status]}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-gray-400">{formatDate(log.sent_at)}</td>
                    <td className="px-6 py-3 text-right text-xs text-[#67b960] font-medium">{formatDate(log.opened_at)}</td>
                    <td className="px-6 py-3 text-xs text-red-400 max-w-48 truncate">{log.error_message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
