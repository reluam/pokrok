import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, createUser } from '@/lib/cesta-db'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { values } = await request.json()

    // Get or create user
    let dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      dbUser = await createUser(userId, 'User', 'user@example.com')
    }

    // Create values for the user
    const createdValues = []
    for (const valueName of values) {
      const valueId = crypto.randomUUID()
      const value = await sql`
        INSERT INTO values (
          id, user_id, name, description, level, experience, 
          created_at, updated_at
        ) VALUES (
          ${valueId}, ${dbUser.id}, ${valueName}, ${valueName}, 1, 0,
          NOW(), NOW()
        ) RETURNING *
      `
      createdValues.push(value[0])
    }

    // Mark user as having completed onboarding
    await sql`
      UPDATE users 
      SET has_completed_onboarding = true, updated_at = NOW()
      WHERE id = ${dbUser.id}
    `

    return NextResponse.json({ 
      success: true, 
      values: createdValues 
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
