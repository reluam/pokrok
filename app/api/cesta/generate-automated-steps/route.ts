import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/cesta-db'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')


// Force dynamic rendering
export const dynamic = 'force-dynamic'
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
      SELECT a.*, ds.goal_id, ds.title as step_title, ds.description as step_description
      FROM automations a
      JOIN daily_steps ds ON a.target_id::uuid = ds.id
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
    console.log('📅 Today (local):', todayStr, 'Day:', today.getDay())

    const generatedSteps = []

    for (const automation of automations) {
      console.log(`\n🔄 Processing automation: ${automation.name}`)
      console.log(`   Frequency: ${automation.frequency_type} - ${automation.frequency_time}`)
      
      // Check if step should be generated for today
      const shouldGenerate = shouldGenerateStepForAutomation(automation, today)
      console.log(`   Should generate: ${shouldGenerate}`)
      
      if (shouldGenerate) {
        // Check if step already exists for today
        const existingStep = await sql`
          SELECT * FROM daily_steps 
          WHERE user_id = ${dbUser.id} 
          AND goal_id = ${automation.goal_id}::uuid
          AND title = ${automation.step_title}
          AND DATE(date) = ${todayStr}
        `

        console.log(`   Existing steps: ${existingStep.length}`)

        if (existingStep.length === 0) {
          // Create new step for today
          const stepId = crypto.randomUUID()
          console.log(`   Creating new step: ${automation.step_title}`)
          
          // Create date string in YYYY-MM-DD format for local date
          const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
          
          const step = await sql`
            INSERT INTO daily_steps (
              id, user_id, goal_id, title, description, completed, 
              date, is_important, is_urgent, step_type, is_automated
            ) VALUES (
              ${stepId}, ${dbUser.id}, ${automation.goal_id}::uuid, ${automation.step_title}, 
              ${automation.step_description || null}, false, ${localDateStr}, 
              false, false, 'custom', true
            ) RETURNING *
          `

          generatedSteps.push(step[0])
          console.log(`   ✅ Step created: ${step[0].title}`)
        } else {
          console.log(`   ⏭️ Step already exists for today`)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      generatedSteps,
      count: generatedSteps.length 
    })
  } catch (error) {
    console.error('Error generating automated steps:', error)
    return NextResponse.json(
      { error: 'Failed to generate automated steps' },
      { status: 500 }
    )
  }
}

function shouldGenerateStepForAutomation(automation: any, today: Date): boolean {
  if (automation.frequency_type === 'one-time') {
    // One-time automation - check if scheduled date is today
    if (automation.scheduled_date) {
      const scheduledDate = new Date(automation.scheduled_date)
      scheduledDate.setHours(0, 0, 0, 0)
      return scheduledDate.getTime() === today.getTime()
    }
    return false
  }

  if (automation.frequency_type === 'recurring' && automation.frequency_time) {
    // Recurring automation - check if frequency matches today
    return shouldGenerateStepForCustomFrequency(automation.frequency_time, today)
  }

  return false
}

function shouldGenerateStepForCustomFrequency(frequencyTime: string, today: Date): boolean {
  const dayPatterns = {
    'pondělí': 1, 'pondělku': 1, 'pondělka': 1, 'pondělkem': 1,
    'úterý': 2, 'úterku': 2, 'úterka': 2, 'úterkem': 2,
    'středa': 3, 'středu': 3, 'středy': 3, 'středě': 3,
    'čtvrtek': 4, 'čtvrtku': 4, 'čtvrtka': 4, 'čtvrtkem': 4,
    'pátek': 5, 'pátku': 5, 'pátka': 5, 'pátkem': 5,
    'sobota': 6, 'sobotu': 6, 'soboty': 6, 'sobotou': 6,
    'neděle': 0, 'neděli': 0, 'nedělí': 0,
    'po': 1, 'út': 2, 'st': 3, 'čt': 4, 'pá': 5, 'so': 6, 'ne': 0
  }

  const frequency = frequencyTime.toLowerCase()
  const todayDay = today.getDay()

  // Check for daily patterns
  if (frequency.includes('každý den') || frequency.includes('denně')) {
    return true
  }

  // Check for specific day patterns
  for (const [dayName, dayNumber] of Object.entries(dayPatterns)) {
    if (frequency.includes(dayName) && todayDay === dayNumber) {
      return true
    }
  }

  // Check for multiple days (e.g., "PO, ST, PÁ")
  const dayMatches = frequency.match(/\b(po|út|st|čt|pá|so|ne)\b/g)
  if (dayMatches) {
    const dayNumbers = dayMatches.map(day => dayPatterns[day as keyof typeof dayPatterns])
    return dayNumbers.includes(todayDay)
  }

  return false
}