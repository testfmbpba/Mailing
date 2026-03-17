import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, Calendar, Variable } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteTemplateButton from './DeleteTemplateButton'

export default async function TemplatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  const query = supabase.from('email_templates').select('*').order('created_at', { ascending: false })
  if (profile?.role !== 'admin') query.eq('user_id', user!.id)
  const { data: templates } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">Gestioná tus plantillas de email HTML</p>
        </div>
        <Link href="/templates/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo template
        </Link>
      </div>

      {(!templates || templates.length === 0) ? (
        <div className="card p-16 text-center">
          <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">Sin templates aún</h3>
          <p className="text-gray-400 mb-6">Subí tu primer template HTML para empezar a enviar campañas</p>
          <Link href="/templates/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Crear template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t: { id: string; name: string; subject: string; variables: string[] | null; created_at: string }) => (
            <div key={t.id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#67b960]/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#67b960]" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/templates/${t.id}/edit`} className="text-xs text-[#4ea1ee] hover:underline font-medium">Editar</Link>
                  <DeleteTemplateButton id={t.id} />
                </div>
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">{t.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-1">Asunto: {t.subject}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Variable className="w-3 h-3" />
                  {(t.variables || []).length} variables
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(t.created_at)}
                </span>
              </div>
              {t.variables && t.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {t.variables.slice(0, 4).map((v: string) => (
                    <span key={v} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {`{{${v}}}`}
                    </span>
                  ))}
                  {t.variables.length > 4 && (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">+{t.variables.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
