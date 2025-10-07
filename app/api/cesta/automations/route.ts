import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/cesta-db'

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

    const automations = await sql`
      SELECT * FROM automations 
      WHERE user_id = ${dbUser.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ automations })
  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
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
      name,
      description,
      type,
      target_id,
      frequency_type,
      frequency_time,
      scheduled_date
    } = await request.json()

    const id = crypto.randomUUID()

    const automation = await sql`
      INSERT INTO automations (
        id, user_id, name, description, type, target_id, 
        frequency_type, frequency_time, scheduled_date, is_active
      ) VALUES (
        ${id}, ${dbUser.id}, ${name}, ${description || null}, ${type}, ${target_id},
        ${frequency_type}, ${frequency_time || null}, ${scheduled_date || null}, true
      ) RETURNING *
    `

    return NextResponse.json({ automation: automation[0] })
  } catch (error) {
    console.error('Error creating automation:', error)
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    )
  }
}
