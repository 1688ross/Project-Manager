const API = 'https://theprojectmanager-five.vercel.app'

async function seed() {
  // First, ensure the demo user exists by calling a seed-user endpoint
  // We need to create the user directly via the database since there's no user API
  // Let's use a local prisma call instead
  
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  // Ensure demo user exists
  const user = await prisma.user.upsert({
    where: { id: 'user-demo' },
    update: {},
    create: {
      id: 'user-demo',
      email: 'ross@demo.com',
      name: 'Ross',
      role: 'ADMIN',
    },
  })
  console.log(`User ready: ${user.name} (${user.id})`)

  // Create projects
  const projects = [
    {
      title: 'Brand Refresh — Coastal Living Co.',
      description: 'Complete brand identity refresh including logo redesign, brand guidelines, social media templates, and website assets.',
      ownerId: 'user-demo',
      status: 'ACTIVE',
      startDate: '2026-03-01',
      endDate: '2026-04-30',
    },
    {
      title: 'Summer Campaign — Horizon Fitness',
      description: 'Integrated marketing campaign for summer product launch. Includes print ads, digital banners, email templates, and social content.',
      ownerId: 'user-demo',
      status: 'ACTIVE',
      startDate: '2026-03-10',
      endDate: '2026-05-15',
    },
    {
      title: 'Quarterly Newsletter — FinTrust',
      description: 'Q1 2026 client newsletter design and production. 8-page layout with infographics.',
      ownerId: 'user-demo',
      status: 'ON_HOLD',
      startDate: '2026-02-15',
      endDate: '2026-03-28',
    },
  ]

  const projectIds = []
  for (const p of projects) {
    const res = await fetch(`${API}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    })
    const data = await res.json()
    projectIds.push(data.data.id)
    console.log(`Created project: ${data.data.title} (${data.data.id})`)
  }

  // Create tasks for Project 1 (Brand Refresh)
  const tasksP1 = [
    {
      title: 'Logo concept sketches',
      description: 'Create 5 initial logo concepts based on client brief. Explore coastal themes with modern minimalist approach.',
      projectId: projectIds[0],
      creatorId: 'user-demo',
      status: 'COMPLETED',
      priority: 'HIGH',
      startDate: '2026-03-01',
      dueDate: '2026-03-08',
    },
    {
      title: 'Logo refinement — Round 2',
      description: 'Refine top 2 concepts based on client feedback. Add color variations and mockups.',
      projectId: projectIds[0],
      creatorId: 'user-demo',
      status: 'WAITING_FEEDBACK',
      priority: 'HIGH',
      startDate: '2026-03-10',
      dueDate: '2026-03-20',
      estimatedHours: 12,
    },
    {
      title: 'Brand guidelines document',
      description: 'Full brand guide: logo usage, color palette, typography, spacing rules, examples.',
      projectId: projectIds[0],
      creatorId: 'user-demo',
      status: 'IN_PRODUCTION',
      priority: 'MEDIUM',
      startDate: '2026-03-15',
      dueDate: '2026-04-01',
      estimatedHours: 20,
    },
    {
      title: 'Social media templates',
      description: 'Instagram, Facebook, and LinkedIn post templates (12 total). Stories and feed formats.',
      projectId: projectIds[0],
      creatorId: 'user-demo',
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: '2026-04-01',
      dueDate: '2026-04-15',
      estimatedHours: 16,
    },
    {
      title: 'Website asset export',
      description: 'Export all web-ready assets: favicon, OG images, header logos, footer logos.',
      projectId: projectIds[0],
      creatorId: 'user-demo',
      status: 'TODO',
      priority: 'LOW',
      startDate: '2026-04-15',
      dueDate: '2026-04-25',
    },
  ]

  // Create tasks for Project 2 (Summer Campaign)
  const tasksP2 = [
    {
      title: 'Campaign strategy & moodboard',
      description: 'Define campaign direction, target audience segments, key messaging, and visual moodboard.',
      projectId: projectIds[1],
      creatorId: 'user-demo',
      status: 'APPROVED',
      priority: 'URGENT',
      startDate: '2026-03-10',
      dueDate: '2026-03-15',
      estimatedHours: 8,
      actualHours: 6,
    },
    {
      title: 'Print ad designs (3 sizes)',
      description: 'Full page, half page, and quarter page magazine ads. Summer fitness theme.',
      projectId: projectIds[1],
      creatorId: 'user-demo',
      status: 'SENT_TO_CLIENT',
      priority: 'HIGH',
      startDate: '2026-03-16',
      dueDate: '2026-03-25',
      estimatedHours: 15,
      actualHours: 14,
    },
    {
      title: 'Digital banner set',
      description: 'Responsive banner ads: leaderboard, skyscraper, medium rectangle, mobile. Animated and static.',
      projectId: projectIds[1],
      creatorId: 'user-demo',
      status: 'IN_PRODUCTION',
      priority: 'HIGH',
      startDate: '2026-03-20',
      dueDate: '2026-04-05',
      estimatedHours: 18,
    },
    {
      title: 'Email template design',
      description: 'Launch announcement email and 3-email drip sequence. Responsive HTML templates.',
      projectId: projectIds[1],
      creatorId: 'user-demo',
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: '2026-04-01',
      dueDate: '2026-04-20',
      estimatedHours: 12,
    },
    {
      title: 'Social content calendar',
      description: '30-day social content plan with 15 designed posts. Instagram Reels storyboards.',
      projectId: projectIds[1],
      creatorId: 'user-demo',
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: '2026-04-10',
      dueDate: '2026-05-01',
    },
  ]

  // Create tasks for Project 3 (Newsletter)
  const tasksP3 = [
    {
      title: 'Newsletter layout wireframe',
      description: '8-page wireframe with content blocks, infographic placement, and ad spaces.',
      projectId: projectIds[2],
      creatorId: 'user-demo',
      status: 'MAKING_CHANGES',
      priority: 'HIGH',
      startDate: '2026-02-15',
      dueDate: '2026-02-28',
      estimatedHours: 6,
      actualHours: 8,
    },
    {
      title: 'Infographic design (3)',
      description: 'Q1 performance infographic, market trends chart, and product comparison visual.',
      projectId: projectIds[2],
      creatorId: 'user-demo',
      status: 'WAITING_FEEDBACK',
      priority: 'URGENT',
      startDate: '2026-03-01',
      dueDate: '2026-03-15',
      estimatedHours: 10,
    },
    {
      title: 'Final PDF production',
      description: 'Assemble final newsletter, print-ready PDF with bleeds and crop marks.',
      projectId: projectIds[2],
      creatorId: 'user-demo',
      status: 'TODO',
      priority: 'HIGH',
      startDate: '2026-03-20',
      dueDate: '2026-03-28',
    },
  ]

  const allTasks = [...tasksP1, ...tasksP2, ...tasksP3]
  const taskIds = []
  for (const t of allTasks) {
    const res = await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    })
    const data = await res.json()
    taskIds.push({ id: data.data.id, title: data.data.title, projectId: t.projectId })
    console.log(`  Task: ${data.data.title} [${data.data.status}]`)
  }

  // Now we need to create milestone history entries directly via a special seed endpoint
  // Since we don't have a direct milestone API, we'll simulate by calling analyze-email 
  // Actually, let's just use the tasks API to get task IDs, then create milestones...
  // The analyze-email endpoint creates milestones, but we need an easier way.
  // Let me check if we can create a quick seed API

  console.log('\n=== Seed complete! ===')
  console.log(`${projectIds.length} projects`)
  console.log(`${taskIds.length} tasks`)
  console.log('\nRefresh your browser to see the data.')
}

seed().catch(console.error)
