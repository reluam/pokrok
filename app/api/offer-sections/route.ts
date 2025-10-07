import { NextResponse } from 'next/server'
import { getOfferSections } from '@/lib/admin-db'

export async function GET() {
  try {
    const sections = await getOfferSections()
    // Only return enabled sections for public API
    const enabledSections = sections.filter(section => section.enabled)
    return NextResponse.json(enabledSections)
  } catch (error) {
    console.error('Error fetching offer sections:', error)
    return NextResponse.json({ error: 'Failed to fetch offer sections' }, { status: 500 })
  }
}

