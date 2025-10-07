import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, createUser } from '@/lib/cesta-db'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    console.log('Starting onboarding completion...')
    
    const { userId } = await auth()
    if (!userId) {
      console.log('No userId found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('UserId:', userId)

    const { values } = await request.json()
    console.log('Values to create:', values)

    if (!values || !Array.isArray(values) || values.length === 0) {
      console.log('Invalid values provided')
      return NextResponse.json({ error: 'Invalid values provided' }, { status: 400 })
    }

    // Get or create user
    console.log('Getting or creating user...')
    let dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      console.log('Creating new user...')
      dbUser = await createUser(userId, 'user@example.com', 'User')
    }
    console.log('User ID:', dbUser.id)

    // Create values for the user
    console.log('Creating values...')
    const createdValues = []
    for (const valueName of values) {
      const valueId = crypto.randomUUID()
      console.log(`Creating value: ${valueName} with ID: ${valueId}`)
      
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
      console.log(`Created value:`, value[0])
    }

    // Mark user as having completed onboarding
    console.log('Marking onboarding as complete...')
    await sql`
      UPDATE users 
      SET has_completed_onboarding = true, updated_at = NOW()
      WHERE id = ${dbUser.id}
    `

    console.log('Onboarding completed successfully')
    return NextResponse.json({ 
      success: true, 
      values: createdValues 
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
