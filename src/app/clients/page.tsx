'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, X, Building2, FolderOpen, Users } from 'lucide-react'
import { ClientAccount } from '@/types'

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (data.success) {
        setClients(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail) return
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail }),
      })
      if (!res.ok) throw new Error('Failed to create client')
      setNewName('')
      setNewEmail('')
      setShowNewForm(false)
      await fetchClients()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create client')
    } finally {
      setSaving(false)
    }
  }

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Clients</h1>
              <p className="text-gray-400 mt-2">Manage client portals, assets, and brand materials</p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="btn-glass flex items-center space-x-2 text-white"
            >
              <Plus size={20} />
              <span>New Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 glass-input rounded-xl"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading clients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            {clients.length === 0 ? (
              <>
                <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">No clients yet</p>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="btn-glass inline-flex items-center space-x-2 text-white"
                >
                  <Plus size={20} />
                  <span>Add your first client</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-2">No clients match &ldquo;{search}&rdquo;</p>
                <button
                  onClick={() => setSearch('')}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((client) => {
              const activeProjects = client.projects?.filter(p => p.status === 'ACTIVE').length || 0
              const totalProjects = client.projects?.length || 0
              const totalTasks = client.projects?.reduce((sum, p) => sum + ((p as any).tasks?.length || 0), 0) || 0
              const contactCount = client.contacts?.length || 0

              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="glass-card p-6 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-indigo-500/20">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition truncate">
                        {client.name}
                      </h3>
                      <p className="text-gray-500 text-sm truncate">{client.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <FolderOpen size={16} className="mx-auto text-blue-400 mb-1" />
                      <p className="text-xs text-gray-500">Projects</p>
                      <p className="font-semibold text-gray-200">{activeProjects}/{totalProjects}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <Building2 size={16} className="mx-auto text-purple-400 mb-1" />
                      <p className="text-xs text-gray-500">Tasks</p>
                      <p className="font-semibold text-gray-200">{totalTasks}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <Users size={16} className="mx-auto text-emerald-400 mb-1" />
                      <p className="text-xs text-gray-500">Contacts</p>
                      <p className="font-semibold text-gray-200">{contactCount}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-modal rounded-2xl w-full max-w-md p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Client</h2>
              <button onClick={() => setShowNewForm(false)} className="p-1.5 hover:bg-white/10 rounded-xl transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Client Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2.5 glass-input rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="contact@acme.com"
                  className="w-full px-3 py-2.5 glass-input rounded-xl"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="btn-glass-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-glass text-white disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
