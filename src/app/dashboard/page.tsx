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
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back! Here&apos;s your project overview.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="stat-card group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 opacity-60 group-hover:opacity-80 transition" />
                <div className="relative">
                  <p className="text-sm font-medium text-blue-300">Active Projects</p>
                  <p className="text-3xl font-bold text-white mt-2">{projects.filter(p => p.status === 'ACTIVE').length}</p>
                  <p className="text-xs mt-1 text-gray-500">{projects.length} total</p>
                </div>
              </div>
              <div className="stat-card group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 opacity-60 group-hover:opacity-80 transition" />
                <div className="relative">
                  <p className="text-sm font-medium text-orange-300">In Progress</p>
                  <p className="text-3xl font-bold text-white mt-2">{inProgress.length}</p>
                  <p className="text-xs mt-1 text-gray-500">{todayTasks.length} due today</p>
                </div>
              </div>
              <div className="stat-card group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 opacity-60 group-hover:opacity-80 transition" />
                <div className="relative">
                  <p className="text-sm font-medium text-purple-300">Pending Feedback</p>
                  <p className="text-3xl font-bold text-white mt-2">{waitingFeedback.length}</p>
                  <p className="text-xs mt-1 text-gray-500">from clients</p>
                </div>
              </div>
              <div className="stat-card group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/5 opacity-60 group-hover:opacity-80 transition" />
                <div className="relative">
                  <p className="text-sm font-medium text-red-300">Urgent Tasks</p>
                  <p className="text-3xl font-bold text-white mt-2">{urgentTasks.length}</p>
                  <p className="text-xs mt-1 text-gray-500">high + urgent priority</p>
                </div>
              </div>
            </div>

            {/* Activity Feed – horizontal scroll */}
            <div className="glass-card p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Activity Feed</h2>
              {activity.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {activity.map(event => {
                    const config = eventIcons[event.eventType] || eventIcons.INFO
                    const Icon = config.icon
                    return (
                      <Link
                        key={event.id}
                        href={`/projects/${event.task.projectId}`}
                        className="flex-shrink-0 w-64 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} bg-opacity-20 flex items-center justify-center`}>
                            <Icon size={14} className={config.color} />
                          </div>
                          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition truncate">
                          {event.task.title}
                        </p>
                        {event.notes && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.notes}</p>
                        )}
                        <p className="text-xs text-gray-600 mt-2">
                          {event.task.project.title} &middot; {formatDate(event.dateOccurred)}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs text-gray-600 mt-1">Events from email scans will appear here</p>
                </div>
              )}
            </div>

            {/* Team Gantt Chart – full width */}
            <div className="glass-card p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Team Gantt Chart</h2>
              {tasks.length > 0 ? (
                <GanttChart tasks={tasks} />
              ) : (
                <div className="h-96 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Calendar size={40} className="mx-auto opacity-50 mb-2" />
                    <p>Create tasks to see them on the Gantt chart</p>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Tasks */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Today&apos;s Tasks</h2>
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
          </>
        )}
      </div>
    </div>
  )
}
