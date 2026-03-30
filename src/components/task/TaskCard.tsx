'use client'

import { Task, TaskStatus, Priority } from '@/types'
import { taskStatusColors, priorityColors, getDaysUntil, isOverdue } from '@/lib/utils'
import { Trash2, Edit2, MessageCircle, Clock } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onComment?: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, onComment }: TaskCardProps) {
  const statusColor = taskStatusColors[task.status as TaskStatus] || taskStatusColors.TODO
  const priorityColor = priorityColors[task.priority as Priority] || priorityColors.MEDIUM
  const daysUntil = getDaysUntil(task.dueDate)
  const overdue = isOverdue(task.dueDate)

  return (
    <div className={`glass-card ${statusColor.border} p-4 hover:bg-white/10 transition`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-white flex-1">{task.title}</h3>
        <div className="flex gap-2 ml-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 hover:bg-white/10 rounded transition"
              title="Edit task"
            >
              <Edit2 size={16} className="text-gray-400" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 hover:bg-white/10 rounded transition"
              title="Delete task"
            >
              <Trash2 size={16} className="text-red-400" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}>
          {task.status.replace(/_/g, ' ')}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityColor.bg} ${priorityColor.text}`}>
          {task.priority}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {task.dueDate && (
          <div className="flex items-center space-x-2">
            <Clock size={14} className={overdue ? 'text-red-400' : 'text-gray-500'} />
            <span className={overdue ? 'text-red-400 font-semibold' : 'text-gray-400'}>
              {overdue ? '⚠️ Overdue' : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {task.estimatedHours && (
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="text-xs">⏱️ {task.estimatedHours}h estimated</span>
            {task.actualHours && (
              <span className="text-xs font-semibold">{task.actualHours}h actual</span>
            )}
          </div>
        )}
      </div>

      {onComment && (
        <button
          onClick={() => onComment(task)}
          className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 border border-white/10 rounded hover:bg-white/5 transition text-sm font-medium text-gray-400"
        >
          <MessageCircle size={14} />
          <span>Add comment</span>
        </button>
      )}
    </div>
  )
}
