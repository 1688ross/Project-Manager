import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where = projectId ? { projectId } : {}

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        creator: true,
        project: true,
        subtasks: true,
        comments: true,
        history: {
          orderBy: {
            dateOccurred: 'asc',
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await request.json()
    const {
      title,
      description,
      projectId,
      assigneeId,
      creatorId,
      status,
      priority,
      dueDate,
      startDate,
      estimatedHours,
    } = body

    if (!title || !projectId || !creatorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, projectId, creatorId' },
        { status: 400 }
      )
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId,
        creatorId,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        estimatedHours,
      },
      include: {
        assignee: true,
        creator: true,
        project: true,
      },
    })

    return NextResponse.json(
      { success: true, data: newTask },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
