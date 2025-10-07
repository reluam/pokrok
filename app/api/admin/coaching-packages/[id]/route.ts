import { NextRequest, NextResponse } from 'next/server'
import { getCoachingPackage, updateCoachingPackage, deleteCoachingPackage } from '@/lib/admin-db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageData = await getCoachingPackage(params.id)
    
    if (!packageData) {
      return NextResponse.json({ error: 'Coaching package not found' }, { status: 404 })
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error fetching coaching package:', error)
    return NextResponse.json({ error: 'Failed to fetch coaching package' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    const updatedPackage = await updateCoachingPackage(params.id, updateData)
    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error updating coaching package:', error)
    return NextResponse.json({ error: 'Failed to update coaching package' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteCoachingPackage(params.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete coaching package' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Coaching package deleted successfully' })
  } catch (error) {
    console.error('Error deleting coaching package:', error)
    return NextResponse.json({ error: 'Failed to delete coaching package' }, { status: 500 })
  }
}

