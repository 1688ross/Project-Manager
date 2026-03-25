import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) (where.startTime as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.startTime as Record<string, unknown>).lte = new Date(endDate)
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: { project: true },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({ success: true, data: meetings })
  } catch (error) {
    console.error('Failed to fetch meetings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meetings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await request.json()
    const { title, description, startTime, endTime, location, meetingLink, projectId, attendees, color } = body

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Title, start time, and end time are required' },
        { status: 400 }
      )
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || null,
        meetingLink: meetingLink || null,
        projectId: projectId || null,
        attendees: attendees ? JSON.stringify(attendees) : null,
        color: color || null,
        source: 'MANUAL',
      },
      include: { project: true },
    })

    return NextResponse.json({ success: true, data: meeting }, { status: 201 })
  } catch (error) {
    console.error('Failed to create meeting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
