import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  getGoalMetricsByGoalId, 
  createGoalMetric, 
  updateGoalMetric, 
  deleteGoalMetric,
  updateGoalProgressFromGoalMetrics 
} from '@/lib/cesta-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Fetch goal metrics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    const metrics = await getGoalMetricsByGoalId(goalId)
    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Error fetching goal metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create goal metric
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { goalId, name, description, type, unit, targetValue, currentValue } = await request.json()

    if (!goalId || !name || !type || !unit || targetValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const metric = await createGoalMetric({
      user_id: userId,
      goal_id: goalId,
      name,
      description,
      type,
      unit,
      target_value: targetValue,
      current_value: currentValue || 0
    })

    // Update goal progress
    await updateGoalProgressFromGoalMetrics(goalId)

    return NextResponse.json({ metric })
  } catch (error) {
    console.error('Error creating goal metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update goal metric
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { metricId, goalId, ...updates } = await request.json()

    if (!metricId) {
      return NextResponse.json({ error: 'Metric ID is required' }, { status: 400 })
    }

    const metric = await updateGoalMetric(metricId, updates)

    // Update goal progress if goalId is provided
    if (goalId) {
      await updateGoalProgressFromGoalMetrics(goalId)
    }

    return NextResponse.json({ metric })
  } catch (error) {
    console.error('Error updating goal metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete goal metric
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metricId = searchParams.get('metricId')
    const goalId = searchParams.get('goalId')

    if (!metricId) {
      return NextResponse.json({ error: 'Metric ID is required' }, { status: 400 })
    }

    await deleteGoalMetric(metricId)

    // Update goal progress if goalId is provided
    if (goalId) {
      await updateGoalProgressFromGoalMetrics(goalId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
