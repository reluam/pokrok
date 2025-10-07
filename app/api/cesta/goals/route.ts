import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getGoalsByUserId, getUserByClerkId, createUser, createGoal } from '@/lib/cesta-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
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

    const goals = await getGoalsByUserId(dbUser.id)
    
    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting goal creation...')
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in database
    let dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      // Create user if they don't exist - use a simple approach for now
      dbUser = await createUser(userId, 'user@example.com', 'User')
    }

    const { 
      title, 
      description, 
      targetDate, 
      priority, 
      progressType = 'percentage',
      progressTarget,
      progressCurrent = 0,
      progressUnit,
      goalType = 'outcome',
      stepConfig
    } = await request.json()

    console.log('API: Received data:', {
      title,
      description,
      targetDate,
      priority,
      progressType,
      progressTarget,
      progressCurrent,
      progressUnit,
      goalType,
      stepConfig
    })

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    console.log('API: About to call createGoal...')
    const goal = await createGoal({
      user_id: dbUser.id,
      title,
      description: description || '',
      target_date: targetDate ? new Date(targetDate) : undefined,
      priority: priority || 'meaningful',
      progress_type: progressType,
      progress_target: progressTarget,
      progress_current: progressCurrent,
      progress_unit: progressUnit,
      goal_type: goalType
    })
    
    console.log('API: Goal created successfully:', goal.id)
    return NextResponse.json({ goal })
  } catch (error) {
    console.error('API: Error creating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
