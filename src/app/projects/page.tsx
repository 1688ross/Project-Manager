'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Filter, X } from 'lucide-react'
import { Project, ProjectStatus } from '@/types'

const statusOptions: { value: ProjectStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects')
        const data = await res.json()
        if (data.success) {
          setProjects(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-blue-500/20 text-blue-300',
      ARCHIVED: 'bg-gray-500/20 text-gray-400',
      COMPLETED: 'bg-emerald-500/20 text-emerald-300',
      ON_HOLD: 'bg-yellow-500/20 text-yellow-300',
    }
    return colors[status] || 'bg-blue-500/20 text-blue-300'
  }

  const filtered = projects.filter(p => {
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const hasActiveFilters = statusFilter !== 'ALL'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Projects</h1>
              <p className="text-gray-400 mt-2">Manage all your creative projects</p>
            </div>
            <Link
              href="/projects/new"
              className="btn-glass flex items-center space-x-2 text-white"
            >
              <Plus size={20} />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 glass-input rounded-xl"
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition ${
              hasActiveFilters ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' : 'btn-glass-secondary'
            }`}
          >
            <Filter size={18} />
            <span>Filter{hasActiveFilters ? ' (active)' : ''}</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-full font-medium transition ${
                  statusFilter === opt.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {(search || hasActiveFilters) && (
          <p className="text-sm text-gray-500 mt-3">
            Showing {filtered.length} of {projects.length} projects
            {search && <> matching &ldquo;{search}&rdquo;</>}
          </p>
        )}
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            {projects.length === 0 ? (
              <>
                <p className="text-gray-400 mb-4">No projects yet</p>
                <Link
                  href="/projects/new"
                  className="btn-glass inline-flex items-center space-x-2 text-white"
                >
                  <Plus size={20} />
                  <span>Create your first project</span>
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-2">No projects match your filter</p>
                <button
                  onClick={() => { setSearch(''); setStatusFilter('ALL') }}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-lg">{project.title}</h3>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">{project.description || 'No description'}</p>

                {/* Due Date */}
                {project.endDate && (
                  <p className="text-xs text-gray-500">Due: {new Date(project.endDate).toLocaleDateString()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
