import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, createUser, createGoalMetric, updateGoalProgressCombined } from '@/lib/cesta-db'
import { randomUUID } from 'crypto'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting goal creation with new structure...')
    
    const { userId } = await auth()
    if (!userId) {
      console.log('❌ No user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      description,
      targetDate,
      icon,
      metrics,
      steps
    } = await request.json()
    
    console.log('📝 Goal data:', { 
      title, 
      description, 
      targetDate, 
      metricsCount: metrics?.length || 0,
      stepsCount: steps?.length || 0 
    })

    // Get or create user
    let dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      console.log('👤 Creating new user...')
      // Create user if doesn't exist
      const { currentUser } = await import('@clerk/nextjs/server')
      const user = await currentUser()
      if (!user) {
        console.log('❌ No current user')
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      dbUser = await createUser(userId, user.emailAddresses[0].emailAddress, `${user.firstName || ''} ${user.lastName || ''}`.trim())
      console.log('✅ User created:', dbUser.id)
    } else {
      console.log('👤 Using existing user:', dbUser.id)
    }

    // Create goal
    const goalId = randomUUID()
    const targetDateObj = targetDate ? new Date(targetDate) : null
    
    console.log('🎯 Creating goal:', { title, description, targetDate, targetDateObj })
    
    const goal = await sql`
      INSERT INTO goals (
        id, user_id, title, description, target_date, status, priority, 
        category, goal_type, progress_percentage, icon
      ) VALUES (
        ${goalId}, ${dbUser.id}, ${title}, ${description || null}, ${targetDateObj}, 'active',
        'meaningful', 'medium-term', 'outcome', 0, ${icon || null}
      ) RETURNING *
    `

    const createdGoal = goal[0]
    console.log('✅ Goal created:', createdGoal.id)

    // Create goal metrics
    const createdMetrics = []
    if (metrics && metrics.length > 0) {
      console.log('📊 Creating goal metrics...')
      for (const metricData of metrics) {
        if (metricData.name && metricData.name.trim()) {
          const metric = await createGoalMetric({
            user_id: dbUser.id,
            goal_id: goalId,
            name: metricData.name,
            description: metricData.description,
            type: metricData.type,
            unit: metricData.unit,
            target_value: metricData.targetValue,
            current_value: metricData.currentValue
          })
          createdMetrics.push(metric)
          console.log('✅ Goal metric created:', metric.id)
        }
      }
    }

    // Create steps (simplified - no metrics or automations)
    const createdSteps = []
    if (steps && steps.length > 0) {
      console.log('📝 Creating steps...')
      for (const stepData of steps) {
        if (stepData.title && stepData.title.trim()) {
          const stepId = randomUUID()
          const step = await sql`
            INSERT INTO daily_steps (
              id, user_id, goal_id, title, description, completed, 
              date, is_important, is_urgent, step_type, custom_type_name
            ) VALUES (
              ${stepId}, ${dbUser.id}, ${goalId}, ${stepData.title}, 
              ${stepData.description || null}, false, ${targetDateObj || new Date()}, 
              false, false, 'custom', 'goal_step'
            ) RETURNING *
          `
          createdSteps.push(step[0])
          console.log('✅ Step created:', step[0].id)
        }
      }
    }

    // Update goal progress based on metrics
    if (createdMetrics.length > 0) {
        await updateGoalProgressCombined(goalId)
    }

    console.log('🎉 Goal creation completed successfully')
    return NextResponse.json({ 
      success: true,
      goal: createdGoal, 
      metrics: createdMetrics,
      steps: createdSteps 
    })
  } catch (error) {
    console.error('❌ Error creating goal:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to create goal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}