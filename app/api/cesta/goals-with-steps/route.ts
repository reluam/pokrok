import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, createUser, updateGoalProgressFromMetrics } from '@/lib/cesta-db'
import { randomUUID } from 'crypto'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting goal creation...')
    
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
      steps
    } = await request.json()
    
    console.log('📝 Goal data:', { title, description, targetDate, stepsCount: steps?.length })

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

    // Create steps and their metrics/automations
    const createdSteps = []
    const createdMetrics = []
    const createdAutomations = []

    console.log(`👣 Creating ${steps.length} steps...`)
    
    for (const stepData of steps) {
      console.log('👣 Creating step:', stepData.title)
      
      // Create step
      const stepId = randomUUID()
      
      // Determine step date based on deadline
      let stepDate = stepData.deadline ? new Date(stepData.deadline) : targetDateObj
      if (stepData.useGoalDeadline) {
        stepDate = targetDateObj
      }

      const step = await sql`
        INSERT INTO daily_steps (
          id, user_id, goal_id, title, description, completed, 
          date, is_important, is_urgent, step_type, is_automated
        ) VALUES (
          ${stepId}, ${dbUser.id}, ${goalId}, ${stepData.title}, ${stepData.description || null},
          false, ${stepDate}, false, false, 'custom', ${stepData.hasAutomation || false}
        ) RETURNING *
      `

      createdSteps.push(step[0])
      console.log('✅ Step created:', step[0].id)

      // Create metric if specified and has valid name
      if (stepData.hasMetric && stepData.metric && stepData.metric.name && stepData.metric.name.trim() !== '') {
        console.log('📊 Creating metric:', stepData.metric.name)
        const metricId = randomUUID()
        
        const metric = await sql`
          INSERT INTO metrics (
            id, user_id, step_id, name, description, target_value, 
            current_value, unit
          ) VALUES (
            ${metricId}, ${dbUser.id}, ${stepId}, ${stepData.metric.name}, 
            ${stepData.metric.description || stepData.metric.name}, ${stepData.metric.targetValue}, 
            ${stepData.metric.currentValue || 0}, ${stepData.metric.unit}
          ) RETURNING *
        `

        // Update step to reference metric
        await sql`
          UPDATE daily_steps 
          SET metric_id = ${metricId}
          WHERE id = ${stepId}
        `

        createdMetrics.push(metric[0])
        console.log('✅ Metric created:', metric[0].id)
      }

      // Create automation if specified and has valid name
      if (stepData.hasAutomation && stepData.automation && stepData.automation.name && stepData.automation.name.trim() !== '') {
        console.log('🤖 Creating automation:', stepData.automation.name)
        const automationId = randomUUID()
        
        const automation = await sql`
          INSERT INTO automations (
            id, user_id, name, description, type, target_id, 
            frequency_type, frequency_time, scheduled_date, is_active
          ) VALUES (
            ${automationId}, ${dbUser.id}, ${stepData.automation.name}, 
            ${stepData.automation.name}, 'step', ${stepId},
            ${stepData.automation.frequencyType}, 
            ${stepData.automation.frequencyTime || null},
            ${stepData.automation.scheduledDate || null}, true
          ) RETURNING *
        `

        // Mark step as automated
        await sql`
          UPDATE daily_steps 
          SET is_automated = true
          WHERE id = ${stepId}
        `

        createdAutomations.push(automation[0])
        console.log('✅ Automation created:', automation[0].id)
      }
    }

    // Update goal progress based on metrics
    console.log('📊 Updating goal progress...')
    await updateGoalProgressFromMetrics(goalId)

    console.log('🎉 Goal creation completed successfully!')
    return NextResponse.json({ 
      success: true, 
      goal: createdGoal,
      steps: createdSteps,
      metrics: createdMetrics,
      automations: createdAutomations
    })
  } catch (error) {
    console.error('❌ Error creating goal with steps:', error)
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
