import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getUserSettings, createOrUpdateUserSettings } from '@/lib/cesta-db'

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

    const settings = await getUserSettings(dbUser.id)
    
    // If no settings exist, create default ones
    if (!settings) {
      const defaultSettings = await createOrUpdateUserSettings(dbUser.id, 3, 'daily_planning')
      return NextResponse.json({ settings: defaultSettings })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { daily_steps_count, workflow } = await request.json()

    if (daily_steps_count && (typeof daily_steps_count !== 'number' || daily_steps_count < 1 || daily_steps_count > 10)) {
      return NextResponse.json({ error: 'Invalid daily_steps_count. Must be between 1 and 10.' }, { status: 400 })
    }

    if (workflow && !['daily_planning', 'no_workflow'].includes(workflow)) {
      return NextResponse.json({ error: 'Invalid workflow. Must be daily_planning or no_workflow.' }, { status: 400 })
    }

    const settings = await createOrUpdateUserSettings(dbUser.id, daily_steps_count, workflow)
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
