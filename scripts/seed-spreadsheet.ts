import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.milestoneHistory.deleteMany()
  await prisma.subTask.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.taskFile.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.task.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.brandGuide.deleteMany()
  await prisma.timeline.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.project.deleteMany()
  console.log('Existing projects and tasks cleared.')

  // Create users: Ross and Loring
  const ross = await prisma.user.upsert({
    where: { email: 'ross@example.com' },
    update: {},
    create: {
      email: 'ross@example.com',
      name: 'Ross',
      role: 'TEAM_LEAD',
    },
  })

  const loring = await prisma.user.upsert({
    where: { email: 'loring@example.com' },
    update: {},
    create: {
      email: 'loring@example.com',
      name: 'Loring',
      role: 'TEAM_MEMBER',
    },
  })

  console.log('Users ready:', ross.name, loring.name)

  // Status mapping from spreadsheet to app statuses
  const statusMap: Record<string, string> = {
    'In Production': 'IN_PRODUCTION',
    'Waiting Feedback': 'WAITING_FEEDBACK',
    'Completed': 'COMPLETED',
    'Making Changes': 'MAKING_CHANGES',
    'Sent to Client': 'SENT_TO_CLIENT',
    'Approved': 'APPROVED',
    'Brainstorming': 'TODO',
    'Needs Printing': 'NEEDS_PRINTING',
  }

  // Define all projects and their tasks from the spreadsheet
  const data = [
    {
      client: 'Achieve Financial',
      project: 'Spring Campaign',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Spring Campaign: Plan and develop creative concepts (to be discussed with Loring).', status: 'In Production', assignees: ['loring'] },
      ],
    },
    {
      client: 'Achieve Financial',
      project: 'TV Commercial Series',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Shorten member videos to <60s and update voiceover for clarity.', status: 'Waiting Feedback', assignees: ['ross'] },
        { title: 'Develop additional video version using branded photography.', status: 'Waiting Feedback', assignees: ['ross'] },
      ],
    },
    {
      client: 'The Rowan Center',
      project: 'Rebrand',
      projectStatus: 'COMPLETED',
      tasks: [
        { title: 'Finalize Annual Report (Impact metrics & Leadership transition letter).', status: 'Completed', assignees: ['loring'] },
      ],
    },
    {
      client: 'The Rowan Center',
      project: 'Website',
      projectStatus: 'COMPLETED',
      tasks: [
        { title: 'Website Rebrand: Update "Hotline" to "Helpline" and "Clinic" to "Practice."', status: 'Completed', assignees: ['ross'] },
      ],
    },
    {
      client: 'KidSafeHQ',
      project: 'Website',
      projectStatus: 'COMPLETED',
      tasks: [
        { title: 'Finalize parent/caregiver one-pager and FAQ integration (700+ items).', status: 'Completed', assignees: ['ross'] },
      ],
    },
    {
      client: 'Evergreen Walk',
      project: 'Leasing',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Window Graphics: Finalize designs for spaces 827 and 810 in Canva.', status: 'Making Changes', assignees: ['ross', 'loring'] },
        { title: 'Stonewall Kitchen: Confirm design theme based on new specs and measurements.', status: 'Making Changes', assignees: ['ross', 'loring'] },
      ],
    },
    {
      client: 'Winterberry Gardens',
      project: 'Print Materials',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Create new folder design using the previous version as a simplified jumping-off point.', status: 'Sent to Client', assignees: ['ross', 'loring'] },
      ],
    },
    {
      client: 'Klingberg',
      project: 'Rebranding Collateral',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Review brochure soundbytes and polish foster care mailers from Kara Preston.', status: 'Waiting Feedback', assignees: ['loring'] },
      ],
    },
    {
      client: 'Blue Back Square',
      project: 'Event Collateral',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Update Bar Crawl graphics (April 30th) with Brand Street Properties logo.', status: 'Making Changes', assignees: ['ross'] },
      ],
    },
    {
      client: 'Blue Back Square',
      project: 'Property Collateral',
      projectStatus: 'COMPLETED',
      tasks: [
        { title: 'Update print directory: remove Place 2 Be, add Lush Pharmacy.', status: 'Completed', assignees: ['ross'] },
      ],
    },
    {
      client: 'LeadingAge',
      project: 'Brochure',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Finalize membership brochure (Awaiting feedback on printing/pricing).', status: 'Needs Printing', assignees: ['loring'] },
      ],
    },
    {
      client: 'Vesta Corp',
      project: 'Websites',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Schedule project kick-off for digital strategy and Hettig acquisition.', status: 'Sent to Client', assignees: ['ross', 'loring'] },
      ],
    },
    {
      client: 'Centennial',
      project: 'ESG Report',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Waiting on Content from client.', status: 'Brainstorming', assignees: ['loring'] },
      ],
    },
    {
      client: 'Centennial',
      project: 'Corporate',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Finalize ICSC Vegas booth graphics and lounge wall map.', status: 'In Production', assignees: ['loring'] },
      ],
    },
    {
      client: 'Brookfield Properties',
      project: 'Rebrand',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Prepare for May brand transition (Leasing brochures, website, LinkedIn).', status: 'In Production', assignees: ['ross', 'loring'] },
      ],
    },
    {
      client: 'Second Horizon',
      project: 'Leasing Brochures & Microsites',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Orange Park Mall: Finalize brochure revisions and reshoot photo swaps.', status: 'Waiting Feedback', assignees: ['ross', 'loring'] },
        { title: 'Melbourne Square: Process leasing brochure inputs received from Kelsey.', status: 'Waiting Feedback', assignees: ['ross', 'loring'] },
        { title: 'Chicago Ridge: Website maintenance—cleanup pages and update URL slugs.', status: 'Approved', assignees: ['ross', 'loring'] },
        { title: 'System-Wide: Update Master Timeline and coordinate contract numbers with Hannah.', status: 'Completed', assignees: ['ross', 'loring'] },
      ],
    },
    {
      client: 'Town & Country',
      project: 'Website',
      projectStatus: 'ACTIVE',
      tasks: [
        { title: 'Blog Management: Streamline keyword insertion for March/April blogs with David.', status: 'In Production', assignees: ['ross', 'loring'] },
        { title: 'Instagram Integration: Style and connect Smash Balloon plugin for the homepage.', status: 'Completed', assignees: ['ross', 'loring'] },
      ],
    },
    {
      client: 'Comprehensive Orthopaedics',
      project: 'MRI Promotion',
      projectStatus: 'COMPLETED',
      tasks: [
        { title: 'Postcard and Logo.', status: 'Completed', assignees: ['loring'] },
      ],
    },
  ]

  const userMap: Record<string, string> = {
    ross: ross.id,
    loring: loring.id,
  }

  let projectCount = 0
  let taskCount = 0

  for (const entry of data) {
    const projectTitle = `${entry.client} — ${entry.project}`

    const project = await prisma.project.create({
      data: {
        title: projectTitle,
        description: `${entry.project} for ${entry.client}`,
        ownerId: ross.id, // Ross as default owner
        status: entry.projectStatus,
      },
    })
    projectCount++
    console.log(`  Project: ${projectTitle}`)

    for (const task of entry.tasks) {
      const assigneeId = task.assignees[0] ? userMap[task.assignees[0]] : undefined

      await prisma.task.create({
        data: {
          title: task.title,
          projectId: project.id,
          creatorId: ross.id,
          assigneeId,
          status: statusMap[task.status] || 'TODO',
          priority: 'MEDIUM',
        },
      })
      taskCount++
    }
  }

  console.log(`\nDone! Created ${projectCount} projects and ${taskCount} tasks.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
