import { NextRequest, NextResponse } from 'next/server'
import { getOfferSection, updateOfferSection, deleteOfferSection } from '@/lib/admin-db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const section = await getOfferSection(params.id)
    
    if (!section) {
      return NextResponse.json({ error: 'Offer section not found' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error fetching offer section:', error)
    return NextResponse.json({ error: 'Failed to fetch offer section' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    const updatedSection = await updateOfferSection(params.id, updateData)
    return NextResponse.json(updatedSection)
  } catch (error) {
    console.error('Error updating offer section:', error)
    return NextResponse.json({ error: 'Failed to update offer section' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteOfferSection(params.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete offer section' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Offer section deleted successfully' })
  } catch (error) {
    console.error('Error deleting offer section:', error)
    return NextResponse.json({ error: 'Failed to delete offer section' }, { status: 500 })
  }
}

