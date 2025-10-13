import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createNote, getNotesByUser, getStandaloneNotes, getUserByClerkId } from '@/lib/cesta-db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the correct ID
    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')
    const standalone = searchParams.get('standalone')

    let notes
    if (standalone === 'true') {
      notes = await getStandaloneNotes(dbUser.id)
    } else if (goalId) {
      const { getNotesByGoal } = await import('@/lib/cesta-db')
      notes = await getNotesByGoal(goalId)
    } else {
      notes = await getNotesByUser(dbUser.id)
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the correct ID
    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, goalId } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const note = await createNote({
      user_id: dbUser.id,
      goal_id: goalId || null,
      title: title.trim(),
      content: content.trim()
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
