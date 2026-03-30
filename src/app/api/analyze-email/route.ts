import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

let client: Anthropic | null = null

try {
  if (process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic()
  }
} catch (e) {
  // Ignore initialization errors during build
}

interface WorkScannerRequest {
  data: {
    source: 'email' | 'calendar'
    // Email fields
    messageId?: string
    threadId?: string
    from?: string
    to?: string
    cc?: string
    subject?: string
    body?: string
    timestamp?: string
    isReply?: boolean
    // Calendar fields
    eventId?: string
    title?: string
    description?: string
    startTime?: string
    endTime?: string
    location?: string
    attendees?: string
    isAllDay?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')

    // Verify API key
    const authHeader = request.headers.get('authorization')
    const expectedKey = `Bearer ${process.env.EMAIL_SCANNER_KEY}`

    if (authHeader !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: WorkScannerRequest = await request.json()
    const { data } = body

    // Handle legacy format (old EmailScanner sends { email: {...} })
    const legacyBody = body as any
    if (legacyBody.email && !data) {
      return handleLegacyEmail(legacyBody.email, prisma)
    }

    if (data.source === 'calendar') {
      return handleCalendarEvent(data, prisma)
    }

    // Default: email
    return handleEmail(data, prisma)

  } catch (error) {
    console.error('Error in WorkScanner API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process data',
      },
      { status: 500 }
    )
  }
}

/* ── Email Handler ── */

async function handleEmail(data: WorkScannerRequest['data'], prisma: any) {
  const analysis = await analyzeWithClaude('email', data)

  // If Claude says this email is not relevant, skip it
  if (analysis.relevance === 'IGNORE') {
    return NextResponse.json({
      success: true,
      data: { action: 'ignored', reason: analysis.summary },
    })
  }

  // Create milestone history if matched to task
  await createMilestoneFromAnalysis(analysis, data, prisma)

  // If it's a calendar-worthy email (meeting invite, scheduling), create a meeting
  if (analysis.createMeeting) {
    await createMeetingFromAnalysis(analysis, prisma)
  }

  return NextResponse.json({
    success: true,
    data: { action: 'processed', analysis },
  })
}

/* ── Calendar Handler ── */

async function handleCalendarEvent(data: WorkScannerRequest['data'], prisma: any) {
  // Create meeting in database if it doesn't exist
  const existing = data.eventId
    ? await prisma.meeting.findUnique({ where: { externalId: data.eventId } })
    : null

  if (existing) {
    return NextResponse.json({
      success: true,
      data: { action: 'already_exists', meetingId: existing.id },
    })
  }

  const meeting = await prisma.meeting.create({
    data: {
      title: data.title || 'Untitled Event',
      description: data.description || null,
      startTime: new Date(data.startTime!),
      endTime: new Date(data.endTime!),
      location: data.location || null,
      attendees: data.attendees || null,
      source: 'GOOGLE_CALENDAR',
      externalId: data.eventId || null,
    },
  })

  // Optionally analyze the meeting for task relevance
  if (data.description && data.description.length > 20) {
    const analysis = await analyzeWithClaude('calendar', data)
    if (analysis.relevance !== 'IGNORE') {
      await createMilestoneFromAnalysis(analysis, data, prisma)
    }
  }

  return NextResponse.json({
    success: true,
    data: { action: 'created', meetingId: meeting.id },
  }, { status: 201 })
}

/* ── Legacy email handler (backwards compatible) ── */

async function handleLegacyEmail(email: any, prisma: any) {
  const data = { ...email, source: 'email' as const }
  return handleEmail(data, prisma)
}

/* ── Claude Analysis ── */

interface AnalysisResult {
  relevance: 'ACTIONABLE' | 'INFORMATIONAL' | 'IGNORE'
  eventType: 'FEEDBACK' | 'APPROVED' | 'SUBMITTED' | 'QUESTION' | 'NEW_PROJECT' | 'INFO'
  confidence: number
  changes_requested: string[]
  sentiment: string
  summary: string
  details: string
  senderRole: string
  createMeeting?: {
    title: string
    startTime: string
    endTime: string
    location?: string
  }
}

