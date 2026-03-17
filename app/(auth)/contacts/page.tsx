'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Users, Trash2, Eye, Plus, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import * as XLSX from 'xlsx'

interface ContactList {
  id: string
  name: string
  total_contacts: number
  columns: string[]
  created_at: string
}

export default function ContactsPage() {
  const [lists, setLists] = useState<ContactList[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [parsedData, setParsedData] = useState<{ columns: string[], rows: Record<string, string>[] } | null>(null)
  const [fileName, setFileName] = useState('')

  const supabase = createClient()

  useState(() => {
    loadLists()
  })

  async function loadLists() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('contact_lists').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
    setLists(data || [])
    setLoading(false)
  }

  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
        if (rows.length === 0) { toast.error('El archivo está vacío'); return }
        const columns = Object.keys(rows[0])
        if (!columns.includes('email') && !columns.includes('Email') && !columns.includes('EMAIL')) {
          toast.error('El archivo debe tener una columna "email"')
          return
        }
        setParsedData({ columns, rows })
        setShowForm(true)
        toast.success(`${rows.length} contactos detectados`)
      } catch {
        toast.error('Error al leer el archivo. Usá CSV o Excel.')
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1,
  })

  async function handleSaveList() {
    if (!newName || !parsedData) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: list, error } = await supabase.from('contact_lists').insert({
      user_id: user!.id,
      name: newName,
      total_contacts: parsedData.rows.length,
      columns: parsedData.columns,
    }).select().single()

    if (error || !list) { toast.error('Error al crear la lista'); setUploading(false); return }

    // Insert contacts in batches
    const emailKey = parsedData.columns.find((c: string) => c.toLowerCase() === 'email') || 'email'
    const contacts = parsedData.rows.map((row: Record<string, string>) => ({
      list_id: list.id,
      email: row[emailKey],
      data: row,
    }))

    for (let i = 0; i < contacts.length; i += 500) {
      await supabase.from('contacts').insert(contacts.slice(i, i + 500))
    }

    toast.success(`Lista "${newName}" creada con ${parsedData.rows.length} contactos`)
    setShowForm(false)
    setParsedData(null)
    setNewName('')
    loadLists()
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta lista y todos sus contactos?')) return
    await supabase.from('contact_lists').delete().eq('id', id)
    toast.success('Lista eliminada')
    loadLists()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-500 mt-1">Importá y gestioná tus listas de destinatarios</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Importar lista
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-5">Nueva lista de contactos</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la lista</label>
                <input className="input-field" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Clientes diciembre 2024" />
              </div>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-[#67b960] bg-[#67b960]/5' : 'border-gray-200 hover:border-[#67b960]/50'}`}>
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {isDragActive ? 'Soltá el archivo' : fileName ? `📄 ${fileName}` : 'Arrastrá o clickeá para subir CSV / Excel'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Debe tener una columna "email"</p>
              </div>
            </div>
            {parsedData && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa ({parsedData.rows.length} contactos)</p>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto max-h-52">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {parsedData.columns.slice(0, 5).map((c: string) => (
                            <th key={c} className="px-3 py-2 text-left font-medium text-gray-600">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.rows.slice(0, 5).map((row: Record<string, string>, i: number) => (
                          <tr key={i} className="border-t border-gray-100">
                            {parsedData.columns.slice(0, 5).map((c: string) => (
                              <td key={c} className="px-3 py-2 text-gray-600 truncate max-w-24">{row[c]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSaveList} disabled={!newName || !parsedData || uploading} className="btn-primary">
              {uploading ? 'Guardando...' : 'Guardar lista'}
            </button>
            <button onClick={() => { setShowForm(false); setParsedData(null); setFileName('') }} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lists */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : lists.length === 0 ? (
        <div className="card p-16 text-center">
          <Users className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">Sin listas aún</h3>
          <p className="text-gray-400 mb-6">Importá tu primera base de contactos en CSV o Excel</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Importar lista
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lists.map((list: ContactList) => (
            <div key={list.id} className="card p-5 group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-[#4ea1ee]" />
                </div>
                <button onClick={() => handleDelete(list.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">{list.name}</h3>
              <p className="text-sm text-gray-500 mb-3">
                <span className="font-medium text-gray-700">{list.total_contacts.toLocaleString()}</span> contactos
              </p>
              <div className="flex flex-wrap gap-1">
                {(list.columns || []).slice(0, 4).map((c: string) => (
                  <span key={c} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">{formatDate(list.created_at)}</p>
                <Link href={`/contacts/${list.id}`} className="text-xs text-[#4ea1ee] hover:underline font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Ver contactos
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
