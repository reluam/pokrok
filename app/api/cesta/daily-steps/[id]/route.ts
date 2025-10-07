import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, updateDailyStep, deleteDailyStep, getDailyStepsByUserId } from '@/lib/cesta-db'


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

    const stepId = params.id
    
    // Verify that the step belongs to the user
    const userSteps = await getDailyStepsByUserId(dbUser.id)
    const stepExists = userSteps.some(step => step.id === stepId)
    
    if (!stepExists) {
      return NextResponse.json({ error: 'Step not found or access denied' }, { status: 404 })
    }

    const { 
      title, 
      description, 
      stepType, 
      customTypeName, 
      frequencyTime,
      updateProgressType,
      updateValue,
      updateUnit
    } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const updatedStep = await updateDailyStep(stepId, {
      title,
      description: description || '',
      step_type: stepType || 'update',
      custom_type_name: customTypeName
    })

    return NextResponse.json({ step: updatedStep })
  } catch (error) {
    console.error('Error updating daily step:', error)
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

    const stepId = params.id
    
    // Verify that the step belongs to the user
    const userSteps = await getDailyStepsByUserId(dbUser.id)
    const stepExists = userSteps.some(step => step.id === stepId)
    
    if (!stepExists) {
      return NextResponse.json({ error: 'Step not found or access denied' }, { status: 404 })
    }

    await deleteDailyStep(stepId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting daily step:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
