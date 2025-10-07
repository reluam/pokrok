import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getUserByClerkId } from '@/lib/cesta-db'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

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

    const { current_value } = await request.json()

    if (current_value === undefined) {
      return NextResponse.json({ error: 'current_value is required' }, { status: 400 })
    }

    // Update the metric
    const result = await sql`
      UPDATE metrics 
      SET current_value = ${current_value}, updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${dbUser.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Metric not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ metric: result[0] })
  } catch (error) {
    console.error('Error updating metric:', error)
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

    // Delete the metric
    const result = await sql`
      DELETE FROM metrics 
      WHERE id = ${params.id} AND user_id = ${dbUser.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Metric not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
