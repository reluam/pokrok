import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateGoal, deleteGoal, getUserByClerkId, determineGoalCategoryWithSettings } from '@/lib/cesta-db'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { 
      title, 
      description, 
      targetDate, 
      priority, 
      progressType,
      progressTarget,
      progressCurrent,
      progressUnit
    } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const targetDateObj = targetDate ? new Date(targetDate) : null
    const category = await determineGoalCategoryWithSettings(targetDateObj)

    const updatedGoal = await updateGoal(
      params.id,
      dbUser.id,
      {
        title,
        description,
        target_date: targetDateObj || undefined,
        priority,
        category,
        progress_type: progressType,
        progress_target: progressTarget,
        progress_current: progressCurrent,
        progress_unit: progressUnit
      }
    )
    
    return NextResponse.json({ goal: updatedGoal })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await deleteGoal(params.id, dbUser.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
