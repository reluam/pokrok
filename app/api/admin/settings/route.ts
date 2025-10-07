import { NextRequest, NextResponse } from 'next/server'
import { getAdminSettings, updateAdminSetting } from '@/lib/admin-db'

export async function GET() {
  try {
    const settings = await getAdminSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return NextResponse.json({ error: 'Failed to fetch admin settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
    }

    const updatedSetting = await updateAdminSetting(key, value)
    if (!updatedSetting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json(updatedSetting)
  } catch (error) {
    console.error('Error updating admin setting:', error)
    return NextResponse.json({ error: 'Failed to update admin setting' }, { status: 500 })
  }
}


