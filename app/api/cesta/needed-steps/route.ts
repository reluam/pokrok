import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, createDailyStep } from '@/lib/cesta-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Needed steps API called')
    const { userId } = await auth()
    console.log('User ID:', userId)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    console.log('DB User:', dbUser)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    const { steps } = body

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      console.log('No steps provided')
      return NextResponse.json({ error: 'No steps provided' }, { status: 400 })
    }

    const createdSteps = []
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Ensure date is for today

    for (const step of steps) {
      const stepData = {
        user_id: dbUser.id,
        goal_id: step.goal_id || null,
        title: step.title,
        description: step.description || '',
        date: today,
        completed: false,
        is_important: false,
        is_urgent: false
      }

      console.log('Creating step with data:', stepData)
      const createdStep = await createDailyStep(stepData)
      console.log('Created step:', createdStep)
      createdSteps.push(createdStep)
    }

    return NextResponse.json({ 
      success: true, 
      steps: createdSteps,
      message: `Úspěšně uloženo ${createdSteps.length} kroků`
    })
  } catch (error) {
    console.error('Error creating needed steps:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
