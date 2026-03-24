'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GanttChart } from '@/components/gantt/GanttChart'
import { TaskCard } from '@/components/task/TaskCard'
import { Task, Project } from '@/types'
import { Calendar } from 'lucide-react'

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/projects'),
        ])

        if (tasksRes.ok && projectsRes.ok) {
          const tasksData = await tasksRes.json()
          const projectsData = await projectsRes.json()
          setTasks(tasksData.data || [])
          setProjects(projectsData.data || [])
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">Active Projects</p>
                <p className="text-3xl font-bold mt-2">{projects.length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">Tasks Due Today</p>
                <p className="text-3xl font-bold mt-2">{todayTasks.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">Pending Feedback</p>
                <p className="text-3xl font-bold mt-2">{waitingFeedback.length}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm font-medium opacity-90">Urgent Tasks</p>
                <p className="text-3xl font-bold mt-2">{urgentTasks.length}</p>
              </div>
            </div>

            {/* Today's Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Gantt/Timeline */}
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

              {/* Daily Tasks */}
              <div>
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
              </div>
            </div>

            {/* Recent Projects */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
                <Link href="/projects" className="text-blue-600 hover:text-blue-700 font-medium">
                  View all →
                </Link>
              </div>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.slice(0, 3).map(project => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{project.status.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No date set'}
                      </p>
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
          </>
        )}
      </div>
    </div>
  )
}
