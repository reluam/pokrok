import { NextRequest, NextResponse } from 'next/server'
import { getOfferSections, createOfferSection } from '@/lib/admin-db'
import { OfferSection } from '@/lib/admin-types'

export async function GET() {
  try {
    const sections = await getOfferSections()
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching offer sections:', error)
    return NextResponse.json({ error: 'Failed to fetch offer sections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sectionData: Omit<OfferSection, 'id' | 'createdAt' | 'updatedAt'> = await request.json()
    
    // Validate required fields
    if (!sectionData.title || !sectionData.description || !sectionData.icon) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newSection = await createOfferSection(sectionData)
    return NextResponse.json(newSection, { status: 201 })
  } catch (error) {
    console.error('Error creating offer section:', error)
    return NextResponse.json({ error: 'Failed to create offer section' }, { status: 500 })
  }
}

