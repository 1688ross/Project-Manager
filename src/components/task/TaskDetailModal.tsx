'use client'

import { Task, MilestoneHistory, TaskStatus, Priority } from '@/types'
import { taskStatusColors, priorityColors, formatDate, isOverdue, getDaysUntil } from '@/lib/utils'
import { X, Clock, Calendar, ArrowRight, ArrowLeft, CheckCircle, MessageCircle, AlertCircle, Info, HelpCircle } from 'lucide-react'

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onStatusChange: (taskId: string, status: string) => void
}

const eventTypeConfig: Record<string, { icon: typeof ArrowRight; color: string; bg: string; label: string }> = {
  SUBMITTED: { icon: ArrowRight, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Submitted to Client' },
  FEEDBACK: { icon: ArrowLeft, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Client Feedback' },
  APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
  QUESTION: { icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Question' },
  NEW_PROJECT: { icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'New Project' },
  INFO: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Info Update' },
}

export function TaskDetailModal({ task, onClose, onEdit, onStatusChange }: TaskDetailModalProps) {
  const statusColor = taskStatusColors[task.status as TaskStatus] || taskStatusColors.TODO
  const priorityColor = priorityColors[task.priority as Priority] || priorityColors.MEDIUM
  const overdue = isOverdue(task.dueDate)
  const daysUntil = getDaysUntil(task.dueDate)
  const history = task.history || []

  const statusFlow: TaskStatus[] = [
    'TODO', 'IN_PRODUCTION', 'SENT_TO_CLIENT', 'WAITING_FEEDBACK',
    'MAKING_CHANGES', 'SUBMITTING_ROUND_TWO', 'SUBMITTING_FINAL',
    'APPROVED', 'NEEDS_PRINTING', 'LAUNCHED', 'COMPLETED'
  ]

  const currentIndex = statusFlow.indexOf(task.status as TaskStatus)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 px-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mb-12" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                {task.status.replace(/_/g, ' ')}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColor.bg} ${priorityColor.text}`}>
                {task.priority}
              </span>
              {overdue && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                  Overdue
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(task)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              Edit
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {task.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600">Start: {formatDate(task.startDate)}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className={overdue ? 'text-red-500' : 'text-gray-400'} />
                <span className={overdue ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                  Due: {formatDate(task.dueDate)}
                  {!overdue && daysUntil >= 0 && ` (${daysUntil}d)`}
                </span>
              </div>
            )}
            {task.estimatedHours != null && (
              <div className="text-sm text-gray-600">
                Estimated: {task.estimatedHours}h
              </div>
            )}
            {task.actualHours != null && (
              <div className="text-sm text-gray-600">
                Actual: {task.actualHours}h
              </div>
            )}
          </div>

          {/* Quick Status Change */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Status</h3>
            <div className="flex flex-wrap gap-1.5">
              {statusFlow.map((s, i) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(task.id, s)}
                  className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition ${
                    s === task.status
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : i < currentIndex
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Milestone History {history.length > 0 && `(${history.length})`}
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <MessageCircle size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No milestone events yet</p>
                <p className="text-xs text-gray-400 mt-1">Events from email scans and manual updates will appear here</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />
                <div className="space-y-4">
                  {history.map((event: MilestoneHistory) => {
                    const config = eventTypeConfig[event.eventType] || eventTypeConfig.INFO
                    const Icon = config.icon
                    return (
                      <div key={event.id} className="relative flex gap-4">
                        <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                          <Icon size={18} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                            <span className="text-xs text-gray-400">
                              {formatDate(event.dateOccurred)}
                            </span>
                          </div>
                          {event.notes && (
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
