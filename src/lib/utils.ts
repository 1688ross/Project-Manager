export const taskStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  TODO: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  IN_PRODUCTION: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  SENT_TO_CLIENT: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  WAITING_FEEDBACK: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  MAKING_CHANGES: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  SUBMITTING_FINAL: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  SUBMITTING_ROUND_TWO: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  NEEDS_PRINTING: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  LAUNCHED: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  COMPLETED: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
}

export const priorityColors: Record<string, { bg: string; text: string }> = {
  LOW: { bg: 'bg-blue-100', text: 'text-blue-800' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800' },
  URGENT: { bg: 'bg-red-100', text: 'text-red-800' },
}

export const getStatusLabel = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'No date'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getDaysUntil = (date: Date | string | null | undefined): number => {
  if (!date) return -1
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export const isOverdue = (date: Date | string | null | undefined): boolean => {
  return getDaysUntil(date) < 0
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}
