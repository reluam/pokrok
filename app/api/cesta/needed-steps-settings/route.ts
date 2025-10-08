import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, getNeededStepsSettings, upsertNeededStepsSettings } from '@/lib/cesta-db'

// Force dynamic rendering
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

    const settings = await getNeededStepsSettings(dbUser.id)
    
    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        enabled: false,
        days_of_week: [1, 2, 3, 4, 5], // Monday to Friday
        time_hour: 9,
        time_minute: 0
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching needed steps settings:', error)
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

    const { enabled, days_of_week, time_hour, time_minute } = await request.json()

    const settings = await upsertNeededStepsSettings(dbUser.id, {
      enabled,
      days_of_week,
      time_hour,
      time_minute
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating needed steps settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
