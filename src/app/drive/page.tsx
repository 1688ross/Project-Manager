'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import DriveFileBrowser from '@/components/drive/DriveFileBrowser'

function DrivePageContent() {
  const searchParams = useSearchParams()
  const connected = searchParams.get('connected')
  const error = searchParams.get('error')
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (connected) {
      setBanner({ type: 'success', message: `Google Drive connected for ${connected}` })
      setTimeout(() => setBanner(null), 4000)
    } else if (error) {
      const messages: Record<string, string> = {
        access_denied: 'Access was denied. Please try connecting again.',
        no_email: 'Could not retrieve your Google email.',
        auth_failed: 'Authentication failed. Please try again.',
      }
      setBanner({ type: 'error', message: messages[error] || 'Something went wrong.' })
    }
  }, [connected, error])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Drive</h1>
        <p className="text-sm text-zinc-500 mt-1">Browse and link Google Drive files to your projects</p>
      </div>

      {banner && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          banner.type === 'success'
            ? 'bg-green-900/30 border border-green-700/50 text-green-400'
            : 'bg-red-900/30 border border-red-700/50 text-red-400'
        }`}>
          {banner.message}
        </div>
      )}

      <DriveFileBrowser />
    </div>
  )
}

export default function DrivePage() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-500">Loading...</div>}>
      <DrivePageContent />
    </Suspense>
  )
}
