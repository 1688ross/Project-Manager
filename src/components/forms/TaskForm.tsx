'use client'

import { useState } from 'react'
import { Task } from '@/types'

interface TaskFormProps {
  onSubmit: (task: Partial<Task>) => void
  onCancel?: () => void
  initialData?: Task
}

export function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'TODO',
    priority: initialData?.priority || 'MEDIUM',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    estimatedHours: initialData?.estimatedHours ? String(initialData.estimatedHours) : '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Task Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="glass-input w-full"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="glass-input w-full resize-none"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="glass-input w-full"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="SENT_TO_CLIENT">Sent to Client</option>
            <option value="WAITING_FEEDBACK">Waiting Feedback</option>
            <option value="MAKING_CHANGES">Making Changes</option>
            <option value="SUBMITTING_FINAL">Submitting Final</option>
            <option value="SUBMITTING_ROUND_TWO">Round 2 Review</option>
            <option value="APPROVED">Approved</option>
            <option value="NEEDS_PRINTING">Needs Printing</option>
            <option value="LAUNCHED">Launched</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="glass-input w-full"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="glass-input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="glass-input w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Hours</label>
        <input
          type="number"
          name="estimatedHours"
          value={formData.estimatedHours}
          onChange={handleChange}
          step="0.5"
          min="0"
          className="glass-input w-full"
          placeholder="Enter estimated hours"
        />
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t border-white/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-glass-secondary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-glass"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
