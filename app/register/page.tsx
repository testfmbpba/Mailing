'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('¡Cuenta creada! Revisá tu email para confirmar.')
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 grid-bg">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#67b960] flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-gray-900">MailingBP</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mb-8">Completá tus datos para empezar</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Juan García"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field pl-10" placeholder="tu@empresa.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input-field pl-10" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-[#67b960] hover:underline font-medium">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
