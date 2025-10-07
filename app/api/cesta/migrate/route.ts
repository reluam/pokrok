import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting database migration...')

    // Create events table without foreign keys first
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        goal_id VARCHAR(255) NOT NULL,
        automation_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        date DATE NOT NULL,
        is_important BOOLEAN DEFAULT FALSE,
        is_urgent BOOLEAN DEFAULT FALSE,
        event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('metric_update', 'step_reminder')),
        target_metric_id VARCHAR(255),
        target_step_id VARCHAR(255),
        update_value DECIMAL(10,2),
        update_unit VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Add foreign key constraints after table creation
    try {
      await sql`ALTER TABLE events ADD CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
    } catch (e) {
      console.log('Foreign key events_user_id_fkey already exists or failed to create')
    }

    try {
      await sql`ALTER TABLE events ADD CONSTRAINT events_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE`
    } catch (e) {
      console.log('Foreign key events_goal_id_fkey already exists or failed to create')
    }

    try {
      await sql`ALTER TABLE events ADD CONSTRAINT events_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE`
    } catch (e) {
      console.log('Foreign key events_automation_id_fkey already exists or failed to create')
    }

    try {
      await sql`ALTER TABLE events ADD CONSTRAINT events_target_metric_id_fkey FOREIGN KEY (target_metric_id) REFERENCES metrics(id) ON DELETE CASCADE`
    } catch (e) {
      console.log('Foreign key events_target_metric_id_fkey already exists or failed to create')
    }

    try {
      await sql`ALTER TABLE events ADD CONSTRAINT events_target_step_id_fkey FOREIGN KEY (target_step_id) REFERENCES daily_steps(id) ON DELETE CASCADE`
    } catch (e) {
      console.log('Foreign key events_target_step_id_fkey already exists or failed to create')
    }

    // Create indexes for events
    await sql`CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_goal_id ON events(goal_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_automation_id ON events(automation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_completed ON events(completed)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)`

    // Create event_interactions table for smart events
    await sql`
      CREATE TABLE IF NOT EXISTS event_interactions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        automation_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'postponed', 'pending')),
        postponed_to DATE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Add foreign key constraints for event_interactions
    try {
      await sql`ALTER TABLE event_interactions ADD CONSTRAINT event_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
    } catch (e) {
      console.log('Foreign key event_interactions_user_id_fkey already exists or failed to create')
    }

    try {
      await sql`ALTER TABLE event_interactions ADD CONSTRAINT event_interactions_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE`
    } catch (e) {
      console.log('Foreign key event_interactions_automation_id_fkey already exists or failed to create')
    }

    // Create indexes for event_interactions
    await sql`CREATE INDEX IF NOT EXISTS idx_event_interactions_user_id ON event_interactions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_event_interactions_automation_id ON event_interactions(automation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_event_interactions_date ON event_interactions(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_event_interactions_status ON event_interactions(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_event_interactions_user_date ON event_interactions(user_id, date)`

    // Remove old columns from daily_steps if they exist
    await sql`
      ALTER TABLE daily_steps 
      DROP COLUMN IF EXISTS frequency_time,
      DROP COLUMN IF EXISTS automation_template_id,
      DROP COLUMN IF EXISTS update_progress_type,
      DROP COLUMN IF EXISTS update_value,
      DROP COLUMN IF EXISTS update_unit
    `

    // Add metric_id column to daily_steps table (if not already there)
    await sql`
      ALTER TABLE daily_steps 
      ADD COLUMN IF NOT EXISTS metric_id VARCHAR(255) REFERENCES metrics(id) ON DELETE SET NULL
    `

    // Add deadline column to daily_steps table (if not already there)
    await sql`
      ALTER TABLE daily_steps 
      ADD COLUMN IF NOT EXISTS deadline DATE
    `

    // Add is_automated column to daily_steps table (if not already there)
    await sql`
      ALTER TABLE daily_steps 
      ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT FALSE
    `

    // Create indexes for daily_steps
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_deadline ON daily_steps(deadline)`

    console.log('✅ Database migration completed successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully' 
    })
  } catch (error) {
    console.error('❌ Database migration failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
