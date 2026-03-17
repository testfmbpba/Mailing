'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Mail, LayoutDashboard, FileText, Users, Clock, BarChart3, Settings, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/contacts', label: 'Contactos', icon: Users },
  { href: '/campaigns', label: 'Campañas', icon: Mail },
  { href: '/scheduler', label: 'Programación', icon: Clock },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={cn(
      'flex flex-col bg-white border-r border-gray-100 transition-all duration-300 relative',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-gray-100', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-lg bg-[#67b960] flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-display text-lg font-bold text-gray-900">MailingBP</span>}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ChevronLeft className="w-3 h-3 text-gray-500" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#67b960]/10 text-[#67b960]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && label}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <Link
            href="/admin/dashboard"
            title={collapsed ? 'Admin' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              pathname.startsWith('/admin')
                ? 'bg-[#4ea1ee]/10 text-[#4ea1ee]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              collapsed && 'justify-center px-2'
            )}
          >
            <Shield className="w-4 h-4 shrink-0" />
            {!collapsed && 'Admin'}
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        {!collapsed && profile && (
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</div>
            <div className="text-xs text-gray-400 truncate">{profile.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  )
}
