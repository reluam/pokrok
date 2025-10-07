import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateEventInteraction, getEventInteractionsByUserId } from '@/lib/cesta-db'

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

    const { interactionId } = await request.json()

    if (!interactionId) {
      return NextResponse.json({ error: 'interactionId is required' }, { status: 400 })
    }

    // Update the interaction to completed
    const updatedInteraction = await updateEventInteraction(interactionId, dbUser.id, {
      status: 'completed',
      completed_at: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      interaction: updatedInteraction 
    })
  } catch (error) {
    console.error('Error completing event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
