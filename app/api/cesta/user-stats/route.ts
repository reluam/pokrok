import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getUserStreak, updateUserStreak, getUserStepStatistics } from '@/lib/cesta-db'

export const dynamic = 'force-dynamic'

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

    const [streak, stepStats] = await Promise.all([
      getUserStreak(dbUser.id),
      getUserStepStatistics(dbUser.id)
    ])
    
    return NextResponse.json({ 
      streak: streak || { current_streak: 0, longest_streak: 0, last_activity_date: null },
      stepStats 
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Update streak (this should be called when user adds new steps)
    const streak = await updateUserStreak(dbUser.id)
    
    return NextResponse.json({ streak })
  } catch (error) {
    console.error('Error updating user streak:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
