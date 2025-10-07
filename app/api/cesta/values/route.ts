import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, getUserValues } from '@/lib/cesta-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the correct ID
    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const values = await getUserValues(dbUser.id)

    return NextResponse.json({ values })
  } catch (error) {
    console.error('Error fetching values:', error)
    return NextResponse.json(
      { error: 'Failed to fetch values' },
      { status: 500 }
    )
  }
}