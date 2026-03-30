import { google } from 'googleapis'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

export function createOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
}

export function getAuthUrl() {
  const oauth2Client = createOAuthClient()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  })
}

export async function getAuthenticatedDrive(accessToken: string, refreshToken: string, expiresAt: Date | null) {
  const oauth2Client = createOAuthClient()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiresAt ? expiresAt.getTime() : undefined,
  })

  // Refresh if expired or expiring in next 5 minutes
  const now = Date.now()
  const expiry = expiresAt ? expiresAt.getTime() : 0
  if (expiry < now + 5 * 60 * 1000) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    oauth2Client.setCredentials(credentials)
    return {
      drive: google.drive({ version: 'v3', auth: oauth2Client }),
      newTokens: credentials,
    }
  }

  return {
    drive: google.drive({ version: 'v3', auth: oauth2Client }),
    newTokens: null,
  }
}
