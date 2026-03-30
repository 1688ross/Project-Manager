'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Mail, Phone, Plus, X,
  FolderOpen, Palette, Download, ExternalLink, Users
} from 'lucide-react'
import { ClientAccount, ClientContact } from '@/types'
import { taskStatusColors, getStatusLabel } from '@/lib/utils'

type Tab = 'projects' | 'contacts' | 'brand' | 'assets'

export default function ClientPortalPage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<ClientAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('projects')

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', role: '', primary: false })
  const [savingContact, setSavingContact] = useState(false)

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`)
      if (!res.ok) throw new Error('Client not found')
      const data = await res.json()
      setClient(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (clientId) fetchClient()
  }, [clientId, fetchClient])

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name) return
    setSavingContact(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (!res.ok) throw new Error('Failed to add contact')
      setContactForm({ name: '', email: '', phone: '', role: '', primary: false })
      setShowContactForm(false)
      await fetchClient()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add contact')
    } finally {
      setSavingContact(false)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Remove this contact?')) return
    try {
      const res = await fetch(`/api/clients/${clientId}/contacts?contactId=${contactId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove contact')
      await fetchClient()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove contact')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading client...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-modal rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-400">{error || 'Client not found'}</p>
          <Link href="/clients" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
            &larr; Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  const activeProjects = client.projects?.filter(p => p.status === 'ACTIVE') || []
  const completedProjects = client.projects?.filter(p => p.status === 'COMPLETED') || []
  const allAssets = client.projects?.flatMap((p: any) => p.assets || []) || []
  const brandGuides = client.branding || []

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'projects', label: 'Projects', count: client.projects?.length || 0 },
    { key: 'contacts', label: 'Contacts', count: client.contacts?.length || 0 },
    { key: 'brand', label: 'Brand Guide', count: brandGuides.length },
    { key: 'assets', label: 'Assets', count: allAssets.length },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-4 transition">
            <ArrowLeft size={14} /> Back to Clients
          </Link>

          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg shadow-indigo-500/20">
              {client.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white">{client.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Mail size={14} /> {client.email}
                </span>
                <span className="flex items-center gap-1">
                  <FolderOpen size={14} /> {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-400 bg-white/5'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* === PROJECTS TAB === */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {/* Active Projects */}
            {activeProjects.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-200 mb-4">Active Projects</h2>
                <div className="grid gap-4">
                  {activeProjects.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="glass-card p-5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white">{project.title}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                          Active
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-400 mb-3">{project.description}</p>
                      )}
                      {project.tasks && project.tasks.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.tasks.map((task: any) => {
                            const colors = taskStatusColors[task.status] || taskStatusColors.TODO
                            return (
                              <span
                                key={task.id}
                                className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                              >
                                {getStatusLabel(task.status)}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Projects */}
            {completedProjects.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-500 mb-4">Completed Projects</h2>
                <div className="grid gap-3">
                  {completedProjects.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="glass-subtle rounded-xl p-4 opacity-70 hover:opacity-100 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-300">{project.title}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400">
                          Completed
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(client.projects?.length || 0) === 0 && (
              <div className="text-center py-12">
                <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">No projects linked to this client yet.</p>
              </div>
            )}
          </div>
        )}

        {/* === CONTACTS TAB === */}
        {activeTab === 'contacts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-200">Client Contacts</h2>
              <button
                onClick={() => setShowContactForm(true)}
                className="btn-glass flex items-center gap-2 text-white"
              >
                <Plus size={16} /> Add Contact
              </button>
            </div>

            {client.contacts && client.contacts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {client.contacts.map((contact: ClientContact) => (
                  <div key={contact.id} className="glass-card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 font-medium shrink-0">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{contact.name}</h3>
                            {contact.primary && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">Primary</span>
                            )}
                          </div>
                          {contact.role && (
                            <p className="text-sm text-gray-400">{contact.role}</p>
                          )}
                          <div className="flex flex-col gap-0.5 mt-2 text-sm text-gray-400">
                            {contact.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail size={13} /> {contact.email}
                              </span>
                            )}
                            {contact.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone size={13} /> {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition"
                        title="Remove contact"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500 mb-4">No contacts added yet.</p>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="btn-glass inline-flex items-center gap-2 text-white"
                >
                  <Plus size={16} /> Add first contact
                </button>
              </div>
            )}
          </div>
        )}

        {/* === BRAND GUIDE TAB === */}
        {activeTab === 'brand' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-200 mb-6">Brand Guidelines</h2>
            {brandGuides.length > 0 ? (
              <div className="grid gap-6">
                {brandGuides.map((bg: any) => (
                  <div key={bg.id} className="glass-card p-6">
                    {/* Color Palette */}
                    {(bg.primaryColor || bg.secondaryColor || bg.accentColor) && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Color Palette</h3>
                        <div className="flex gap-3">
                          {bg.primaryColor && (
                            <div className="text-center">
                              <div className="w-16 h-16 rounded-lg shadow-inner border" style={{ backgroundColor: bg.primaryColor }}></div>
                              <p className="text-xs text-gray-500 mt-1">Primary</p>
                              <p className="text-xs font-mono text-gray-400">{bg.primaryColor}</p>
                            </div>
                          )}
                          {bg.secondaryColor && (
                            <div className="text-center">
                              <div className="w-16 h-16 rounded-lg shadow-inner border" style={{ backgroundColor: bg.secondaryColor }}></div>
                              <p className="text-xs text-gray-500 mt-1">Secondary</p>
                              <p className="text-xs font-mono text-gray-400">{bg.secondaryColor}</p>
                            </div>
                          )}
                          {bg.accentColor && (
                            <div className="text-center">
                              <div className="w-16 h-16 rounded-lg shadow-inner border" style={{ backgroundColor: bg.accentColor }}></div>
                              <p className="text-xs text-gray-500 mt-1">Accent</p>
                              <p className="text-xs font-mono text-gray-400">{bg.accentColor}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fonts */}
                    {bg.fonts && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Typography</h3>
                        <p className="text-sm text-gray-400">{bg.fonts}</p>
                      </div>
                    )}

                    {/* Logo */}
                    {bg.logo && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Logo</h3>
                        <a href={bg.logo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
                          <Download size={14} /> Download Logo
                        </a>
                      </div>
                    )}

                    {/* Guidelines */}
                    {bg.guidelines && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Guidelines</h3>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{typeof bg.guidelines === 'string' ? bg.guidelines : JSON.stringify(bg.guidelines, null, 2)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">No brand guidelines uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* === ASSETS TAB === */}
        {activeTab === 'assets' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-200 mb-6">Assets &amp; Files</h2>
            {allAssets.length > 0 ? (
              <div className="grid gap-3">
                {allAssets.map((asset: any) => (
                  <div key={asset.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 uppercase shrink-0">
                        {asset.fileType?.split('/').pop()?.substring(0, 4) || 'FILE'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-200 truncate">{asset.name}</p>
                        <p className="text-xs text-gray-500">
                          {asset.category?.replace(/_/g, ' ')} &middot; {(asset.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <a
                      href={asset.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink size={14} /> View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Download size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">No assets uploaded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-modal rounded-2xl w-full max-w-md p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Contact</h2>
              <button onClick={() => setShowContactForm(false)} className="p-1.5 hover:bg-white/10 rounded-xl transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 glass-input rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <input
                  type="text"
                  value={contactForm.role}
                  onChange={e => setContactForm({ ...contactForm, role: e.target.value })}
                  placeholder="e.g. Marketing Director"
                  className="w-full px-3 py-2.5 glass-input rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 glass-input rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3 py-2.5 glass-input rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primary-contact"
                  checked={contactForm.primary}
                  onChange={e => setContactForm({ ...contactForm, primary: e.target.checked })}
                  className="rounded border-gray-600 bg-white/5"
                />
                <label htmlFor="primary-contact" className="text-sm text-gray-300">Primary contact</label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="btn-glass-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="btn-glass text-white disabled:opacity-50"
                >
                  {savingContact ? 'Adding...' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
