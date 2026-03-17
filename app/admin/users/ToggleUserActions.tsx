'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ToggleUserActions({ userId, currentRole, currentActive }: {
  userId: string
  currentRole: string
  currentActive: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  async function toggleRole() {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) toast.error('Error al cambiar rol')
    else { toast.success(`Rol cambiado a ${newRole}`); router.refresh() }
  }

  async function toggleActive() {
    const { error } = await supabase.from('profiles').update({ active: !currentActive }).eq('id', userId)
    if (error) toast.error('Error al cambiar estado')
    else { toast.success(currentActive ? 'Usuario desactivado' : 'Usuario activado'); router.refresh() }
  }

  return (
    <div className="flex gap-2 justify-end">
      <button onClick={toggleRole} className="text-xs text-[#4ea1ee] hover:underline font-medium">
        {currentRole === 'admin' ? 'Quitar admin' : 'Hacer admin'}
      </button>
      <span className="text-gray-200">|</span>
      <button onClick={toggleActive} className={`text-xs font-medium hover:underline ${currentActive ? 'text-red-500' : 'text-green-600'}`}>
        {currentActive ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  )
}
