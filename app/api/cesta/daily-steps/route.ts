import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getDailyStepsByUserId, getUserByClerkId, createDailyStep } from '@/lib/cesta-db'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the correct ID
    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all steps for the user
    const steps = await getDailyStepsByUserId(dbUser.id)
    
    return NextResponse.json({ steps })
  } catch (error) {
    console.error('Error fetching daily steps:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the correct ID
    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { 
      goalId, 
      title, 
      description, 
      date, 
      isImportant, 
      isUrgent,
      stepType,
      customTypeName,
      frequency,
      frequencyTime,
      isAutomated,
      automationTemplateId,
      updateProgressType,
      updateValue,
      updateUnit
    } = await request.json()

    if (!goalId || !title || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const step = await createDailyStep({
      user_id: dbUser.id,
      goal_id: goalId,
      title,
      description: description || '',
      date: new Date(date),
      is_important: isImportant || false,
      is_urgent: isUrgent || false,
      step_type: stepType || 'update',
      custom_type_name: customTypeName
    })
    
    return NextResponse.json({ step })
  } catch (error) {
    console.error('Error creating daily step:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
