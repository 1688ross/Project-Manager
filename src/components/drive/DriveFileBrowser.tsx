'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Folder, File, FileText, FileImage, FileVideo, FileAudio,
  Search, ChevronRight, Home, ExternalLink, RefreshCw, Loader2
} from 'lucide-react'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime?: string
  thumbnailLink?: string
  webViewLink?: string
  iconLink?: string
  parents?: string[]
}

interface ConnectedUser {
  userId: string
  email: string
  name: string | null
}

interface BreadcrumbItem {
  id: string
  name: string
}

function fileIcon(mimeType: string) {
  if (mimeType === 'application/vnd.google-apps.folder') return <Folder className="w-5 h-5 text-yellow-400" />
  if (mimeType.startsWith('image/') || mimeType.includes('google-apps.drawing')) return <FileImage className="w-5 h-5 text-purple-400" />
  if (mimeType.startsWith('video/')) return <FileVideo className="w-5 h-5 text-red-400" />
  if (mimeType.startsWith('audio/')) return <FileAudio className="w-5 h-5 text-green-400" />
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return <FileText className="w-5 h-5 text-blue-400" />
  return <File className="w-5 h-5 text-zinc-400" />
}

function formatSize(size?: string) {
  if (!size) return '—'
  const bytes = parseInt(size)
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DriveFileBrowser() {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [files, setFiles] = useState<DriveFile[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DriveFile[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load connected users
  useEffect(() => {
    fetch('/api/drive/status')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.users.length > 0) {
          setConnectedUsers(data.users)
          setSelectedUserId(data.users[0].userId)
        }
      })
      .catch(() => setError('Failed to load connected accounts'))
  }, [])

  // Load files when user or folder changes
  const loadFiles = useCallback(async (userId: string, folderId: string) => {
    if (!userId) return
    setLoading(true)
    setError(null)
    setSearchResults(null)
    setSearchQuery('')
    try {
      const res = await fetch(`/api/drive/files?userId=${userId}&folderId=${folderId}`)
      const data = await res.json()
      if (data.success) {
        setFiles(data.files)
      } else {
        setError(data.error || 'Failed to load files')
      }
    } catch {
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      loadFiles(selectedUserId, 'root')
    }
  }, [selectedUserId, loadFiles])

  const openFolder = (file: DriveFile) => {
    setBreadcrumbs(prev => [...prev, { id: file.id, name: file.name }])
    loadFiles(selectedUserId, file.id)
  }

  const navigateBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index]
    setBreadcrumbs(prev => prev.slice(0, index + 1))
    loadFiles(selectedUserId, crumb.id)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedUserId) return
    setSearching(true)
    setError(null)
    try {
      const res = await fetch(`/api/drive/search?userId=${selectedUserId}&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data.success) {
        setSearchResults(data.files)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch {
      setError('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchResults(null)
    setSearchQuery('')
  }

  const displayFiles = searchResults ?? files
  const isSearching = searchResults !== null

  if (connectedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Folder className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-200 mb-2">No Google Drive connected</h2>
        <p className="text-zinc-500 mb-6 max-w-sm">Connect a Google account to browse and link Drive files to your projects.</p>
        <a
          href="/api/drive/auth"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Connect Google Drive
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header: account switcher + connect another */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Account:</span>
          <select
            value={selectedUserId}
            onChange={e => {
              setSelectedUserId(e.target.value)
              setBreadcrumbs([{ id: 'root', name: 'My Drive' }])
            }}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {connectedUsers.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.email}
              </option>
            ))}
          </select>
          <button
            onClick={() => loadFiles(selectedUserId, breadcrumbs[breadcrumbs.length - 1].id)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <a
          href="/api/drive/auth"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          + Connect another account
        </a>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Drive files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-600"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
        {isSearching && (
          <button
            onClick={clearSearch}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Breadcrumbs */}
      {!isSearching && (
        <div className="flex items-center gap-1 text-sm text-zinc-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              {i === 0 ? (
                <button
                  onClick={() => navigateBreadcrumb(0)}
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>My Drive</span>
                </button>
              ) : i === breadcrumbs.length - 1 ? (
                <span className="text-zinc-300 font-medium">{crumb.name}</span>
              ) : (
                <button
                  onClick={() => navigateBreadcrumb(i)}
                  className="hover:text-zinc-300 transition-colors"
                >
                  {crumb.name}
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {isSearching && (
        <p className="text-sm text-zinc-500">
          Search results for <span className="text-zinc-300">&quot;{searchQuery}&quot;</span> — {displayFiles.length} files found
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* File list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading files...</span>
          </div>
        ) : displayFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Folder className="w-10 h-10 mb-2" />
            <p className="text-sm">{isSearching ? 'No files matched your search' : 'This folder is empty'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Modified</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Size</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {displayFiles.map(file => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder'
                return (
                  <tr
                    key={file.id}
                    onClick={() => isFolder ? openFolder(file) : undefined}
                    className={`group transition-colors ${isFolder ? 'cursor-pointer hover:bg-zinc-800/60' : 'hover:bg-zinc-800/30'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {fileIcon(file.mimeType)}
                        <span className={`text-zinc-200 truncate max-w-xs ${isFolder ? 'font-medium' : ''}`}>
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                      {formatDate(file.modifiedTime)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">
                      {isFolder ? '—' : formatSize(file.size)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-blue-400"
                          title="Open in Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