async function analyzeWithClaude(
  source: 'email' | 'calendar',
  data: WorkScannerRequest['data']
): Promise<AnalysisResult> {
  if (!client) {
    return {
      relevance: 'INFORMATIONAL',
      eventType: 'INFO',
      confidence: 0.5,
      changes_requested: [],
      sentiment: 'neutral',
      summary: 'Analysis not available — no API key',
      details: '',
      senderRole: 'unknown',
    }
  }

  const contextBlock =
    source === 'email'
      ? `Email:
From: ${data.from}
To: ${data.to}
Subject: ${data.subject}
Is Reply: ${data.isReply}
Date: ${data.timestamp}

Body:
${data.body}`
      : `Calendar Event:
Title: ${data.title}
Start: ${data.startTime}
End: ${data.endTime}
Location: ${data.location || 'none'}
Attendees: ${data.attendees || 'none'}

Description:
${data.description}`

  const prompt = `You are a project management assistant. Analyze this ${source} and determine if it is relevant to work/projects.

${contextBlock}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "relevance": "ACTIONABLE|INFORMATIONAL|IGNORE",
  "eventType": "FEEDBACK|APPROVED|SUBMITTED|QUESTION|NEW_PROJECT|INFO",
  "confidence": 0.0-1.0,
  "changes_requested": ["item1", "item2"],
  "sentiment": "positive|neutral|negative",
  "summary": "One line summary",
  "details": "Detailed notes and action items",
  "senderRole": "client|colleague|unknown"
}

Rules:
- IGNORE: newsletters, marketing, social media notifications, automated alerts, spam, personal/non-work emails
- INFORMATIONAL: FYI updates, status reports, no action needed
- ACTIONABLE: needs a response, has a deadline, requests changes, asks questions
- For approval/sign-off emails: eventType = APPROVED
- For revision/change requests: eventType = FEEDBACK
- For new work proposals: eventType = NEW_PROJECT
- For questions: eventType = QUESTION
- For status updates: eventType = INFO
- External senders → client, internal → colleague`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    return JSON.parse(text)
  } catch (e) {
    console.error('Claude analysis failed:', e)
    return {
      relevance: 'INFORMATIONAL',
      eventType: 'INFO',
      confidence: 0.3,
      changes_requested: [],
      sentiment: 'neutral',
      summary: 'Analysis failed',
      details: String(e),
      senderRole: 'unknown',
    }
  }
}

/* ── Database helpers ── */

const STOP_WORDS = new Set(['and', 'the', 'for', 'with', 'from', 'that', 'this', 'will', 'are', 'was', 'have', 'has', 'had', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'use', 'its'])

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
}

function scoreTaskMatch(taskTitle: string, searchText: string): number {
  // Exact match is best
  if (searchText.includes(taskTitle.toLowerCase())) return 10

  // Keyword overlap scoring
  const taskKeywords = extractKeywords(taskTitle)
  if (taskKeywords.length === 0) return 0

  const matches = taskKeywords.filter(kw => searchText.includes(kw))
  return matches.length / taskKeywords.length
}

async function createMilestoneFromAnalysis(
  analysis: AnalysisResult,
  data: WorkScannerRequest['data'],
  prisma: any
) {
  const recentTasks = await prisma.task.findMany({
    where: { project: { status: 'ACTIVE' } },
    select: { id: true, title: true },
    take: 100,
  })

  const searchText = (
    (data.subject || '') + ' ' + (data.body || '') + ' ' + (data.title || '') + ' ' + (data.description || '') +
    ' ' + analysis.summary + ' ' + analysis.details
  ).toLowerCase()

  const matchedTaskIds = recentTasks
    .map((t: any) => ({ id: t.id, score: scoreTaskMatch(t.title, searchText) }))
    .filter(({ score }: { score: number }) => score > 0.4)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 3)
    .map(({ id }: { id: string }) => id)

  const sourceLabel = data.source === 'calendar' ? 'calendar' : data.from || 'unknown'

  for (const taskId of matchedTaskIds) {
    await prisma.milestoneHistory.create({
      data: {
        taskId,
        eventType: analysis.eventType,
        dateOccurred: new Date(data.timestamp || data.startTime || new Date().toISOString()),
        notes: `[${sourceLabel}] ${analysis.summary}\n\n${analysis.details}`,
      },
    })
  }
}

async function createMeetingFromAnalysis(analysis: AnalysisResult, prisma: any) {
  if (!analysis.createMeeting) return

  await prisma.meeting.create({
    data: {
      title: analysis.createMeeting.title,
      startTime: new Date(analysis.createMeeting.startTime),
      endTime: new Date(analysis.createMeeting.endTime),
      location: analysis.createMeeting.location || null,
      source: 'MANUAL',
    },
  })
}
