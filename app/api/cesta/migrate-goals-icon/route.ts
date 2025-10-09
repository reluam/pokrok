import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting goals table migration...')
    
    // Add icon column to goals table if it doesn't exist
    await sql`
      ALTER TABLE goals 
      ADD COLUMN IF NOT EXISTS icon VARCHAR(50)
    `

    console.log('✅ goals table updated successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'goals table updated successfully' 
    })
  } catch (error) {
    console.error('❌ Error updating goals table:', error)
    return NextResponse.json({ 
      error: 'Failed to update goals table', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
