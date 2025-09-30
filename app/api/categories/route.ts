import { NextResponse } from 'next/server'
import { getAllCategories } from '@/lib/cms-db'
import { initializeDatabase } from '@/lib/database'

export async function GET() {
  try {
    await initializeDatabase()
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
