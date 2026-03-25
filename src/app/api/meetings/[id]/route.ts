import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: { project: true },
    })

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: meeting })
  } catch (error) {
    console.error('Failed to fetch meeting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meeting' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await request.json()
    const { title, description, startTime, endTime, location, meetingLink, projectId, attendees, color } = body

    const meeting = await prisma.meeting.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(attendees !== undefined && { attendees: attendees ? JSON.stringify(attendees) : null }),
        ...(color !== undefined && { color }),
      },
      include: { project: true },
    })

    return NextResponse.json({ success: true, data: meeting })
  } catch (error) {
    console.error('Failed to update meeting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update meeting' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.meeting.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete meeting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete meeting' },
      { status: 500 }
    )
  }
}
