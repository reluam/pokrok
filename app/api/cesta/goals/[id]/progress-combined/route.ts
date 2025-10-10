import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateGoalProgressCombined, getUserByClerkId, getGoalsByUserId } from '@/lib/cesta-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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

    // Verify that the goal belongs to the user
    const userGoals = await getGoalsByUserId(dbUser.id)
    const goalExists = userGoals.some(goal => goal.id === params.id)
    
    if (!goalExists) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 })
    }

    // Update progress using combined formula (50% metrics + 50% steps)
    await updateGoalProgressCombined(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating goal progress with combined formula:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
