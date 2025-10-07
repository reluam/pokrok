import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, getActiveAutomations, getEventInteractionsByDate, createEventInteraction } from '@/lib/cesta-db'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Get active automations
    const automations = await getActiveAutomations(dbUser.id)
    console.log('🔍 Found automations:', automations.length)

    // Get existing interactions for today
    const existingInteractions = await getEventInteractionsByDate(dbUser.id, today)
    console.log('📋 Existing interactions for today:', existingInteractions.length)

    // Get user's goals, metrics, and steps for context
    const [goals, metrics, steps] = await Promise.all([
      sql`SELECT * FROM goals WHERE user_id = ${dbUser.id}`,
      sql`SELECT * FROM metrics WHERE user_id = ${dbUser.id}`,
      sql`SELECT * FROM daily_steps WHERE user_id = ${dbUser.id}`
    ])

    const generatedEvents = []

    for (const automation of automations) {
      // Check if this automation already has an interaction for today
      const existingInteraction = existingInteractions.find(
        interaction => interaction.automation_id === automation.id && 
        interaction.date.toISOString().split('T')[0] === todayStr
      )

      // Skip if already completed or postponed
      if (existingInteraction && (existingInteraction.status === 'completed' || existingInteraction.status === 'postponed')) {
        console.log(`   ⏭️  Skipping automation ${automation.name} - already handled`)
        continue
      }

      // Check if automation should generate an event today
      let shouldGenerate = false
      let eventDate = new Date(today)

      if (automation.frequency_type === 'one-time' && automation.scheduled_date) {
        const scheduledDate = new Date(automation.scheduled_date)
        scheduledDate.setHours(0, 0, 0, 0)
        if (scheduledDate.getTime() === today.getTime()) {
          shouldGenerate = true
        }
      } else if (automation.frequency_type === 'recurring' && automation.frequency_time) {
        // Simple check - if it's a daily automation, generate every day
        if (automation.frequency_time.toLowerCase().includes('den') || 
            automation.frequency_time.toLowerCase().includes('daily')) {
          shouldGenerate = true
        }
        // Add more complex frequency parsing here if needed
      }

      if (shouldGenerate) {
        // Find associated goal, step, and metric
        let goalId: string | undefined
        let stepId: string | undefined
        let metricId: string | undefined
        let eventTitle = automation.name
        let eventDescription = automation.description

        if (automation.type === 'metric') {
          const metric = metrics.find((m: any) => m.id === automation.target_id)
          if (metric) {
            metricId = metric.id
            const step = steps.find((s: any) => s.id === metric.step_id)
            if (step) {
              stepId = step.id
              goalId = step.goal_id
              eventTitle = `Aktualizovat metriku: ${metric.name}`
              eventDescription = `Zaznamenejte pokrok pro krok "${step.title}"`
            }
          }
        } else if (automation.type === 'step') {
          const step = steps.find((s: any) => s.id === automation.target_id)
          if (step) {
            stepId = step.id
            goalId = step.goal_id
            eventTitle = `Připomínka kroku: ${step.title}`
            eventDescription = `Dokončete krok "${step.title}"`
          }
        }

        if (!goalId) {
          console.warn(`   ⚠️  Skipping automation ${automation.id}: Could not find associated goal`)
          continue
        }

        // Create event interaction (pending status)
        const interaction = await createEventInteraction({
          user_id: dbUser.id,
          automation_id: automation.id,
          date: eventDate,
          status: 'pending'
        })

        // Create virtual event object for frontend
        const virtualEvent = {
          id: interaction.id, // Use interaction ID as event ID
          user_id: dbUser.id,
          goal_id: goalId,
          automation_id: automation.id,
          title: eventTitle,
          description: eventDescription,
          completed: false,
          date: eventDate,
          is_important: false,
          is_urgent: false,
          created_at: new Date(),
          event_type: automation.type === 'metric' ? 'metric_update' : 'step_reminder',
          target_metric_id: metricId,
          target_step_id: stepId,
          update_value: automation.type === 'metric' ? 0 : undefined,
          update_unit: null
        }

        generatedEvents.push(virtualEvent)
        console.log(`   ✅ Event created: ${eventTitle}`)
      }
    }

    return NextResponse.json({ events: generatedEvents })
  } catch (error) {
    console.error('Error generating smart events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
