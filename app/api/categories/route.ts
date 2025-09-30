import { NextResponse } from 'next/server'
import { getAllCategories } from '@/lib/cms-db'
import { initializeDatabase } from '@/lib/database'

export async function GET() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not available, returning default categories')
      return NextResponse.json([
        { id: 'cile', name: 'Cíle', slug: 'cile', color: '#3B82F6' },
        { id: 'planovani', name: 'Plánování', slug: 'planovani', color: '#10B981' },
        { id: 'aktualni-stav', name: 'Aktuální stav', slug: 'aktualni-stav', color: '#F59E0B' },
        { id: 'revize', name: 'Revize', slug: 'revize', color: '#EF4444' },
        { id: 'jine', name: 'Jiné', slug: 'jine', color: '#6B7280' }
      ])
    }
    
    await initializeDatabase()
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
