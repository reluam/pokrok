import { NextRequest, NextResponse } from 'next/server'
import { getVideoContent, createVideoContent } from '@/lib/admin-db'
import { VideoContent } from '@/lib/admin-types'

export async function GET() {
  try {
    const videos = await getVideoContent()
    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching video content:', error)
    return NextResponse.json({ error: 'Failed to fetch video content' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const videoData: Omit<VideoContent, 'id' | 'createdAt' | 'updatedAt'> = await request.json()
    
    // Validate required fields
    if (!videoData.title || !videoData.description || !videoData.videoUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newVideo = await createVideoContent(videoData)
    return NextResponse.json(newVideo, { status: 201 })
  } catch (error) {
    console.error('Error creating video content:', error)
    return NextResponse.json({ error: 'Failed to create video content' }, { status: 500 })
  }
}

