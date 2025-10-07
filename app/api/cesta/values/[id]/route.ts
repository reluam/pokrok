import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateUserValue, deleteUserValue, getUserByClerkId } from '@/lib/cesta-db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { name, description, color, icon } = await request.json()

    if (!name || !color || !icon) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updatedValue = await updateUserValue(
      params.id,
      dbUser.id,
      name,
      description,
      color,
      icon
    )
    
    return NextResponse.json({ value: updatedValue })
  } catch (error) {
    console.error('Error updating value:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await deleteUserValue(params.id, dbUser.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting value:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
