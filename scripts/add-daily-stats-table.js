const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addDailyStatsTable() {
  try {
    console.log('Creating daily_stats table...')
    
    // Create daily_stats table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        planned_steps_count INTEGER DEFAULT 0,
        completed_steps_count INTEGER DEFAULT 0,
        total_steps_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `
    
    console.log('✅ daily_stats table created successfully')
    
    // Create index for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date)`
    console.log('✅ Index created successfully')
    
  } catch (error) {
    console.error('❌ Error creating daily_stats table:', error)
  }
}

addDailyStatsTable()
