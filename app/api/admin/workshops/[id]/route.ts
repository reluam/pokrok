import { NextRequest, NextResponse } from 'next/server'
import { getWorkshop, updateWorkshop, deleteWorkshop } from '@/lib/admin-db'
import { Workshop } from '@/lib/admin-types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshop = await getWorkshop(params.id)
    
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 })
    }
    
    return NextResponse.json(workshop)
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json({ error: 'Failed to fetch workshop' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshopData: Partial<Workshop> = await request.json()
    const updatedWorkshop = await updateWorkshop(params.id, workshopData)
    return NextResponse.json(updatedWorkshop)
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json({ error: 'Failed to update workshop' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteWorkshop(params.id)
    if (success) {
      return NextResponse.json({ message: 'Workshop deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete workshop' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json({ error: 'Failed to delete workshop' }, { status: 500 })
  }
}
