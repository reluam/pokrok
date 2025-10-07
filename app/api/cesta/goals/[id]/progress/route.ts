import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateGoalProgress, updateGoalProgressCount, updateGoalProgressAmount, updateGoalProgressSteps, getUserByClerkId, getGoalsByUserId } from '@/lib/cesta-db'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
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

    const { progressType, progress, current, completedSteps, totalSteps } = await request.json()

    switch (progressType) {
      case 'percentage':
        if (typeof progress !== 'number') {
          return NextResponse.json({ error: 'Progress must be a number' }, { status: 400 })
        }
        await updateGoalProgress(params.id, progress)
        break

      case 'count':
      case 'amount':
        if (typeof current !== 'number') {
          return NextResponse.json({ error: 'Current value must be a number' }, { status: 400 })
        }
        if (progressType === 'count') {
          await updateGoalProgressCount(params.id, current)
        } else {
          await updateGoalProgressAmount(params.id, current)
        }
        break

      case 'steps':
        if (typeof completedSteps !== 'number' || typeof totalSteps !== 'number') {
          return NextResponse.json({ error: 'Completed steps and total steps must be numbers' }, { status: 400 })
        }
        await updateGoalProgressSteps(params.id)
        break

      default:
        return NextResponse.json({ error: 'Invalid progress type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating goal progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
