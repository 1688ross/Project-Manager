'use client'

import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, X } from 'lucide-react'
import { Meeting } from '@/types'

interface CalendarViewProps {
  meetings: Meeting[]
  onDateClick: (date: Date) => void
  onMeetingClick: (meeting: Meeting) => void
}

const MEETING_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-500' },
  green: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-500' },
  red: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-500' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-300', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-300', dot: 'bg-orange-500' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-300', dot: 'bg-pink-500' },
  default: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-500' },
}

function getColorClasses(color?: string | null) {
  return MEETING_COLORS[color || 'default'] || MEETING_COLORS.default
}

export default function CalendarView({ meetings, onDateClick, onMeetingClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getMeetingsForDay = (day: Date) => {
    return meetings.filter(m => {
      const meetingDate = typeof m.startTime === 'string' ? parseISO(m.startTime as string) : new Date(m.startTime)
      return isSameDay(meetingDate, day)
    })
  }

  return (
    <div className="glass-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-400"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-white/10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayMeetings = getMeetingsForDay(day)
          const inCurrentMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)

          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-[100px] border-b border-r border-white/5 p-1.5 cursor-pointer transition hover:bg-white/5 ${
                today
                  ? 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/30'
                  : !inCurrentMonth
                  ? 'bg-white/[0.02]'
                  : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                today
                  ? 'bg-indigo-500 text-white'
                  : inCurrentMonth
                  ? 'text-gray-300'
                  : 'text-gray-600'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayMeetings.slice(0, 3).map(meeting => {
                  const colors = getColorClasses(meeting.color)
                  const startStr = typeof meeting.startTime === 'string'
                    ? format(parseISO(meeting.startTime as string), 'h:mm a')
                    : format(new Date(meeting.startTime), 'h:mm a')
                  return (
                    <button
                      key={meeting.id}
                      onClick={(e) => { e.stopPropagation(); onMeetingClick(meeting) }}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate ${colors.bg} ${colors.text} hover:opacity-80 transition`}
                    >
                      <span className="font-medium">{startStr}</span>{' '}
                      {meeting.title}
                    </button>
                  )
                })}
                {dayMeetings.length > 3 && (
                  <p className="text-xs text-gray-500 pl-1">+{dayMeetings.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Meeting Detail Modal ── */
interface MeetingDetailProps {
  meeting: Meeting
  onClose: () => void
  onDelete: (id: string) => void
}

export function MeetingDetail({ meeting, onClose, onDelete }: MeetingDetailProps) {
  const start = typeof meeting.startTime === 'string' ? parseISO(meeting.startTime as string) : new Date(meeting.startTime)
  const end = typeof meeting.endTime === 'string' ? parseISO(meeting.endTime as string) : new Date(meeting.endTime)
  const colors = getColorClasses(meeting.color)

  let attendeeList: string[] = []
  if (meeting.attendees) {
    try { attendeeList = JSON.parse(meeting.attendees) } catch { /* ignore */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-modal w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
            <h3 className="text-lg font-bold text-white">{meeting.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Clock size={16} className="text-gray-500" />
            <span>
              {format(start, 'EEEE, MMMM d, yyyy')}
              <br />
              {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
            </span>
          </div>
          {meeting.location && (
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <MapPin size={16} className="text-gray-500" />
              <span>{meeting.location}</span>
            </div>
          )}
          {meeting.meetingLink && (
            <div className="flex items-center gap-3 text-sm">
              <Video size={16} className="text-gray-500" />
              <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline truncate">
                Join meeting
              </a>
            </div>
          )}
          {meeting.description && (
            <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-lg">{meeting.description}</p>
          )}
          {attendeeList.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Attendees</p>
              <div className="flex flex-wrap gap-1">
                {attendeeList.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300">{a}</span>
                ))}
              </div>
            </div>
          )}
          {meeting.project && (
            <div className="text-xs text-gray-500">
              Project: <span className="font-medium text-gray-300">{meeting.project.title}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button
            onClick={() => { onDelete(meeting.id); onClose() }}
            className="btn-glass-danger px-3 py-1.5 text-sm"
          >
            Delete
          </button>
          <button onClick={onClose} className="btn-glass-secondary px-4 py-1.5 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── New Meeting Form Modal ── */
interface MeetingFormProps {
  initialDate?: Date
  projects: { id: string; title: string }[]
  onSubmit: (data: Record<string, unknown>) => void
  onClose: () => void
}

export function MeetingForm({ initialDate, projects, onSubmit, onClose }: MeetingFormProps) {
  const defaultDate = initialDate || new Date()
  const dateStr = format(defaultDate, 'yyyy-MM-dd')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(dateStr)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [location, setLocation] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [projectId, setProjectId] = useState('')
  const [color, setColor] = useState('blue')
  const [attendeesStr, setAttendeesStr] = useState('')

  const colors = ['blue', 'green', 'red', 'purple', 'orange', 'pink']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(`${date}T${endTime}:00`)
    const attendees = attendeesStr.split(',').map(a => a.trim()).filter(Boolean)

    onSubmit({
      title,
      description: description || undefined,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: location || undefined,
      meetingLink: meetingLink || undefined,
      projectId: projectId || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
      color,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-modal w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus size={20} /> New Meeting
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="glass-input w-full"
              placeholder="Meeting title"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start *</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End *</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
                className="glass-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="glass-input w-full"
              placeholder="Meeting notes or agenda"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="glass-input w-full"
                placeholder="Room or address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Meeting Link</label>
              <input
                type="url"
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                className="glass-input w-full"
                placeholder="https://zoom.us/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Attendees</label>
            <input
              type="text"
              value={attendeesStr}
              onChange={e => setAttendeesStr(e.target.value)}
              className="glass-input w-full"
              placeholder="Comma-separated names or emails"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Project</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="glass-input w-full"
            >
              <option value="">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${MEETING_COLORS[c].dot} ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-gray-400' : ''
                  } transition`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-glass-secondary px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-glass px-4 py-2 text-sm text-white"
            >
              Create Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
