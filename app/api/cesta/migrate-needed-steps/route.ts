import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export async function GET(request: NextRequest) {
  try {
    console.log('Starting needed steps settings migration...')

    // Create needed_steps_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS needed_steps_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT FALSE,
        days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
        time_hour INTEGER DEFAULT 9,
        time_minute INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `
    console.log('Created needed_steps_settings table')

    return NextResponse.json({ success: true, message: 'Needed steps settings migration completed successfully' })
  } catch (error) {
    console.error('Error during needed steps settings migration:', error)
    return NextResponse.json({ success: false, message: 'Error during needed steps settings migration', error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
