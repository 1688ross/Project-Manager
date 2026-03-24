import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const category = (formData.get('category') as string) || 'DRAFT'

    if (!file || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing file or projectId' },
        { status: 400 }
      )
    }

    // TODO: Implement actual file storage (AWS S3, Cloudinary, etc.)
    // For now, we'll just store metadata in the database
    const fileUrl = `/uploads/${Date.now()}-${file.name}`

    const newAsset = await prisma.asset.create({
      data: {
        projectId,
        name: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        category,
      },
    })

    return NextResponse.json(
      { success: true, data: newAsset },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to upload asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload asset' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where = projectId ? { projectId } : {}

    const assets = await prisma.asset.findMany({
      where,
    })

    return NextResponse.json({
      success: true,
      data: assets,
    })
  } catch (error) {
    console.error('Failed to fetch assets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}
