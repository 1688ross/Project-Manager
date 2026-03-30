import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')

    const connected = await prisma.googleAuth.findMany({
      where: {
        refreshToken: { not: null },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    })

    return NextResponse.json({
      success: true,
      users: connected.map(auth => ({
        userId: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        expiresAt: auth.expiresAt,
      })),
    })
  } catch (err) {
    console.error('Drive status error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load status' }, { status: 500 })
  }
}
