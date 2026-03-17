'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  campaignId: string
  campaignName: string
  status: string
}

export default function CampaignActions({ campaignId, campaignName, status }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleDelete() {
    if (!confirm(`¿Eliminar la campaña "${campaignName}"? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Error al eliminar'); return }
      toast.success('Campaña eliminada')
      router.refresh()
    } catch {
      toast.error('Error de red')
    } finally {
      setDeleting(false)
    }
  }

  async function handleResend() {
    if (!confirm(`¿Reenviar la campaña "${campaignName}"? Se enviará nuevamente a todos los contactos de la lista.`)) return
    setResending(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/resend`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Error al reenviar'); return }
      toast.success(`Campaña reenviada — ${data.sent} enviados, ${data.failed} fallidos`)
      router.refresh()
    } catch {
      toast.error('Error de red')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      {/* Resend — only for sent/failed campaigns */}
      {(status === 'sent' || status === 'failed') && (
        <button
          onClick={handleResend}
          disabled={resending}
          title="Reenviar campaña"
          className="p-1.5 text-gray-400 hover:text-[#4ea1ee] hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {resending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <RefreshCw className="w-4 h-4" />}
        </button>
      )}

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting || status === 'sending'}
        title={status === 'sending' ? 'No se puede eliminar mientras se está enviando' : 'Eliminar campaña'}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        {deleting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
