import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await request.json()
    const { name, email, phone, role, primary } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // If setting as primary, unset existing primary
    if (primary) {
      await prisma.clientContact.updateMany({
        where: { clientId: params.id, primary: true },
        data: { primary: false },
      })
    }

    const contact = await prisma.clientContact.create({
      data: {
        clientId: params.id,
        name,
        email,
        phone,
        role,
        primary: primary || false,
      },
    })

    return NextResponse.json(
      { success: true, data: contact },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  _: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Missing contactId' },
        { status: 400 }
      )
    }

    await prisma.clientContact.delete({
      where: { id: contactId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
