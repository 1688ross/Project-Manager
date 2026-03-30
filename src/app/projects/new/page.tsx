'use client'

import { useRouter } from 'next/navigation'
import { ProjectForm } from '@/components/forms/ProjectForm'

export default function NewProjectPage() {
  const router = useRouter()

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerId: 'user-demo', // TODO: Use actual logged-in user
          status: formData.status || 'ACTIVE',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const result = await response.json()
      router.push(`/projects/${result.data.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    }
  }

  const handleCancel = () => {
    router.push('/projects')
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create New Project
          </h1>
          <p className="text-gray-400 mb-8">
            Start a new creative project by filling out the details below
          </p>

          <ProjectForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  )
}
