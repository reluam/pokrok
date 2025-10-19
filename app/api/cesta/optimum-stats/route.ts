import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getUserSettings, createOrUpdateDailyStats } from '@/lib/cesta-db'

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

    const userSettings = await getUserSettings(dbUser.id)
    if (!userSettings) {
      return NextResponse.json({ error: 'User settings not found' }, { status: 404 })
    }

    const { plannedStepsCount, completedStepsCount, totalStepsCount } = await request.json()

    // Calculate optimum deviation (how many steps over/under the daily target)
    const optimumDeviation = plannedStepsCount - userSettings.daily_steps_count

    // Update user statistics
    const stats = await createOrUpdateDailyStats(
      dbUser.id, 
      new Date(), 
      plannedStepsCount, 
      completedStepsCount, 
      totalStepsCount,
      optimumDeviation
    )

    return NextResponse.json({ 
      success: true,
      stats,
      optimumDeviation
    })
  } catch (error) {
    console.error('Error updating optimum stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
