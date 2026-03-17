import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="mb-6 p-3 bg-[#4ea1ee]/10 rounded-xl border border-[#4ea1ee]/20 text-sm text-[#4ea1ee] font-medium flex items-center gap-2">
            🛡️ Panel de Administración
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
