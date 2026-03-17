import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import ToggleUserActions from './ToggleUserActions'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Usuarios</h1>
      <p className="text-gray-500 mb-8">Gestioná roles y accesos de los usuarios</p>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Usuario</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Rol</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Registro</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(users || []).map((u: { id: string; full_name: string | null; email: string | null; role: string; active: boolean; created_at: string }) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#67b960]/10 flex items-center justify-center text-sm font-medium text-[#67b960]">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{u.full_name || 'Sin nombre'}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-[#4ea1ee]/10 text-[#4ea1ee]' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-gray-400">{formatDate(u.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <ToggleUserActions userId={u.id} currentRole={u.role} currentActive={u.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
