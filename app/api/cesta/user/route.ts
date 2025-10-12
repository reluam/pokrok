import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/cesta-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database
    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      clerk_id: user.clerk_user_id,
      email: user.email,
      name: user.name,
      has_completed_onboarding: user.has_completed_onboarding,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
