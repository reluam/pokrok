import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting goal_metrics table migration...')
    
    // Create goal_metrics table without foreign key constraints first
    await sql`
      CREATE TABLE IF NOT EXISTS goal_metrics (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        goal_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('number', 'currency', 'percentage', 'distance', 'time', 'custom')),
        unit VARCHAR(50) NOT NULL,
        target_value DECIMAL(10,2) NOT NULL,
        current_value DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    console.log('✅ goal_metrics table created successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'goal_metrics table created successfully' 
    })
  } catch (error) {
    console.error('❌ Error creating goal_metrics table:', error)
    return NextResponse.json({ 
      error: 'Failed to create goal_metrics table', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}