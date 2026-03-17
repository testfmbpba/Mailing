'use client'

import { useState } from 'react'
import { Search, Mail, Calendar, CheckCircle2, XCircle, Eye, Clock, Loader2 } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface HistoryLog {
  id: string
  campaign_id: string
  status: string
  sent_at: string | null
  opened_at: string | null
  created_at: string
  campaigns: {
    name: string
  }
}

export default function HistoryPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<HistoryLog[]>([])
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch(`/api/contacts/history?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al buscar')
      setLogs(data)
      setSearched(true)
    } catch (err) {
      toast.error(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Historial de Contacto</h1>
        <p className="text-gray-500 mt-1">Hoja de ruta de comunicaciones enviadas a un destinatario</p>
      </div>

      <div className="card p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="buscar@email.com..."
              className="input-field pl-10 h-12"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary h-12 px-8"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
          </button>
        </form>
      </div>

      {searched && (
        <div className="space-y-8 relative before:absolute before:left-4 md:before:left-[31px] before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-100">
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
              No se encontraron envíos para este correo.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="relative pl-12 md:pl-20">
                {/* Dot */}
                <div className={cn(
                  "absolute left-0 md:left-6 top-1 w-8 h-8 rounded-full border-4 border-gray-50 flex items-center justify-center z-10",
                  log.status === 'opened' ? "bg-[#67b960] text-white" : 
                  log.status === 'failed' ? "bg-red-500 text-white" : "bg-blue-400 text-white"
                )}>
                  {log.status === 'opened' ? <Eye className="w-4 h-4" /> : 
                   log.status === 'failed' ? <XCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>

                <div className="card p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-display font-bold text-gray-900 text-lg">
                        {log.campaigns?.name || 'Campaña eliminada'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.created_at)}
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium self-start",
                      log.status === 'opened' ? "bg-[#67b960]/10 text-[#67b960]" :
                      log.status === 'failed' ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {log.status === 'opened' ? 'Abierto' : 
                       log.status === 'sent' ? 'Entregado' : 
                       log.status === 'failed' ? 'Fallido' : log.status}
                    </div>
                  </div>

                  {/* Status Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Enviado</div>
                        <div className="text-xs text-gray-400">{formatDate(log.sent_at || log.created_at)}</div>
                      </div>
                    </div>

                    {log.opened_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#67b960]/10 flex items-center justify-center shrink-0">
                          <Eye className="w-4 h-4 text-[#67b960]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Visualizado</div>
                          <div className="text-xs text-gray-400">{formatDate(log.opened_at)}</div>
                          {log.sent_at && (
                            <div className="flex items-center gap-1 text-[10px] text-[#67b960] font-medium mt-1">
                              <Clock className="w-2.5 h-2.5" />
                              {getTimeDifference(log.sent_at, log.opened_at)} después del envío
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {log.status === 'failed' && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Error</div>
                          <div className="text-xs text-red-400">Verificar logs de campaña</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function getTimeDifference(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''}`
  return 'Inmediatamente'
}
