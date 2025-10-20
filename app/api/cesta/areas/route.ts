import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getAreas, createArea, createDefaultAreas } from '@/lib/cesta-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const areas = await getAreas(dbUser.id)
    
    // If no areas exist, create default ones
    if (areas.length === 0) {
      const defaultAreas = await createDefaultAreas(dbUser.id)
      return NextResponse.json({ areas: defaultAreas })
    }

    return NextResponse.json({ areas })
  } catch (error) {
    console.error('Error fetching areas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { name, description, color, icon, order } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const area = await createArea(
      dbUser.id,
      name,
      description,
      color || '#3B82F6',
      icon,
      order || 0
    )

    return NextResponse.json({ area })
  } catch (error) {
    console.error('Error creating area:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
