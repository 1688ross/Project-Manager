import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: true,
        tasks: true,
        assets: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, ownerId, status, startDate, endDate, teamId } = body

    if (!title || !ownerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, ownerId' },
        { status: 400 }
      )
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        ownerId,
        status: status || 'ACTIVE',
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        teamId,
      },
      include: {
        owner: true,
      },
    })

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
