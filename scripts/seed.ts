import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  // Create a demo user
  const user = await prisma.user.create({
    data: {
      id: 'user-demo',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'TEAM_LEAD',
    },
  })

  console.log('Created user:', user)

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Website Redesign',
      description: 'Complete redesign of company website with new branding',
      ownerId: user.id,
      status: 'IN_PRODUCTION',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-04-15'),
    },
  })

  const project2 = await prisma.project.create({
    data: {
      title: 'Brand Identity System',
      description: 'Develop comprehensive brand guidelines and visual system',
      ownerId: user.id,
      status: 'SENT_TO_CLIENT',
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-03-30'),
    },
  })

  const project3 = await prisma.project.create({
    data: {
      title: 'Mobile App Design',
      description: 'Design and prototype mobile application',
      ownerId: user.id,
      status: 'ACTIVE',
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-05-10'),
    },
  })

  console.log('Created projects:', { project1, project2, project3 })

  // Create tasks for project 1
  const task1 = await prisma.task.create({
    data: {
      title: 'Design homepage mockups',
      description: 'Create 3 design variations for the homepage',
      projectId: project1.id,
      creatorId: user.id,
      status: 'IN_PRODUCTION',
      priority: 'HIGH',
      dueDate: new Date('2024-03-15'),
      startDate: new Date('2024-03-05'),
      estimatedHours: 16,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Gather client feedback',
      description: 'Collect initial feedback from client on mockups',
      projectId: project1.id,
      creatorId: user.id,
      status: 'WAITING_FEEDBACK',
      priority: 'URGENT',
      dueDate: new Date('2024-03-20'),
      startDate: new Date('2024-03-15'),
      estimatedHours: 4,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      title: 'Update design based on feedback',
      description: 'Incorporate client feedback into designs',
      projectId: project1.id,
      creatorId: user.id,
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date('2024-03-25'),
      startDate: new Date('2024-03-20'),
      estimatedHours: 12,
    },
  })

  // Create tasks for project 2
  const task4 = await prisma.task.create({
    data: {
      title: 'Create color palette',
      description: 'Define primary, secondary, and accent colors',
      projectId: project2.id,
      creatorId: user.id,
      status: 'APPROVED',
      priority: 'HIGH',
      dueDate: new Date('2024-02-28'),
      startDate: new Date('2024-02-20'),
      estimatedHours: 8,
    },
  })

  const task5 = await prisma.task.create({
    data: {
      title: 'Design typography system',
      description: 'Select and define font hierarchy and sizes',
      projectId: project2.id,
      creatorId: user.id,
      status: 'IN_PRODUCTION',
      priority: 'HIGH',
      dueDate: new Date('2024-03-07'),
      startDate: new Date('2024-02-28'),
      estimatedHours: 10,
    },
  })

  const task6 = await prisma.task.create({
    data: {
      title: 'Create component library',
      description: 'Build reusable UI components based on guidelines',
      projectId: project2.id,
      creatorId: user.id,
      status: 'MAKING_CHANGES',
      priority: 'MEDIUM',
      dueDate: new Date('2024-03-25'),
      startDate: new Date('2024-03-08'),
      estimatedHours: 24,
    },
  })

  // Create tasks for project 3
  const task7 = await prisma.task.create({
    data: {
      title: 'User research and interviews',
      description: 'Conduct interviews with target users',
      projectId: project3.id,
      creatorId: user.id,
      status: 'COMPLETED',
      priority: 'URGENT',
      dueDate: new Date('2024-03-20'),
      startDate: new Date('2024-03-10'),
      estimatedHours: 20,
    },
  })

  const task8 = await prisma.task.create({
    data: {
      title: 'Wireframe main screens',
      description: 'Create wireframes for login, dashboard, and settings',
      projectId: project3.id,
      creatorId: user.id,
      status: 'IN_PRODUCTION',
      priority: 'URGENT',
      dueDate: new Date('2024-03-28'),
      startDate: new Date('2024-03-21'),
      estimatedHours: 16,
    },
  })

  console.log('Created tasks:', { task1, task2, task3, task4, task5, task6, task7, task8 })

  // Create milestone history for tasks
  // Task 1: Design homepage mockups - submitted and got feedback
  await prisma.milestoneHistory.create({
    data: {
      taskId: task1.id,
      eventType: 'SUBMITTED',
      dateOccurred: new Date('2024-03-12'),
      notes: 'Submitted 3 homepage mockup variations to client for review',
    },
  })

  await prisma.milestoneHistory.create({
    data: {
      taskId: task1.id,
      eventType: 'FEEDBACK',
      dateOccurred: new Date('2024-03-14'),
      notes: 'Client requested more modern, minimalist approach. Wants blue tones instead of green.',
    },
  })

  // Task 4: Color palette - submitted and approved
  await prisma.milestoneHistory.create({
    data: {
      taskId: task4.id,
      eventType: 'SUBMITTED',
      dateOccurred: new Date('2024-02-25'),
      notes: 'Color palette submitted for client review',
    },
  })

  await prisma.milestoneHistory.create({
    data: {
      taskId: task4.id,
      eventType: 'APPROVED',
      dateOccurred: new Date('2024-02-27'),
      notes: 'Client approved all color selections. Ready for typography phase.',
    },
  })

  // Task 5: Typography - submitted, feedback, resubmitted, approved
  await prisma.milestoneHistory.create({
    data: {
      taskId: task5.id,
      eventType: 'SUBMITTED',
      dateOccurred: new Date('2024-03-03'),
      notes: 'Typography system submitted with font selections and hierarchy',
    },
  })

  await prisma.milestoneHistory.create({
    data: {
      taskId: task5.id,
      eventType: 'FEEDBACK',
      dateOccurred: new Date('2024-03-05'),
      notes: 'Client wants larger h1 sizes and different secondary font. Suggested Georgia or Sepia.',
    },
  })

  // Task 6: Component library - submitted, got feedback, making changes
  await prisma.milestoneHistory.create({
    data: {
      taskId: task6.id,
      eventType: 'SUBMITTED',
      dateOccurred: new Date('2024-03-15'),
      notes: 'Initial component library submitted with 20 core components',
    },
  })

  await prisma.milestoneHistory.create({
    data: {
      taskId: task6.id,
      eventType: 'FEEDBACK',
      dateOccurred: new Date('2024-03-18'),
      notes: 'Client requested larger button sizes, different button states, and accessibility improvements',
    },
  })

  console.log('Created milestone history entries')
  console.log('✅ Seeding complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
