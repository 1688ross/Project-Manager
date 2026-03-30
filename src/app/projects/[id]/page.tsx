'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Project, Task } from '@/types'
import { GanttChart } from '@/components/gantt/GanttChart'
import { TaskCard } from '@/components/task/TaskCard'
import { TaskDetailModal } from '@/components/task/TaskDetailModal'
import { TaskForm } from '@/components/forms/TaskForm'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { Calendar, CheckCircle, Clock, Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type ModalState = 'none' | 'addTask' | 'editTask' | 'taskDetail' | 'editProject' | 'deleteConfirm'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modal, setModal] = useState<ModalState>('none')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?projectId=${projectId}`),
      ])

      if (!projectRes.ok) throw new Error('Project not found')

      const projectData = await projectRes.json()
      setProject(projectData.data)

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(Array.isArray(tasksData.data) ? tasksData.data : [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) fetchData()
  }, [projectId, fetchData])

  const closeModal = () => {
    setModal('none')
    setSelectedTask(null)
  }

  // --- Task CRUD ---
  const handleCreateTask = async (formData: Partial<Task>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId,
          creatorId: 'user-demo',
        }),
      })
      if (!res.ok) throw new Error('Failed to create task')
      closeModal()
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTask = async (formData: Partial<Task>) => {
    if (!selectedTask) return
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to update task')
      closeModal()
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete task')
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      await fetchData()
      // Update selectedTask if modal is open
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: status as Task['status'] } : null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  // --- Project CRUD ---
  const handleUpdateProject = async (formData: Partial<Project>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to update project')
      closeModal()
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project')
      router.push('/projects')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-modal rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-400">{error || 'Project not found'}</p>
          <Link href="/projects" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
            ← Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen">
      {/* Project Header */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-4 transition">
            <ArrowLeft size={14} /> Back to Projects
          </Link>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-white mb-2">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-gray-400 max-w-3xl">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                project.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : project.status === 'ON_HOLD'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : project.status === 'COMPLETED'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {project.status}
              </span>
              <button
                onClick={() => setModal('editProject')}
                className="btn-glass-secondary flex items-center gap-1.5"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => setModal('deleteConfirm')}
                className="btn-glass-danger flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/5" />
              <div className="relative flex items-center space-x-3">
                <CheckCircle className="text-blue-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-2xl font-bold text-white">{completionPercentage}%</p>
                </div>
              </div>
            </div>
            <div className="stat-card group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-600/5" />
              <div className="relative flex items-center space-x-3">
                <Clock className="text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Tasks</p>
                  <p className="text-2xl font-bold text-white">{completedTasks}/{totalTasks}</p>
                </div>
              </div>
            </div>
            <div className="stat-card group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/15 to-orange-600/5" />
              <div className="relative flex items-center space-x-3">
                <Calendar className="text-orange-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Start</p>
                  <p className="text-2xl font-bold text-white">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="stat-card group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/15 to-red-600/5" />
              <div className="relative flex items-center space-x-3">
                <Calendar className="text-red-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Due</p>
                  <p className="text-2xl font-bold text-white">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gantt Chart */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Timeline</h2>
          <GanttChart tasks={tasks} />
        </div>

        {/* Tasks Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <button
              onClick={() => setModal('addTask')}
              className="btn-glass flex items-center gap-2 text-white"
            >
              <Plus size={16} /> Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tasks yet</p>
              <button
                onClick={() => setModal('addTask')}
                className="btn-glass inline-flex items-center gap-2 text-white"
              >
                <Plus size={16} /> Create first task
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map(task => (
                <div key={task.id} className="cursor-pointer" onClick={() => { setSelectedTask(task); setModal('taskDetail') }}>
                  <TaskCard
                    task={task}
                    onEdit={(t) => { setSelectedTask(t); setModal('editTask') }}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === MODALS === */}

      {/* Add Task */}
      {modal === 'addTask' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4 overflow-y-auto">
          <div className="glass-modal rounded-2xl w-full max-w-lg mb-12 p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Task</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-white/10 rounded-xl transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {/* Edit Task */}
      {modal === 'editTask' && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4 overflow-y-auto">
          <div className="glass-modal rounded-2xl w-full max-w-lg mb-12 p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Task</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-white/10 rounded-xl transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <TaskForm
              initialData={selectedTask}
              onSubmit={handleUpdateTask}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {/* Task Detail */}
      {modal === 'taskDetail' && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={closeModal}
          onEdit={(t) => { setSelectedTask(t); setModal('editTask') }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Edit Project */}
      {modal === 'editProject' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4 overflow-y-auto">
          <div className="glass-modal rounded-2xl w-full max-w-lg mb-12 p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Project</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-white/10 rounded-xl transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <ProjectForm
              initialData={project}
              onSubmit={handleUpdateProject}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {modal === 'deleteConfirm' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-modal rounded-2xl w-full max-w-sm p-6 animate-scaleIn">
            <h2 className="text-xl font-bold text-white mb-2">Delete Project?</h2>
            <p className="text-gray-400 mb-6">
              This will permanently delete &ldquo;{project.title}&rdquo; and all its tasks. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="btn-glass-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={saving}
                className="btn-glass-danger disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
