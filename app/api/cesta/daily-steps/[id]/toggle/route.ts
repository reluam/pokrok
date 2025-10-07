import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, toggleDailyStep, getUpdatedGoalAfterStepCompletion, getDailyStepsByUserId } from '@/lib/cesta-db'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Toggle API: Starting...')
    const { userId } = await auth()
    console.log('Toggle API: userId:', userId)
    
    if (!userId) {
      console.log('Toggle API: No userId, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the correct ID
    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const stepId = params.id
    const { completed } = await request.json()

    if (!stepId) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 })
    }

    if (typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Completed status is required' }, { status: 400 })
    }

    // Verify that the step belongs to the user
    const userSteps = await getDailyStepsByUserId(dbUser.id)
    const stepExists = userSteps.some(step => step.id === stepId)
    
    if (!stepExists) {
      return NextResponse.json({ error: 'Step not found or access denied' }, { status: 404 })
    }

    const updatedStep = await toggleDailyStep(stepId)
    
    // Get the updated goal if the step was completed
    let updatedGoal = null
    if (completed) {
      updatedGoal = await getUpdatedGoalAfterStepCompletion(stepId)
    }
    
    return NextResponse.json({ 
      step: updatedStep,
      goal: updatedGoal
    })
  } catch (error) {
    console.error('Error toggling daily step:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
