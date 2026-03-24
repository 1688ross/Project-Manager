'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Project, Task } from '@/types'
import { GanttChart } from '@/components/gantt/GanttChart'
import { TaskCard } from '@/components/task/TaskCard'
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [projectRes, tasksRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/tasks?projectId=${projectId}`),
        ])

        if (!projectRes.ok) {
          throw new Error('Project not found')
        }

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
    }

    if (projectId) {
      fetchData()
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Project not found'}</p>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-gray-600 max-w-3xl">{project.description}</p>
              )}
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
              project.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : project.status === 'ON_HOLD'
                ? 'bg-yellow-100 text-yellow-800'
                : project.status === 'COMPLETED'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{completionPercentage}%</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="text-purple-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks}/{totalTasks}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="text-orange-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Start</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Due</p>
                  <p className="text-2xl font-bold text-gray-900">
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Timeline</h2>
          <GanttChart tasks={tasks} />
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No tasks yet. Start by creating one!</p>
          ) : (
            <div className="grid gap-4">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
