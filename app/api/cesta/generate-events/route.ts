import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, createEvent } from '@/lib/cesta-db'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all automations for the user
    const automations = await sql`
      SELECT a.*, 
             CASE 
               WHEN a.type = 'metric' THEN m.name
               WHEN a.type = 'step' THEN ds.title
             END as target_name,
             CASE 
               WHEN a.type = 'metric' THEN m.unit
               WHEN a.type = 'step' THEN NULL
             END as target_unit,
             CASE 
               WHEN a.type = 'metric' THEN ds.goal_id
               WHEN a.type = 'step' THEN ds.goal_id
             END as goal_id
      FROM automations a
      LEFT JOIN metrics m ON a.type = 'metric' AND a.target_id = m.id
      LEFT JOIN daily_steps ds ON (a.type = 'step' AND a.target_id = ds.id) OR (a.type = 'metric' AND m.step_id = ds.id)
      WHERE a.user_id = ${dbUser.id} AND a.is_active = true
    `

    console.log('🔍 Found automations:', automations.length)
    automations.forEach(auto => {
      console.log(`   - ${auto.name}: ${auto.frequency_type} - ${auto.frequency_time}`)
    })

    // Get today's date in local timezone (not UTC)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const generatedEvents = []

    for (const automation of automations) {
      console.log(`\n🔄 Processing automation: ${automation.name}`)
      console.log(`   Frequency: ${automation.frequency_type} - ${automation.frequency_time}`)
      
      // Check if event should be generated for today
      const shouldGenerate = shouldGenerateEventForAutomation(automation, today)
      console.log(`   Should generate: ${shouldGenerate}`)
      
      if (shouldGenerate) {
        // Check if event already exists for today
        const existingEvent = await sql`
          SELECT * FROM events 
          WHERE user_id = ${dbUser.id} 
          AND automation_id = ${automation.id}
          AND DATE(date) = ${todayStr}
        `

        console.log(`   Existing events: ${existingEvent.length}`)

        if (existingEvent.length === 0) {
          // Create new event for today
          const eventId = crypto.randomUUID()
          console.log(`   Creating new event: ${automation.target_name}`)
          
          // Create date string in YYYY-MM-DD format for local date
          const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
          
          const event = await createEvent({
            user_id: dbUser.id,
            goal_id: automation.goal_id,
            automation_id: automation.id,
            title: automation.target_name,
            description: automation.description || null,
            completed: false,
            date: new Date(localDateStr),
            is_important: false,
            is_urgent: false,
            event_type: automation.type === 'metric' ? 'metric_update' : 'step_reminder',
            target_metric_id: automation.type === 'metric' ? automation.target_id : null,
            target_step_id: automation.type === 'step' ? automation.target_id : null,
            update_value: automation.type === 'metric' ? 0 : undefined,
            update_unit: automation.target_unit || null
          })

          generatedEvents.push(event)
          console.log(`   ✅ Event created: ${event.title}`)
        } else {
          console.log(`   ⏭️ Event already exists for today`)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      generatedEvents,
      count: generatedEvents.length 
    })
  } catch (error) {
    console.error('Error generating events:', error)
    return NextResponse.json(
      { error: 'Failed to generate events' },
      { status: 500 }
    )
  }
}

function shouldGenerateEventForAutomation(automation: any, today: Date): boolean {
  if (automation.frequency_type === 'one-time') {
    if (!automation.scheduled_date) return false
    
    const scheduledDate = new Date(automation.scheduled_date)
    scheduledDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    
    return scheduledDate.getTime() === today.getTime()
  }
  
  if (automation.frequency_type === 'recurring') {
    if (!automation.frequency_time) return false
    
    // Simple frequency parsing - can be enhanced
    const frequency = automation.frequency_time.toLowerCase()
    
    if (frequency.includes('den') || frequency.includes('daily')) {
      return true
    }
    
    if (frequency.includes('týden') || frequency.includes('week')) {
      // Check if it's the right day of week
      const dayOfWeek = today.getDay()
      const targetDay = getTargetDayFromFrequency(frequency)
      return targetDay === dayOfWeek
    }
    
    if (frequency.includes('měsíc') || frequency.includes('month')) {
      // Check if it's the right day of month
      const dayOfMonth = today.getDate()
      const targetDay = getTargetDayFromFrequency(frequency)
      return targetDay === dayOfMonth
    }
  }
  
  return false
}

function getTargetDayFromFrequency(frequency: string): number {
  // Simple day parsing - can be enhanced
  const days = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
  const englishDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  for (let i = 0; i < days.length; i++) {
    if (frequency.includes(days[i]) || frequency.includes(englishDays[i])) {
      return i
    }
  }
  
  // Default to Monday (1)
  return 1
}
