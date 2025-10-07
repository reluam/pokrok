import { NextResponse } from 'next/server'
import { getActiveVideoContent } from '@/lib/admin-db'

export async function GET() {
  try {
    const video = await getActiveVideoContent()
    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching active video content:', error)
    return NextResponse.json({ error: 'Failed to fetch video content' }, { status: 500 })
  }
}

