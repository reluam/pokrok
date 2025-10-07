import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { addExperienceToValue, getUserByClerkId } from '@/lib/cesta-db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { experiencePoints } = await request.json()

    if (!experiencePoints || experiencePoints <= 0) {
      return NextResponse.json({ error: 'Invalid experience points' }, { status: 400 })
    }

    const updatedValue = await addExperienceToValue(params.id, dbUser.id, experiencePoints)
    
    return NextResponse.json({ value: updatedValue })
  } catch (error) {
    console.error('Error adding experience to value:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
