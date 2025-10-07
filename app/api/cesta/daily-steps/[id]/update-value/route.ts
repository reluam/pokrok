import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, updateDailyStepValue, getDailyStepsByUserId } from '@/lib/cesta-db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Update value API: Starting...')
    const user = await currentUser()
    console.log('Update value API: user:', user?.id)

    if (!user?.id) {
      console.log('Update value API: No user, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(user.id)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const stepId = params.id
    const { updateValue } = await request.json()

    if (updateValue === undefined || updateValue === null) {
      return NextResponse.json({ error: 'Update value is required' }, { status: 400 })
    }

    // Verify that the step belongs to the user
    const userSteps = await getDailyStepsByUserId(dbUser.id)
    const stepExists = userSteps.some(step => step.id === stepId)
    
    if (!stepExists) {
      return NextResponse.json({ error: 'Step not found or access denied' }, { status: 404 })
    }

    const updatedStep = await updateDailyStepValue(stepId, updateValue)

    return NextResponse.json({ step: updatedStep })
  } catch (error) {
    console.error('Error updating daily step value:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
