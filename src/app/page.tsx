'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Settings, Plus } from 'lucide-react'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                PM
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Creative Manager
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Dashboard
              </Link>
              <Link href="/projects" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Projects
              </Link>
              <Link href="/team" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Team
              </Link>
              <Link href="/assets" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Assets
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/projects/new"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus size={18} />
                <span>New Project</span>
              </Link>
              <button className="text-gray-700 hover:text-gray-900">
                <Settings size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t">
              <Link href="/dashboard" className="block py-2 px-0 text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/projects" className="block py-2 px-0 text-gray-700 hover:text-blue-600">
                Projects
              </Link>
              <Link href="/team" className="block py-2 px-0 text-gray-700 hover:text-blue-600">
                Team
              </Link>
              <Link href="/assets" className="block py-2 px-0 text-gray-700 hover:text-blue-600">
                Assets
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Creative Project Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Visualize your creative workflow with Gantt charts, manage assets, collaborate with clients, and keep your team aligned with daily task lists and real-time updates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/projects"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              View Projects
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
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
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Task Status Markers */}
        <div className="mt-20 bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Status Tracking</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'In Production', color: 'bg-blue-100 text-blue-800' },
              { label: 'Sent to Client', color: 'bg-purple-100 text-purple-800' },
              { label: 'Waiting Feedback', color: 'bg-yellow-100 text-yellow-800' },
              { label: 'Making Changes', color: 'bg-orange-100 text-orange-800' },
              { label: 'Submitting Final', color: 'bg-green-100 text-green-800' },
              { label: 'Round 2 Review', color: 'bg-indigo-100 text-indigo-800' },
              { label: 'Approved', color: 'bg-emerald-100 text-emerald-800' },
              { label: 'Needs Printing', color: 'bg-pink-100 text-pink-800' },
              { label: 'Launched', color: 'bg-teal-100 text-teal-800' },
              { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
            ].map((status, index) => (
              <div key={index} className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${status.color}`}>
                {status.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2024 Creative Project Manager. Built for creative teams.</p>
        </div>
      </footer>
    </div>
  )
}
