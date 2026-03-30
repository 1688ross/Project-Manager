'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, isToday, parseISO } from 'date-fns'
import { Plus, List, Grid3X3 } from 'lucide-react'
import CalendarView, { MeetingDetail, MeetingForm } from '@/components/calendar/CalendarView'
import { Meeting, Project } from '@/types'

function MeetingListRow({ meeting, onClick, past }: { meeting: Meeting; onClick: () => void; past?: boolean }) {
  const start = typeof meeting.startTime === 'string' ? parseISO(meeting.startTime as string) : new Date(meeting.startTime)
  const end = typeof meeting.endTime === 'string' ? parseISO(meeting.endTime as string) : new Date(meeting.endTime)
  const today = isToday(start)
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition text-left ${past ? 'opacity-50' : ''}`}
    >
      <div className={`text-center min-w-[50px] ${today ? 'text-indigo-400' : 'text-gray-400'}`}>
        <p className="text-xs font-semibold uppercase">{format(start, 'MMM')}</p>
        <p className="text-2xl font-bold">{format(start, 'd')}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-200 truncate">{meeting.title}</p>
        <p className="text-sm text-gray-500">
          {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
          {meeting.location && ` · ${meeting.location}`}
        </p>
      </div>
      {meeting.project && (
        <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded-full whitespace-nowrap">
          {(meeting.project as { title: string }).title}
        </span>
      )}
    </button>
  )
}

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState<Date | undefined>()

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch('/api/meetings')
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchMeetings(), fetchProjects()]).finally(() => setLoading(false))
  }, [fetchMeetings, fetchProjects])

  const handleCreateMeeting = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setShowForm(false)
        fetchMeetings()
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
    }
  }

  const handleDeleteMeeting = async (id: string) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMeetings(prev => prev.filter(m => m.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete meeting:', error)
    }
  }

  const handleDateClick = (date: Date) => {
    setFormDate(date)
    setShowForm(true)
  }

  // Show meetings from past 30 days + all upcoming, sorted by time
  const relevantMeetings = [...meetings]
    .filter(m => {
      const d = typeof m.startTime === 'string' ? parseISO(m.startTime as string) : new Date(m.startTime)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return d >= thirtyDaysAgo
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const upcomingMeetings = relevantMeetings.filter(m => {
    const d = typeof m.startTime === 'string' ? parseISO(m.startTime as string) : new Date(m.startTime)
    return d >= new Date(new Date().setHours(0, 0, 0, 0))
  })
  const pastMeetings = relevantMeetings.filter(m => {
    const d = typeof m.startTime === 'string' ? parseISO(m.startTime as string) : new Date(m.startTime)
    return d < new Date(new Date().setHours(0, 0, 0, 0))
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Calendar</h1>
              <p className="text-gray-400 mt-1">Manage your meetings and events</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/10">
                <button
                  onClick={() => setView('calendar')}
                  className={`p-2 rounded-lg transition ${view === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <List size={18} />
                </button>
              </div>
              <button
                onClick={() => { setFormDate(undefined); setShowForm(true) }}
                className="btn-glass flex items-center gap-2 text-white"
              >
                <Plus size={16} /> New Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
            <p className="text-gray-400 mt-4">Loading calendar...</p>
          </div>
        ) : view === 'calendar' ? (
          <CalendarView
            meetings={meetings}
            onDateClick={handleDateClick}
            onMeetingClick={setSelectedMeeting}
          />
        ) : (
          /* List View */
          <div className="glass-card space-y-0">
            {upcomingMeetings.length > 0 && (
              <>
                <div className="p-4 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Upcoming</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {upcomingMeetings.map(meeting => (
                    <MeetingListRow key={meeting.id} meeting={meeting} onClick={() => setSelectedMeeting(meeting)} />
                  ))}
                </div>
              </>
            )}
            {pastMeetings.length > 0 && (
              <>
                <div className="p-4 border-t border-white/5 bg-white/3">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent (past 30 days)</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {pastMeetings.map(meeting => (
                    <MeetingListRow key={meeting.id} meeting={meeting} onClick={() => setSelectedMeeting(meeting)} past />
                  ))}
                </div>
              </>
            )}
            {upcomingMeetings.length === 0 && pastMeetings.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">No meetings found</p>
                <p className="text-sm mt-1 text-gray-600">Click &quot;New Meeting&quot; to schedule one</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedMeeting && (
        <MeetingDetail
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onDelete={handleDeleteMeeting}
        />
      )}
      {showForm && (
        <MeetingForm
          initialDate={formDate}
          projects={projects.map(p => ({ id: p.id, title: p.title }))}
          onSubmit={handleCreateMeeting}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
