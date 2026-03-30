import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(_request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const clients = await prisma.clientAccount.findMany({
      include: {
        projects: {
          include: {
            tasks: true,
          },
        },
        contacts: true,
        branding: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: clients,
    })
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await request.json()
    const { name, email, logo } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    const newClient = await prisma.clientAccount.create({
      data: {
        name,
        email,
        logo,
      },
      include: {
        projects: true,
        contacts: true,
      },
    })

    return NextResponse.json(
      { success: true, data: newClient },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
