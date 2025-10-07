import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateEventInteraction } from '@/lib/cesta-db'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
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

    const { interactionId, postponedTo } = await request.json()

    if (!interactionId) {
      return NextResponse.json({ error: 'interactionId is required' }, { status: 400 })
    }

    // Default to tomorrow if no date provided
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const postponeDate = postponedTo ? new Date(postponedTo) : tomorrow

    // Update the interaction to postponed
    const updatedInteraction = await updateEventInteraction(interactionId, dbUser.id, {
      status: 'postponed',
      postponed_to: postponeDate
    })

    return NextResponse.json({ 
      success: true, 
      interaction: updatedInteraction 
    })
  } catch (error) {
    console.error('Error postponing event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
