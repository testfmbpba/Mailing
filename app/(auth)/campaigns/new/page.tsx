'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Send, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewCampaignPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [contactLists, setContactLists] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    template_id: '',
    contact_list_id: '',
    from_name: '',
    from_email: 'onboarding@resend.dev',
    reply_to: '',
    schedule: false,
    scheduled_at: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: t }, { data: c }] = await Promise.all([
        supabase.from('email_templates').select('id, name').eq('user_id', user!.id),
        supabase.from('contact_lists').select('id, name, total_contacts').eq('user_id', user!.id),
      ])
      setTemplates(t || [])
      setContactLists(c || [])
    }
    load()
  }, [])

  async function handleSave(sendNow: boolean) {
    if (!form.name || !form.template_id || !form.contact_list_id || !form.from_name || !form.from_email) {
      toast.error('Completá todos los campos requeridos')
      return
    }
    if (form.schedule && !form.scheduled_at) {
      toast.error('Seleccioná fecha y hora de envío')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const list = contactLists.find(l => l.id === form.contact_list_id)

    const { data: campaign, error } = await supabase.from('campaigns').insert({
      user_id: user!.id,
      name: form.name,
      template_id: form.template_id,
      contact_list_id: form.contact_list_id,
      from_name: form.from_name,
      from_email: form.from_email,
      reply_to: form.reply_to || null,
      status: sendNow ? 'sending' : (form.schedule ? 'scheduled' : 'draft'),
      scheduled_at: form.schedule ? form.scheduled_at : null,
      total_recipients: list?.total_contacts || 0,
      sent_count: 0,
      opened_count: 0,
      failed_count: 0,
    }).select().single()

    if (error || !campaign) {
      toast.error('Error al crear la campaña')
      setLoading(false)
      return
    }

    if (sendNow) {
      // Trigger send via API route
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id }),
      })
      if (!res.ok) toast.error('Error al iniciar el envío, pero la campaña fue creada.')
      else toast.success('Envío iniciado correctamente')
    } else {
      toast.success(form.schedule ? 'Campaña programada' : 'Campaña guardada como borrador')
    }

    router.push('/campaigns')
  }

  const f = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/campaigns" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Nueva campaña</h1>
          <p className="text-gray-500 mt-1">Configurá tu envío de email</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* General */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display text-lg font-semibold text-gray-900">Información general</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la campaña *</label>
              <input className="input-field" value={form.name} onChange={e => f('name', e.target.value)} placeholder="Ej: Newsletter enero 2025" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Template *</label>
                <select className="input-field" value={form.template_id} onChange={e => f('template_id', e.target.value)}>
                  <option value="">Seleccioná un template</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lista de contactos *</label>
                <select className="input-field" value={form.contact_list_id} onChange={e => f('contact_list_id', e.target.value)}>
                  <option value="">Seleccioná una lista</option>
                  {contactLists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.total_contacts} contactos)</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Sender */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display text-lg font-semibold text-gray-900">Remitente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del remitente *</label>
                <input className="input-field" value={form.from_name} onChange={e => f('from_name', e.target.value)} placeholder="Empresa SA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email remitente *</label>
                <input className="input-field" type="email" value={form.from_email} onChange={e => f('from_email', e.target.value)} placeholder="noreply@empresa.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reply-to (opcional)</label>
              <input className="input-field" type="email" value={form.reply_to} onChange={e => f('reply_to', e.target.value)} placeholder="contacto@empresa.com" />
            </div>
          </div>

          {/* Schedule */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" id="schedule" checked={form.schedule} onChange={e => f('schedule', e.target.checked)} className="w-4 h-4 accent-[#67b960]" />
              <label htmlFor="schedule" className="font-medium text-gray-900 flex items-center gap-2 cursor-pointer">
                <Clock className="w-4 h-4 text-gray-400" /> Programar envío
              </label>
            </div>
            {form.schedule && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha y hora de envío *</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.scheduled_at}
                  onChange={e => f('scheduled_at', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-medium text-gray-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Procesando...' : 'Enviar ahora'}
              </button>
              {form.schedule ? (
                <button onClick={() => handleSave(false)} disabled={loading} className="btn-accent w-full justify-center">
                  <Clock className="w-4 h-4" /> Programar
                </button>
              ) : (
                <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary w-full justify-center">
                  Guardar borrador
                </button>
              )}
              <Link href="/campaigns" className="btn-secondary w-full justify-center">
                Cancelar
              </Link>
            </div>
          </div>

          {form.contact_list_id && (
            <div className="card p-5 bg-blue-50 border-blue-100">
              <p className="text-sm text-blue-700 font-medium">
                {contactLists.find(l => l.id === form.contact_list_id)?.total_contacts.toLocaleString()} destinatarios seleccionados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
