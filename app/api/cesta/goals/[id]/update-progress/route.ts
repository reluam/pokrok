import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateGoalProgress, updateGoalProgressCount, updateGoalProgressAmount, getUserByClerkId, getGoalsByUserId } from '@/lib/cesta-db'

export async function PATCH(
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

    const { progressType, value } = await request.json()

    if (!progressType || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let updatedGoal

    switch (progressType) {
      case 'percentage':
        await updateGoalProgress(params.id, value)
        break
      case 'count':
        await updateGoalProgressCount(params.id, value)
        break
      case 'amount':
        await updateGoalProgressAmount(params.id, value)
        break
      default:
        return NextResponse.json({ error: 'Invalid progress type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Progress updated successfully' })
  } catch (error) {
    console.error('Error updating goal progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
