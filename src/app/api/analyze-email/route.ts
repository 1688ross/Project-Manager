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

interface EmailAnalysisRequest {
  email: {
    messageId: string
    threadId: string
    from: string
    subject: string
    body: string
    timestamp: string
    isReply: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    // Lazy import to avoid loading during build
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

    const body: EmailAnalysisRequest = await request.json()
    const { email } = body

    // Analyze email with Claude
    const analysis = await analyzeEmailWithClaude(email)

    // Create MilestoneHistory entries based on analysis
    await createMilestoneHistoryFromAnalysis(analysis, email, prisma)

    return NextResponse.json({
      success: true,
      data: {
        messageId: email.messageId,
        analysis,
      },
    })
  } catch (error) {
    console.error('Error analyzing email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze email',
      },
      { status: 500 }
    )
  }
}

interface AnalysisResult {
  eventType: 'FEEDBACK' | 'APPROVED' | 'SUBMITTED' | 'QUESTION' | 'NEW_PROJECT' | 'INFO'
  projectTaskIds: string[] // IDs of referenced projects/tasks (if any)
  confidence: number // 0-1 confidence score
  changes_requested: string[]
  sentiment: string // 'positive', 'neutral', 'negative'
  summary: string // One-line summary
  details: string // Full notes to store
  senderRole: string // 'client', 'colleague', 'unknown'
}

async function analyzeEmailWithClaude(email: EmailAnalysisRequest['email']): Promise<AnalysisResult> {
  if (!client) {
    return {
      eventType: 'INFO',
      projectTaskIds: [],
      confidence: 0.5,
      changes_requested: [],
      sentiment: 'neutral',
      summary: 'Email analysis not available',
      details: 'Anthropic API client not initialized',
      senderRole: 'unknown',
    }
  }

  const prompt = `Analyze this email from our project management system. Determine:
1. Event type (FEEDBACK, APPROVED, SUBMITTED, QUESTION, NEW_PROJECT, or INFO)
2. Any changes/action items requested
3. Sentiment (positive, neutral, negative)
4. Role of sender (client or colleague)
5. Confidence score (0-1)
6. Summary and detailed notes

Email Details:
From: ${email.from}
Subject: ${email.subject}
Is Reply: ${email.isReply}
Timestamp: ${email.timestamp}

Body:
${email.body}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "eventType": "FEEDBACK|APPROVED|SUBMITTED|QUESTION|NEW_PROJECT|INFO",
  "projectTaskIds": [],
  "confidence": 0.0-1.0,
  "changes_requested": ["change1", "change2"],
  "sentiment": "positive|neutral|negative",
  "summary": "One line summary",
  "details": "Full notes including any feedback, questions, or action items",
  "senderRole": "client|colleague|unknown"
}

Guidelines:
- If email has approval/sign-off → APPROVED
- If email has revision requests → FEEDBACK
- If email asks a question about the project → QUESTION
- If email proposes new work/project → NEW_PROJECT
- If email is just sharing info → INFO
- If sender is external domain (not @your-company.com) → client
- If internal sender → colleague
- Extract specific changes requested in changes_requested array`

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText =
    response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    return JSON.parse(responseText)
  } catch (e) {
    console.error('Failed to parse Claude response:', responseText)
    return {
      eventType: 'INFO',
      projectTaskIds: [],
      confidence: 0.5,
      changes_requested: [],
      sentiment: 'neutral',
      summary: 'Email analysis failed',
      details: 'Could not parse email analysis. Raw: ' + responseText.substring(0, 200),
      senderRole: 'unknown',
    }
  }
}

async function createMilestoneHistoryFromAnalysis(
  analysis: AnalysisResult,
  email: EmailAnalysisRequest['email'],
  prisma: any
): Promise<void> {
  // Get all tasks from the latest projects to find related ones
  const recentTasks = await prisma.task.findMany({
    where: {
      project: {
        status: { in: ['ACTIVE', 'IN_PRODUCTION'] },
      },
    },
    select: { id: true, title: true, projectId: true },
    take: 50,
  })

  // If we have specific task IDs from analysis, use those
  // Otherwise, create a generic "email log" entry
  let targetTaskIds = analysis.projectTaskIds

  if (targetTaskIds.length === 0 && analysis.eventType !== 'NEW_PROJECT') {
    // Try to find related tasks by matching email subject/body with task titles
    const emailText = `${email.subject} ${email.body}`.toLowerCase()
    targetTaskIds = recentTasks
      .filter((task: any) => {
        const taskTitle = task.title.toLowerCase()
        return (
          taskTitle.length > 3 &&
          emailText.includes(taskTitle)
        )
      })
      .map((t: any) => t.id)
      .slice(0, 3) // Limit to top 3 matches
  }

  // Create milestone history entry for each related task
  if (targetTaskIds.length > 0) {
    for (const taskId of targetTaskIds) {
      await prisma.milestoneHistory.create({
        data: {
          taskId,
          eventType: analysis.eventType as any,
          dateOccurred: new Date(email.timestamp),
          notes: `[${analysis.senderRole}] ${analysis.summary}\n\nDetails: ${analysis.details}\n\nFrom: ${email.from}\nSubject: ${email.subject}`,
        },
      })
    }
  } else if (analysis.eventType === 'NEW_PROJECT') {
    // For new projects, we might want to create a note somewhere else
    // For now, log to console
    console.log('New project identified:', {
      from: email.from,
      subject: email.subject,
      summary: analysis.summary,
    })
  } else {
    // Create a generic "pending review" log for unmatched emails
    console.log('Email logged but not matched to task:', {
      subject: email.subject,
      from: email.from,
      analysis,
    })
  }
}
