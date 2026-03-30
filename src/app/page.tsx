'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Settings, Plus } from 'lucide-react'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
                PM
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Creative Manager
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition font-medium">
                Dashboard
              </Link>
              <Link href="/projects" className="text-gray-400 hover:text-white transition font-medium">
                Projects
              </Link>
              <Link href="/clients" className="text-gray-400 hover:text-white transition font-medium">
                Clients
              </Link>
              <Link href="/calendar" className="text-gray-400 hover:text-white transition font-medium">
                Calendar
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/projects/new"
                className="btn-glass flex items-center space-x-2 text-white"
              >
                <Plus size={18} />
                <span>New Project</span>
              </Link>
              <button className="text-gray-400 hover:text-white transition">
                <Settings size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-white/10">
              <Link href="/dashboard" className="block py-2 px-0 text-gray-400 hover:text-white">
                Dashboard
              </Link>
              <Link href="/projects" className="block py-2 px-0 text-gray-400 hover:text-white">
                Projects
              </Link>
              <Link href="/clients" className="block py-2 px-0 text-gray-400 hover:text-white">
                Clients
              </Link>
              <Link href="/calendar" className="block py-2 px-0 text-gray-400 hover:text-white">
                Calendar
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Creative Project Management
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Visualize your creative workflow with Gantt charts, manage assets, collaborate with clients, and keep your team aligned with daily task lists and real-time updates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/projects"
              className="btn-glass px-8 py-4 text-white font-semibold text-lg"
            >
              View Projects
            </Link>
            <Link
              href="/dashboard"
              className="btn-glass-secondary px-8 py-4 text-gray-300 font-semibold text-lg"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            {
              icon: '📊',
              title: 'Interactive Gantt Charts',
              description: 'Visualize project timelines with personal and team-wide Gantt charts for complete visibility'
            },
            {
              icon: '📁',
              title: 'Asset Management',
              description: 'Upload, organize, and share assets with Google Drive integration and auto-categorization'
            },
            {
              icon: '👥',
              title: 'Team Collaboration',
              description: 'Assign tasks, share feedback, add comments, and keep everyone informed in real-time'
            },
            {
              icon: '📧',
              title: 'Email Integration',
              description: 'Auto-sync projects and tasks from email, generating timelines and organizing deliverables'
            },
            {
              icon: '📋',
              title: 'Daily Task Lists',
              description: 'Get personalized daily task lists with status tracking and deadline management'
            },
            {
              icon: '🎨',
              title: 'Brand Guidelines',
              description: 'Auto-generate visual brand guidelines from client assets and color palettes'
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-card p-8 hover:bg-white/10 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Task Status Markers */}
        <div className="mt-20 glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Project Status Tracking</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'In Production', color: 'bg-blue-500/20 text-blue-300' },
              { label: 'Sent to Client', color: 'bg-purple-500/20 text-purple-300' },
              { label: 'Waiting Feedback', color: 'bg-yellow-500/20 text-yellow-300' },
              { label: 'Making Changes', color: 'bg-orange-500/20 text-orange-300' },
              { label: 'Submitting Final', color: 'bg-green-500/20 text-green-300' },
              { label: 'Round 2 Review', color: 'bg-indigo-500/20 text-indigo-300' },
              { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300' },
              { label: 'Needs Printing', color: 'bg-pink-500/20 text-pink-300' },
              { label: 'Launched', color: 'bg-teal-500/20 text-teal-300' },
              { label: 'Completed', color: 'bg-slate-500/20 text-slate-300' },
            ].map((status, index) => (
              <div key={index} className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${status.color}`}>
                {status.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2024 Creative Project Manager. Built for creative teams.</p>
        </div>
      </footer>
    </div>
  )
}
