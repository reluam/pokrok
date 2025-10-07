import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting icon column migration...')
    
    // Add icon column to goals table
    await sql`
      ALTER TABLE goals 
      ADD COLUMN IF NOT EXISTS icon VARCHAR(50)
    `
    
    console.log('✅ Icon column added to goals table')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Icon column migration completed successfully' 
    })
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
