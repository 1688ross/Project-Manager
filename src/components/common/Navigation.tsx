'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Home, LayoutDashboard, CalendarDays, Building2, FolderKanban, HardDrive } from 'lucide-react'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { href: '/clients', icon: Building2, label: 'Clients' },
    { href: '/drive', icon: HardDrive, label: 'Drive' },
  ]

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="hidden sm:flex items-center space-x-1 ml-2">
              {links.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/10 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
            {/* Mobile nav */}
            <div className="flex sm:hidden items-center space-x-1 ml-2">
              {links.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={label}
                  >
                    <Icon size={18} />
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
              PM
            </div>
            <span className="hidden sm:inline text-sm font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Creative Manager
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
