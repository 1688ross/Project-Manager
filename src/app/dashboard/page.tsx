'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GanttChart } from '@/components/gantt/GanttChart'
import { TaskCard } from '@/components/task/TaskCard'
import { Task, Project } from '@/types'
import { Calendar, ArrowRight, ArrowLeft, CheckCircle, HelpCircle, Info, AlertCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ActivityEvent {
  id: string
  eventType: string
  dateOccurred: string
  notes?: string
  task: {
    id: string
    title: string
    projectId: string
    project: { id: string; title: string }
  }
}

const eventIcons: Record<string, { icon: typeof ArrowRight; color: string; bg: string; label: string }> = {
  SUBMITTED: { icon: ArrowRight, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Submitted' },
  FEEDBACK: { icon: ArrowLeft, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Feedback' },
  APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
  QUESTION: { icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Question' },
  NEW_PROJECT: { icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'New Project' },
  INFO: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Info' },
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes, activityRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/projects'),
          fetch('/api/activity'),
        ])

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData.data || [])
        }
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData.data || [])
        }
        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setActivity(activityData.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const todayTasks = tasks.filter(t => {
    const dueDate = t.dueDate ? new Date(t.dueDate) : null
    if (!dueDate) return false
    const today = new Date()
    return dueDate.toDateString() === today.toDateString()
  })

  const urgentTasks = tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH')
  const waitingFeedback = tasks.filter(t => t.status === 'WAITING_FEEDBACK')
  const inProgress = tasks.filter(t => t.status === 'IN_PRODUCTION' || t.status === 'MAKING_CHANGES')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s your project overview.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">Active Projects</p>
                <p className="text-3xl font-bold mt-2">{projects.filter(p => p.status === 'ACTIVE').length}</p>
                <p className="text-xs mt-1 opacity-75">{projects.length} total</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">In Progress</p>
                <p className="text-3xl font-bold mt-2">{inProgress.length}</p>
                <p className="text-xs mt-1 opacity-75">{todayTasks.length} due today</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">Pending Feedback</p>
                <p className="text-3xl font-bold mt-2">{waitingFeedback.length}</p>
                <p className="text-xs mt-1 opacity-75">from clients</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">Urgent Tasks</p>
                <p className="text-3xl font-bold mt-2">{urgentTasks.length}</p>
                <p className="text-xs mt-1 opacity-75">high + urgent priority</p>
              </div>
            </div>

            {/* Gantt + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Gantt */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Gantt Chart</h2>
                  {tasks.length > 0 ? (
                    <GanttChart tasks={tasks} />
                  ) : (
                    <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Calendar size={40} className="mx-auto opacity-50 mb-2" />
                        <p>Create tasks to see them on the Gantt chart</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Feed</h2>
                  {activity.length > 0 ? (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {activity.map(event => {
                        const config = eventIcons[event.eventType] || eventIcons.INFO
                        const Icon = config.icon
                        return (
                          <Link
                            key={event.id}
                            href={`/projects/${event.task.projectId}`}
                            className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition group"
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                              <Icon size={14} className={config.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 group-hover:text-blue-600 transition">
                                <span className={`font-semibold ${config.color}`}>{config.label}</span>
                                {' '}&mdash;{' '}
                                <span className="font-medium">{event.task.title}</span>
                              </p>
                              {event.notes && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{event.notes}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">
                                {event.task.project.title} &middot; {formatDate(event.dateOccurred)}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activity yet</p>
                      <p className="text-xs text-gray-400 mt-1">Events from email scans will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Tasks + Recent Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Today&apos;s Tasks</h2>
                {todayTasks.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {todayTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No tasks due today</p>
                  </div>
                )}
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
                  <Link href="/projects" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View all →
                  </Link>
                </div>
                {projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map(project => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {project.endDate ? `Due ${new Date(project.endDate).toLocaleDateString()}` : 'No due date'}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace(/_/g, ' ')}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm mb-4">No projects yet</p>
                    <Link href="/projects/new" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Create first project
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
