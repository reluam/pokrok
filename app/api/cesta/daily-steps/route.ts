import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getDailyStepsByUserId, getUserByClerkId, createDailyStep, updateGoalProgressCombined } from '@/lib/cesta-db'


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
      date
    } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const step = await createDailyStep({
      user_id: dbUser.id,
      goal_id: goalId,
      title,
      description: description || '',
      date: date ? new Date(date) : new Date(), // Use provided date or current date
      is_important: false,
      is_urgent: false,
      step_type: 'custom',
      custom_type_name: undefined
    })
    
    // Update goal progress using combined formula
    if (goalId) {
      await updateGoalProgressCombined(goalId)
    }
    
    return NextResponse.json({ step })
  } catch (error) {
    console.error('Error creating daily step:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
