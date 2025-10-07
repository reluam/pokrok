import { NextResponse } from 'next/server'
import { getAdminSetting } from '@/lib/admin-db'

export async function GET() {
  try {
    const coachingEnabled = await getAdminSetting('coaching_enabled')
    const workshopsEnabled = await getAdminSetting('workshops_enabled')
    
    return NextResponse.json({
      coaching_enabled: coachingEnabled?.value === 'true',
      workshops_enabled: workshopsEnabled?.value === 'true'
    })
  } catch (error) {
    console.error('Error fetching navigation settings:', error)
    // Return default values on error
    return NextResponse.json({
      coaching_enabled: false,
      workshops_enabled: false
    })
  }
}

