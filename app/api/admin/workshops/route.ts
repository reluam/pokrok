import { NextRequest, NextResponse } from 'next/server'
import { getWorkshops, createWorkshop } from '@/lib/admin-db'
import { Workshop } from '@/lib/admin-types'

export async function GET() {
  try {
    const workshops = await getWorkshops()
    return NextResponse.json(workshops)
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const workshopData: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'> = await request.json()
    
    // Validate required fields
    if (!workshopData.title || !workshopData.subtitle || !workshopData.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newWorkshop = await createWorkshop(workshopData)
    return NextResponse.json(newWorkshop, { status: 201 })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json({ error: 'Failed to create workshop' }, { status: 500 })
  }
}
