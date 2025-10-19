import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getUserSettings, getDailyPlanning, createOrUpdateDailyPlanning, getDailyStepsByUserId, createOrUpdateDailyStats } from '@/lib/cesta-db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentHour = now.getHours()
    
    console.log(`Running daily reset cron job at hour ${currentHour}`)

    // Get all users with daily_planning workflow
    const { neon } = require('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)
    
    const users = await sql`
      SELECT u.id, u.clerk_id, us.daily_reset_hour
      FROM users u
      JOIN user_settings us ON u.id = us.user_id
      WHERE us.workflow = 'daily_planning' AND us.daily_reset_hour = ${currentHour}
    `
    
    console.log(`Found ${users.length} users to reset at hour ${currentHour}`)

    const results = []

    for (const user of users) {
      try {
        console.log(`Processing user ${user.id} (clerk: ${user.clerk_id})`)
        
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // Get yesterday's planning
        const yesterdayPlanning = await getDailyPlanning(user.id, yesterday)
        
        if (!yesterdayPlanning) {
          console.log(`No planning found for user ${user.id} yesterday`)
          continue
        }

        // Calculate statistics
        const plannedStepsCount = yesterdayPlanning.planned_steps.length
        const completedStepsCount = yesterdayPlanning.completed_steps.length

        // Get all daily steps for yesterday
        const yesterdaySteps = await getDailyStepsByUserId(user.id)
        const yesterdayStepsFiltered = yesterdaySteps.filter(step => {
          const stepDate = new Date(step.date)
          stepDate.setHours(0, 0, 0, 0)
          return stepDate.getTime() === yesterday.getTime()
        })

        // Update user statistics
        await createOrUpdateDailyStats(
          user.id, 
          yesterday, 
          plannedStepsCount, 
          completedStepsCount, 
          yesterdayStepsFiltered.length
        )

        // Create empty planning for today
        const todayPlanning = await createOrUpdateDailyPlanning(user.id, today, [])

        results.push({
          userId: user.id,
          success: true,
          statistics: {
            plannedSteps: plannedStepsCount,
            completedSteps: completedStepsCount,
            totalSteps: yesterdayStepsFiltered.length
          }
        })

        console.log(`✅ Reset successful for user ${user.id}`)
        
      } catch (error) {
        console.error(`❌ Error resetting user ${user.id}:`, error)
        results.push({
          userId: user.id,
          success: false,
          error: error.message
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      processedUsers: results.length,
      results
    })
  } catch (error) {
    console.error('Error in daily reset cron job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
