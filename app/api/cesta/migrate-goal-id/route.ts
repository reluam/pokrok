import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export async function GET(request: NextRequest) {
  try {
    console.log('Starting goal_id migration...')

    // Make goal_id nullable in daily_steps table
    await sql`
      ALTER TABLE daily_steps 
      ALTER COLUMN goal_id DROP NOT NULL;
    `
    console.log('Made goal_id nullable in daily_steps table')

    return NextResponse.json({ success: true, message: 'Goal ID migration completed successfully' })
  } catch (error) {
    console.error('Error during goal_id migration:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error during goal_id migration', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
