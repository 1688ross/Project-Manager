export const taskStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  TODO: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
  IN_PRODUCTION: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  SENT_TO_CLIENT: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  WAITING_FEEDBACK: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  MAKING_CHANGES: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  SUBMITTING_FINAL: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
  SUBMITTING_ROUND_TWO: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  APPROVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  NEEDS_PRINTING: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
  LAUNCHED: { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/30' },
  COMPLETED: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' },
}

export const priorityColors: Record<string, { bg: string; text: string }> = {
  LOW: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  MEDIUM: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  URGENT: { bg: 'bg-red-500/20', text: 'text-red-300' },
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
