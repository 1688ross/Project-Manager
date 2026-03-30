'use client'

import { useState } from 'react'
import { Task, MilestoneHistory } from '@/types'
import { taskStatusColors, getStatusLabel } from '@/lib/utils'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

interface GanttChartProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

interface MilestoneMarker {
  history: MilestoneHistory
  position: number // percentage position on the bar
}

interface SelectedMarker {
  history: MilestoneHistory
  task: Task
}

export function GanttChart({ tasks, onTaskClick }: GanttChartProps) {
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null)

  if (!tasks || tasks.length === 0) {
    return (
      <div className="h-96 bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
        <p>No tasks to display</p>
      </div>
    )
  }

  // Calculate date range
  const allDates = tasks
    .flatMap(t => [t.startDate, t.dueDate])
    .filter(Boolean) as Date[]
  const minDate = new Date(Math.min(...allDates.map(d => new Date(d).getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => new Date(d).getTime())))

  const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  const weekWidth = 100 / Math.ceil(daysDiff / 7)

  // Generate date labels
  const dateLabels = []
  const currentDate = new Date(minDate)
  while (currentDate <= maxDate) {
    dateLabels.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 7)
  }

  const getTaskPosition = (task: Task) => {
    if (!task.startDate || !task.dueDate) return { left: 0, width: 0 }

    const start = new Date(task.startDate).getTime()
    const minTime = minDate.getTime()
    const taskDays = Math.ceil((new Date(task.dueDate).getTime() - start) / (1000 * 60 * 60 * 24))

    const leftPercent = ((start - minTime) / (maxDate.getTime() - minTime)) * 100
    const widthPercent = (taskDays / daysDiff) * 100

    return { left: Math.max(0, leftPercent), width: Math.max(2, widthPercent) }
  }

  const getMilestoneMarkers = (task: Task): MilestoneMarker[] => {
    if (!task.history || task.history.length === 0) return []

    const taskStart = new Date(task.startDate!).getTime()
    const taskEnd = new Date(task.dueDate!).getTime()
    const totalTime = taskEnd - taskStart

    return task.history.map(h => ({
      history: h,
      position: ((new Date(h.dateOccurred).getTime() - taskStart) / totalTime) * 100,
    }))
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'SUBMITTED':
        return <ArrowRight size={16} className="text-blue-600" />
      case 'FEEDBACK':
        return <ArrowLeft size={16} className="text-orange-600" />
      case 'APPROVED':
        return <CheckCircle2 size={16} className="text-green-600" />
      default:
        return null
    }
  }

  const getEventLabel = (eventType: string): string => {
    switch (eventType) {
      case 'SUBMITTED':
        return '→ Submitted to Client'
      case 'FEEDBACK':
        return '← Client Feedback'
      case 'APPROVED':
        return '● Approved'
      default:
        return eventType
    }
  }

  // Today marker position
  const today = new Date()
  const todayTime = today.getTime()
  const minTime = minDate.getTime()
  const maxTime = maxDate.getTime()
  const todayPercent = ((todayTime - minTime) / (maxTime - minTime)) * 100
  const showTodayLine = todayPercent >= 0 && todayPercent <= 100

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        {/* Header with date labels */}
        <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-white/10">
          <div className="flex">
            <div className="w-64 flex-shrink-0 border-r border-white/10 p-4 font-semibold text-sm text-gray-300">
              Milestones
            </div>
            <div className="flex-1 flex relative">
              {dateLabels.map((date, i) => (
                <div
                  key={i}
                  className="flex-1 flex-shrink-0 border-r border-white/10 p-2 text-xs font-medium text-gray-400 text-center"
                  style={{ minWidth: `${weekWidth}%` }}
                >
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              ))}
              {/* Today marker in header */}
              {showTodayLine && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
                  style={{ left: `${todayPercent}%` }}
                >
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-b whitespace-nowrap">
                    Today
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task rows */}
        <div className="relative">
          {tasks.map((task) => {
            const position = getTaskPosition(task)
            const statusColor = taskStatusColors[task.status] || taskStatusColors.TODO
            const markers = getMilestoneMarkers(task)

            return (
              <div
                key={task.id}
                className="flex border-b border-white/5 hover:bg-white/5 transition"
              >
                {/* Task name */}
                <div className="w-64 flex-shrink-0 border-r border-white/10 p-4">
                  <p className="text-sm font-semibold text-gray-200 truncate">{task.title}</p>
                  <p className={`text-xs mt-1 ${statusColor.text}`}>{getStatusLabel(task.status)}</p>
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Gantt bar area */}
                <div className="flex-1 relative h-20">
                  {/* Today vertical line */}
                  {showTodayLine && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
                      style={{ left: `${todayPercent}%` }}
                    />
                  )}
                  {position.width > 0 && (
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 h-8 rounded-full cursor-pointer transition-all ${statusColor.bg} border-2 ${statusColor.border}`}
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                        minWidth: '60px',
                      }}
                      onClick={() => onTaskClick?.(task)}
                      title={task.title}
                    >
                      <div className="h-full flex items-center px-2 relative">
                        {/* Milestone markers */}
                        {markers.map((marker, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedMarker({ history: marker.history, task })
                            }}
                            className="absolute flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full shadow-md hover:shadow-lg transition hover:scale-110 border-2 border-white/20"
                            style={{
                              left: `${marker.position}%`,
                              transform: 'translate(-50%, -50%)',
                              top: '50%',
                            }}
                            title={getEventLabel(marker.history.eventType)}
                          >
                            {getEventIcon(marker.history.eventType)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white/5 border-t border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <ArrowRight size={16} className="text-blue-400" />
            <span className="text-gray-400">→ Submitted to Client</span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowLeft size={16} className="text-orange-400" />
            <span className="text-gray-400">← Client Feedback</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-gray-400">● Approved</span>
          </div>
        </div>
      </div>

      {/* Milestone Details Modal */}
      {selectedMarker && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedMarker(null)}
        >
          <div
            className="glass-modal rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              {getEventIcon(selectedMarker.history.eventType)}
              <h3 className="text-lg font-bold text-white">
                {getEventLabel(selectedMarker.history.eventType)}
              </h3>
            </div>

            <div className="space-y-3 bg-white/5 rounded-lg p-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Milestone</p>
                <p className="text-sm font-semibold text-gray-200">{selectedMarker.task.title}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-semibold text-gray-200">
                  {new Date(selectedMarker.history.dateOccurred).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {selectedMarker.history.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes / Feedback</p>
                  <p className="text-sm text-gray-300 mt-1">{selectedMarker.history.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMarker(null)}
              className="btn-glass w-full text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
