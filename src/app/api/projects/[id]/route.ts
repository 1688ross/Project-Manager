import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const { id } = params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        tasks: {
          include: {
            assignee: true,
            creator: true,
            history: {
              orderBy: {
                dateOccurred: 'asc',
              },
            },
          },
        },
        assets: true,
        timeline: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
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
    const { id } = params
    const body = await request.json()
    const { title, description, status, startDate, endDate, teamId } = body

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        teamId,
      },
      include: {
        owner: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProject,
    })
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
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
    const { id } = params

    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
