'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Pencil, Check, X, Search, Users } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Contact {
  id: string
  email: string
  data: Record<string, string>
  created_at: string
}

interface ContactList {
  id: string
  name: string
  columns: string[]
  total_contacts: number
  created_at: string
}

export default function ContactListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [list, setList] = useState<ContactList | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  useEffect(() => {
    loadData()
  }, [id, page])

  async function loadData() {
    setLoading(true)
    const [{ data: listData }, { data: contactsData }] = await Promise.all([
      supabase.from('contact_lists').select('*').eq('id', id).single(),
      supabase.from('contacts').select('*').eq('list_id', id)
        .order('created_at', { ascending: true })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
    ])
    setList(listData)
    setContacts(contactsData || [])
    setLoading(false)
  }

  async function handleDelete(contactId: string) {
    if (!confirm('¿Eliminar este contacto?')) return
    const { error } = await supabase.from('contacts').delete().eq('id', contactId)
    if (error) { toast.error('Error al eliminar'); return }
    setContacts(prev => prev.filter(c => c.id !== contactId))
    // Update count
    await supabase.from('contact_lists').update({ total_contacts: (list?.total_contacts || 1) - 1 }).eq('id', id)
    setList(prev => prev ? { ...prev, total_contacts: prev.total_contacts - 1 } : prev)
    toast.success('Contacto eliminado')
  }

  function startEdit(contact: Contact) {
    setEditingId(contact.id)
    setEditData({ email: contact.email, ...contact.data })
  }

  async function saveEdit(contact: Contact) {
    setSaving(true)
    const { email, ...rest } = editData
    const { error } = await supabase.from('contacts').update({
      email: email || contact.email,
      data: rest,
    }).eq('id', contact.id)
    setSaving(false)
    if (error) { toast.error('Error al guardar'); return }
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, email: email || c.email, data: rest } : c))
    setEditingId(null)
    toast.success('Contacto actualizado')
  }

  const columns = list?.columns || []
  const filtered = contacts.filter(c =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    Object.values(c.data || {}).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/contacts" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-gray-900">{list?.name || 'Lista de contactos'}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <Users className="w-4 h-4" />
            {list?.total_contacts?.toLocaleString() || 0} contactos · Creada el {formatDate(list?.created_at || '')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input-field pl-9"
          placeholder="Buscar por email o cualquier campo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            {search ? 'Sin resultados para tu búsqueda' : 'Sin contactos en esta lista'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {columns.map(col => (
                    <th key={col} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                      {col}
                    </th>
                  ))}
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                    {columns.map(col => (
                      <td key={col} className="px-4 py-3 text-sm">
                        {editingId === contact.id ? (
                          <input
                            className="input-field py-1 text-sm"
                            value={editData[col] ?? ''}
                            onChange={e => setEditData(prev => ({ ...prev, [col]: e.target.value }))}
                          />
                        ) : (
                          <span className="text-gray-700">
                            {col === 'email' ? contact.email : (contact.data?.[col] || '—')}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(contact.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {editingId === contact.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(contact)}
                              disabled={saving}
                              className="text-[#67b960] hover:text-[#4ea1ee] p-1 rounded hover:bg-gray-100"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(contact)}
                              className="text-gray-400 hover:text-[#4ea1ee] p-1 rounded hover:bg-gray-100"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!search && contacts.length === PAGE_SIZE && (
        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="flex items-center text-sm text-gray-500">Página {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
