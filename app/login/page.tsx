'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#67b960] to-[#4ea1ee] p-12 text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-display text-xl font-bold">MailingBP</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
            Tus campañas,<br />bajo control total.
          </h2>
          <p className="text-white/80 text-lg">
            Trackeá cada apertura, programá envíos y gestioná tus listas desde un solo lugar.
          </p>
        </div>
        <div className="text-white/60 text-sm">© 2024 MailingBP</div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#67b960] flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">MailingBP</span>
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h1>
            <p className="text-gray-500 text-sm mb-8">Ingresá tus credenciales para continuar</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input-field pl-10"
                    placeholder="tu@empresa.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-[#67b960] hover:underline font-medium">
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
