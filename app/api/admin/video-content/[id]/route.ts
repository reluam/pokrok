import { NextRequest, NextResponse } from 'next/server'
import { getVideoContentById, updateVideoContent, deleteVideoContent } from '@/lib/admin-db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await getVideoContentById(params.id)
    
    if (!video) {
      return NextResponse.json({ error: 'Video content not found' }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching video content:', error)
    return NextResponse.json({ error: 'Failed to fetch video content' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    const updatedVideo = await updateVideoContent(params.id, updateData)
    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error('Error updating video content:', error)
    return NextResponse.json({ error: 'Failed to update video content' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteVideoContent(params.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete video content' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Video content deleted successfully' })
  } catch (error) {
    console.error('Error deleting video content:', error)
    return NextResponse.json({ error: 'Failed to delete video content' }, { status: 500 })
  }
}

