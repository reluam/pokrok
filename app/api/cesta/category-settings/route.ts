import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { 
  getCategorySettings, 
  createCategorySettings, 
  updateCategorySettings, 
  getUserByClerkId 
} from '@/lib/cesta-db'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let settings = await getCategorySettings(dbUser.id)
    
    // Create default settings if they don't exist
    if (!settings) {
      settings = await createCategorySettings(dbUser.id)
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching category settings:', error)
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

    const { shortTermDays, longTermDays } = await request.json()

    if (!shortTermDays || !longTermDays) {
      return NextResponse.json({ error: 'Both shortTermDays and longTermDays are required' }, { status: 400 })
    }

    if (shortTermDays >= longTermDays) {
      return NextResponse.json({ error: 'Short term days must be less than long term days' }, { status: 400 })
    }

    let settings = await getCategorySettings(dbUser.id)
    
    if (settings) {
      settings = await updateCategorySettings(dbUser.id, shortTermDays, longTermDays)
    } else {
      settings = await createCategorySettings(dbUser.id, shortTermDays, longTermDays)
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating category settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
