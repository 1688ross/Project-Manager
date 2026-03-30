// Seed Second Horizon Gantt tasks from parsed JSON data
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const prisma = new PrismaClient()

interface ParsedEvent {
  col: number
  date: string  // "2025-02-04"
  symbol: string
  type: string  // "SUBMITTED" | "FEEDBACK" | "APPROVED"
}

interface ParsedTask {
  property: string
  deliverable: string
  startDate: string
  endDate: string
  events: ParsedEvent[]
}

async function main() {
  // Load pre-parsed data from Python parser
  const jsonPath = resolve(__dirname, 'shc-gantt-parsed.json')
  const parsed = JSON.parse(readFileSync(jsonPath, 'utf-8')) as { tasks: ParsedTask[] }
  
  console.log(`Loaded ${parsed.tasks.length} tasks from parsed JSON`)
  // Find the Second Horizon project
  const project = await prisma.project.findFirst({
    where: { title: { contains: 'Second Horizon' } },
  })
  
  if (!project) {
    console.error('Second Horizon project not found!')
    return
  }
  
  // Find a user for creator
  const ross = await prisma.user.findFirst({ where: { name: 'Ross' } })
  if (!ross) {
    console.error('Ross user not found!')
    return
  }
  
  // Delete existing tasks for this project (to re-populate)
  const existingTasks = await prisma.task.findMany({ where: { projectId: project.id } })
  for (const t of existingTasks) {
    await prisma.milestoneHistory.deleteMany({ where: { taskId: t.id } })
  }
  await prisma.task.deleteMany({ where: { projectId: project.id } })
  console.log(`Cleared ${existingTasks.length} old tasks from project`)
  
  // Create new tasks with milestone history
  const eventNotesMap: Record<string, string> = {
    'SUBMITTED': 'Draft sent to Second Horizon for review',
    'FEEDBACK': 'Feedback received from Second Horizon',
    'APPROVED': 'Final deliverable approved',
  }
  
  for (const task of parsed.tasks) {
    const startDate = new Date(task.startDate + 'T12:00:00Z')
    const endDate = new Date(task.endDate + 'T12:00:00Z')
    
    // Determine status based on events
    const lastEvent = task.events[task.events.length - 1]
    let status = 'IN_PRODUCTION'
    if (lastEvent.type === 'APPROVED') {
      status = endDate < new Date() ? 'COMPLETED' : 'IN_PRODUCTION'
    }
    // Check feedback/submission state
    const lastFeedback = [...task.events].reverse().find(e => e.type === 'FEEDBACK')
    const lastSubmission = [...task.events].reverse().find(e => e.type === 'SUBMITTED')
    if (lastFeedback && lastSubmission) {
      if (new Date(lastFeedback.date) > new Date(lastSubmission.date)) {
        status = 'MAKING_CHANGES'
      } else {
        status = 'WAITING_FEEDBACK'
      }
    }
    // Final override: if approved and past, it's completed
    if (lastEvent.type === 'APPROVED' && endDate < new Date()) {
      status = 'COMPLETED'
    }
    
    const dbTask = await prisma.task.create({
      data: {
        title: `${task.property}: ${task.deliverable}`,
        description: `${task.deliverable} deliverable for ${task.property} property`,
        projectId: project.id,
        creatorId: ross.id,
        status,
        priority: 'MEDIUM',
        startDate,
        dueDate: endDate,
      },
    })
    
    // Create milestone history for each event
    for (const event of task.events) {
      await prisma.milestoneHistory.create({
        data: {
          taskId: dbTask.id,
          eventType: event.type,
          dateOccurred: new Date(event.date + 'T12:00:00Z'),
          notes: eventNotesMap[event.type],
        },
      })
    }
    
    console.log(`  Created: ${task.property}: ${task.deliverable} (${status}) — ${task.events.length} milestones`)
  }
  
  console.log('\nDone! Second Horizon tasks and milestones populated.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
