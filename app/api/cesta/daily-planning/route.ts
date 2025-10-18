import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getDailyPlanning, createOrUpdateDailyPlanning, markStepAsCompleted } from '@/lib/cesta-db'

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

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const date = new Date(dateParam)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const planning = await getDailyPlanning(dbUser.id, date)
    
    return NextResponse.json({ planning })
  } catch (error) {
    console.error('Error fetching daily planning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { date, planned_steps } = await request.json()

    if (!date || !Array.isArray(planned_steps)) {
      return NextResponse.json({ error: 'Date and planned_steps are required' }, { status: 400 })
    }

    const planningDate = new Date(date)
    if (isNaN(planningDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const planning = await createOrUpdateDailyPlanning(dbUser.id, planningDate, planned_steps)
    
    return NextResponse.json({ planning })
  } catch (error) {
    console.error('Error creating/updating daily planning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { date, step_id, planned_steps } = body

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const planningDate = new Date(date)
    if (isNaN(planningDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    let planning

    // If step_id is provided, mark step as completed
    if (step_id) {
      planning = await markStepAsCompleted(dbUser.id, planningDate, step_id)
    }
    // If planned_steps is provided, update the order
    else if (planned_steps && Array.isArray(planned_steps)) {
      planning = await createOrUpdateDailyPlanning(dbUser.id, planningDate, planned_steps)
    }
    else {
      return NextResponse.json({ error: 'Either step_id or planned_steps is required' }, { status: 400 })
    }
    
    return NextResponse.json({ planning })
  } catch (error) {
    console.error('Error updating daily planning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
