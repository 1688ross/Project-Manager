'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react'

export default function Navigation() {
  const router = useRouter()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition"
              title="Go back"
            >
              <ArrowLeft size={20} />
              <span className="sr-only">Back</span>
            </button>
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition"
              title="Home"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition"
              title="Dashboard"
            >
              <LayoutDashboard size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
          <div className="text-lg font-bold text-gray-900">
            Project Manager
          </div>
        </div>
      </div>
    </nav>
  )
}
