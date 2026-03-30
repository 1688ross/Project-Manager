import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedDrive } from '@/lib/google-drive'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const folderId = searchParams.get('folderId') || 'root'

  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 })
  }

  try {
    const { prisma } = await import('@/lib/prisma')

    const auth = await prisma.googleAuth.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    })

    if (!auth?.refreshToken) {
      return NextResponse.json({ success: false, error: 'Drive not connected for this user' }, { status: 401 })
    }

    const { drive, newTokens } = await getAuthenticatedDrive(
      auth.accessToken || '',
      auth.refreshToken,
      auth.expiresAt
    )

    // Persist refreshed tokens if needed
    if (newTokens?.access_token) {
      await prisma.googleAuth.update({
        where: { userId },
        data: {
          accessToken: newTokens.access_token,
          expiresAt: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
        },
      })
    }

    const query = folderId === 'root'
      ? `'root' in parents and trashed = false`
      : `'${folderId}' in parents and trashed = false`

    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink, iconLink, parents)',
      orderBy: 'folder,name',
      pageSize: 100,
    })

    // Get folder path for breadcrumbs
    let folderName = 'My Drive'
    if (folderId !== 'root') {
      const folder = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,parents',
      })
      folderName = folder.data.name || folderId
    }

    return NextResponse.json({
      success: true,
      files: res.data.files || [],
      folderName,
      folderId,
    })
  } catch (err) {
    console.error('Drive files error:', err)
    return NextResponse.json({ success: false, error: 'Failed to list files' }, { status: 500 })
  }
}
