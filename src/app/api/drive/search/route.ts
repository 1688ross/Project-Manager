import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedDrive } from '@/lib/google-drive'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const query = searchParams.get('q')

  if (!userId || !query) {
    return NextResponse.json({ success: false, error: 'userId and q required' }, { status: 400 })
  }

  try {
    const { prisma } = await import('@/lib/prisma')

    const auth = await prisma.googleAuth.findUnique({
      where: { userId },
    })

    if (!auth?.refreshToken) {
      return NextResponse.json({ success: false, error: 'Drive not connected' }, { status: 401 })
    }

    const { drive, newTokens } = await getAuthenticatedDrive(
      auth.accessToken || '',
      auth.refreshToken,
      auth.expiresAt
    )

    if (newTokens?.access_token) {
      await prisma.googleAuth.update({
        where: { userId },
        data: {
          accessToken: newTokens.access_token,
          expiresAt: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
        },
      })
    }

    const res = await drive.files.list({
      q: `fullText contains '${query.replace(/'/g, "\\'")}' and trashed = false`,
      fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink, iconLink, parents)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    })

    return NextResponse.json({
      success: true,
      files: res.data.files || [],
      query,
    })
  } catch (err) {
    console.error('Drive search error:', err)
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
  }
}
