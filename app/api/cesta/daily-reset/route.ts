import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getUserSettings, getDailyPlanning, createOrUpdateDailyPlanning, getDailyStepsByUserId, createOrUpdateDailyStats } from '@/lib/cesta-db'

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

    // Check if it's time to reset for this user
    const now = new Date()
    const currentHour = now.getHours()
    
    if (currentHour !== userSettings.daily_reset_hour) {
      return NextResponse.json({ 
        message: `Not time to reset yet. Current hour: ${currentHour}, reset hour: ${userSettings.daily_reset_hour}` 
      })
    }

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get yesterday's planning
    const yesterdayPlanning = await getDailyPlanning(dbUser.id, yesterday)
    
    if (!yesterdayPlanning) {
      return NextResponse.json({ error: 'No planning found for yesterday' }, { status: 404 })
    }

    // Calculate statistics
    const plannedStepsCount = yesterdayPlanning.planned_steps.length
    const completedStepsCount = yesterdayPlanning.completed_steps.length

    // Get all daily steps for yesterday to move them to "other steps"
    const yesterdaySteps = await getDailyStepsByUserId(dbUser.id)
    const yesterdayStepsFiltered = yesterdaySteps.filter(step => {
      const stepDate = new Date(step.date)
      stepDate.setHours(0, 0, 0, 0)
      return stepDate.getTime() === yesterday.getTime()
    })

    // Calculate optimum deviation (how many steps over/under the daily target)
    const optimumDeviation = plannedStepsCount - userSettings.daily_steps_count

    // Update user statistics
    await createOrUpdateDailyStats(
      dbUser.id, 
      yesterday, 
      plannedStepsCount, 
      completedStepsCount, 
      yesterdayStepsFiltered.length,
      optimumDeviation
    )

    // Create empty planning for today
    const todayPlanning = await createOrUpdateDailyPlanning(dbUser.id, today, [])

    return NextResponse.json({ 
      success: true,
      statistics: {
        plannedSteps: plannedStepsCount,
        completedSteps: completedStepsCount,
        totalSteps: yesterdayStepsFiltered.length
      },
      planning: todayPlanning
    })
  } catch (error) {
    console.error('Error resetting daily planning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
