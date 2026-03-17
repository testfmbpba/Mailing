'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { extractVariables } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Eye, Code } from 'lucide-react'

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('email_templates').select('*').eq('id', params.id as string).single()
      if (data) { setName(data.name); setSubject(data.subject); setHtmlContent(data.html_content) }
    }
    load()
  }, [params.id])

  const variables = extractVariables(htmlContent + subject)

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('email_templates').update({
      name, subject, html_content: htmlContent, variables,
    }).eq('id', params.id as string)
    if (error) { toast.error('Error al guardar'); setLoading(false) }
    else { toast.success('Template actualizado'); router.push('/templates') }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/templates" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-display text-3xl font-bold text-gray-900">Editar template</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Asunto</label>
              <input className="input-field" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">HTML</span>
              <button onClick={() => setPreview(!preview)} className="flex items-center gap-2 text-sm text-[#4ea1ee] hover:underline">
                {preview ? <><Code className="w-4 h-4" /> Ver código</> : <><Eye className="w-4 h-4" /> Vista previa</>}
              </button>
            </div>
            {preview ? (
              <iframe srcDoc={htmlContent} className="w-full h-96 border-0" title="Preview" sandbox="allow-same-origin" />
            ) : (
              <textarea value={htmlContent} onChange={e => setHtmlContent(e.target.value)} className="w-full h-96 p-4 font-mono text-sm text-gray-800 bg-gray-50 resize-none focus:outline-none border-0" spellCheck={false} />
            )}
          </div>
        </div>
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-medium text-gray-900 mb-3">Variables</h3>
            <div className="flex flex-wrap gap-2">
              {variables.map(v => (
                <span key={v} className="bg-[#67b960]/10 text-[#67b960] text-xs px-2.5 py-1 rounded-full font-medium">{`{{${v}}}`}</span>
              ))}
              {variables.length === 0 && <p className="text-sm text-gray-400">Sin variables detectadas</p>}
            </div>
          </div>
          <button onClick={handleSave} disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Guardando...' : 'Actualizar template'}
          </button>
          <Link href="/templates" className="btn-secondary w-full justify-center py-3">Cancelar</Link>
        </div>
      </div>
    </div>
  )
}
