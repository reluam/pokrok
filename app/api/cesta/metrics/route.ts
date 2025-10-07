import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, getDailyStepsByUserId } from '@/lib/cesta-db'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

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

    const metrics = await sql`
      SELECT * FROM metrics 
      WHERE user_id = ${dbUser.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
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

    const {
      step_id,
      name,
      description,
      target_value,
      current_value,
      unit
    } = await request.json()

    // Verify that the step belongs to the user
    const userSteps = await getDailyStepsByUserId(dbUser.id)
    const stepExists = userSteps.some(step => step.id === step_id)
    
    if (!stepExists) {
      return NextResponse.json({ error: 'Step not found or access denied' }, { status: 404 })
    }

    const id = crypto.randomUUID()

    const metric = await sql`
      INSERT INTO metrics (
        id, user_id, step_id, name, description, 
        target_value, current_value, unit
      ) VALUES (
        ${id}, ${dbUser.id}, ${step_id}, ${name}, ${description || null},
        ${target_value}, ${current_value || 0}, ${unit}
      ) RETURNING *
    `

    // Update the step to reference this metric
    await sql`
      UPDATE daily_steps 
      SET metric_id = ${id}
      WHERE id = ${step_id} AND user_id = ${dbUser.id}
    `

    return NextResponse.json({ metric: metric[0] })
  } catch (error) {
    console.error('Error creating metric:', error)
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    )
  }
}
