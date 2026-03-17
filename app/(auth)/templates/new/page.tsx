'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { extractVariables } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Eye, Code } from 'lucide-react'

export default function NewTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('<html>\n<body>\n  <h1>Hola {{nombre}},</h1>\n  <p>Tu mensaje aquí...</p>\n</body>\n</html>')
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  const variables = extractVariables(htmlContent + subject)

  async function handleSave() {
    if (!name || !subject || !htmlContent) {
      toast.error('Completá todos los campos')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('email_templates').insert({
      user_id: user!.id,
      name,
      subject,
      html_content: htmlContent,
      variables,
    })
    if (error) { toast.error('Error al guardar'); setLoading(false) }
    else { toast.success('Template guardado'); router.push('/templates') }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/templates" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Nuevo template</h1>
          <p className="text-gray-500 mt-1">Creá una plantilla HTML con variables dinámicas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del template</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Bienvenida nuevos clientes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Asunto del email</label>
              <input className="input-field" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej: Hola {{nombre}}, te damos la bienvenida" />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Contenido HTML</span>
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2 text-sm text-[#4ea1ee] hover:underline"
              >
                {preview ? <><Code className="w-4 h-4" /> Ver código</> : <><Eye className="w-4 h-4" /> Vista previa</>}
              </button>
            </div>
            {preview ? (
              <div className="bg-white">
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-96 border-0"
                  title="Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <textarea
                value={htmlContent}
                onChange={e => setHtmlContent(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm text-gray-800 bg-gray-50 resize-none focus:outline-none focus:bg-white transition-colors border-0"
                placeholder="Pegá tu HTML aquí. Usá {{variable}} para variables dinámicas."
                spellCheck={false}
              />
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-medium text-gray-900 mb-3">Variables detectadas</h3>
            {variables.length === 0 ? (
              <p className="text-sm text-gray-400">Usá {'{{nombre}}'} en el HTML para definir variables</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {variables.map(v => (
                  <span key={v} className="bg-[#67b960]/10 text-[#67b960] text-xs px-2.5 py-1 rounded-full font-medium">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-medium text-gray-900 mb-3">Tips</h3>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Usá <code className="bg-gray-100 px-1 rounded text-xs">{'{{nombre}}'}</code> para personalizar</li>
              <li>• Las variables deben coincidir con las columnas de tu base de contactos</li>
              <li>• Siempre incluí un campo <strong>email</strong> en tu base</li>
            </ul>
          </div>

          <button onClick={handleSave} disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Guardando...' : 'Guardar template'}
          </button>
          <Link href="/templates" className="btn-secondary w-full justify-center py-3">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}
