'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function DeleteTemplateButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('¿Eliminar este template?')) return
    const supabase = createClient()
    const { error } = await supabase.from('email_templates').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else { toast.success('Template eliminado'); router.refresh() }
  }

  return (
    <button onClick={handleDelete} className="text-xs text-red-500 hover:underline font-medium flex items-center gap-1">
      <Trash2 className="w-3 h-3" />
    </button>
  )
}
