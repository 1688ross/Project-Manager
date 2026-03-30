import { NextRequest, NextResponse } from 'next/server'
import { createOAuthClient } from '@/lib/google-drive'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/drive?error=access_denied', request.url))
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    const oauth2Client = createOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: profile } = await oauth2.userinfo.get()

    if (!profile.email) {
      return NextResponse.redirect(new URL('/drive?error=no_email', request.url))
    }

    // Upsert user record
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { name: profile.name || profile.email },
      create: {
        email: profile.email,
        name: profile.name || profile.email,
        role: 'TEAM_MEMBER',
      },
    })

    // Store/update OAuth tokens
    await prisma.googleAuth.upsert({
      where: { userId: user.id },
      update: {
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        userId: user.id,
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    })

    return NextResponse.redirect(new URL(`/drive?connected=${encodeURIComponent(profile.email)}`, request.url))
  } catch (err) {
    console.error('Drive OAuth callback error:', err)
    return NextResponse.redirect(new URL('/drive?error=auth_failed', request.url))
  }
}
