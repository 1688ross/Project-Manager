const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addHistory() {
  const tasks = await prisma.task.findMany({ select: { id: true, title: true, status: true } })

  const entries = []

  for (const task of tasks) {
    if (task.status === 'COMPLETED' || task.status === 'APPROVED') {
      entries.push({ taskId: task.id, eventType: 'SUBMITTED', dateOccurred: new Date('2026-03-05'), notes: 'Initial concepts sent to client for review.' })
      entries.push({ taskId: task.id, eventType: 'FEEDBACK', dateOccurred: new Date('2026-03-08'), notes: 'Client loved direction #3. Requested slight color adjustments.' })
      entries.push({ taskId: task.id, eventType: 'APPROVED', dateOccurred: new Date('2026-03-12'), notes: 'Client approved final version. Ready for production.' })
    }
    if (task.status === 'WAITING_FEEDBACK') {
      entries.push({ taskId: task.id, eventType: 'SUBMITTED', dateOccurred: new Date('2026-03-18'), notes: 'Draft sent to client for feedback.' })
    }
    if (task.status === 'SENT_TO_CLIENT') {
      entries.push({ taskId: task.id, eventType: 'SUBMITTED', dateOccurred: new Date('2026-03-22'), notes: 'Print ad designs submitted in 3 size variations.' })
    }
    if (task.status === 'MAKING_CHANGES') {
      entries.push({ taskId: task.id, eventType: 'SUBMITTED', dateOccurred: new Date('2026-02-20'), notes: 'Initial wireframe sent for review.' })
      entries.push({ taskId: task.id, eventType: 'FEEDBACK', dateOccurred: new Date('2026-02-25'), notes: 'Client wants more space for infographics on pages 3-4. Adjust layout.' })
    }
  }

  for (const e of entries) {
    await prisma.milestoneHistory.create({ data: e })
  }

  console.log('Created ' + entries.length + ' milestone history entries')
  await prisma.$disconnect()
}

addHistory().catch(e => { console.error(e); process.exit(1) })
