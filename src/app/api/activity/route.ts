import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')

    const events = await prisma.milestoneHistory.findMany({
      take: 20,
      orderBy: { dateOccurred: 'desc' },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: {
              select: { id: true, title: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Failed to fetch activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
