import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Map client names from project titles (format: "Client — Project")
  const projects = await prisma.project.findMany()

  const clientNames = new Set<string>()
  for (const project of projects) {
    const match = project.title.match(/^(.+?)\s*—\s*/)
    if (match) {
      clientNames.add(match[1].trim())
    }
  }

  console.log(`Found ${clientNames.size} unique clients from projects\n`)

  for (const name of clientNames) {
    const emailSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
    const email = `contact@${emailSlug}.com`

    const client = await prisma.clientAccount.upsert({
      where: { email },
      update: { name },
      create: { name, email },
    })

    // Link all projects that start with this client name
    const clientProjects = projects.filter(p => p.title.startsWith(`${name} —`))
    for (const project of clientProjects) {
      await prisma.project.update({
        where: { id: project.id },
        data: { clientId: client.id },
      })
    }

    console.log(`  ${name} — linked ${clientProjects.length} project(s)`)
  }

  console.log('\nDone! All clients created and projects linked.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
