'use client'

import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

export default function ExportButton({ campaignId, campaignName }: { campaignId: string, campaignName: string }) {
  async function handleExport() {
    toast.loading('Generando Excel...')
    const res = await fetch(`/api/campaigns/${campaignId}/export`)
    if (!res.ok) { toast.dismiss(); toast.error('Error al exportar'); return }
    const data = await res.json()
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados')
    XLSX.writeFile(wb, `${campaignName.replace(/\s+/g, '_')}_resultados.xlsx`)
    toast.dismiss()
    toast.success('Archivo descargado')
  }

  return (
    <button onClick={handleExport} className="btn-secondary">
      <Download className="w-4 h-4" /> Exportar Excel
    </button>
  )
}
