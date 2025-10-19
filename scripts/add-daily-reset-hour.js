const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addDailyResetHour() {
  try {
    console.log('Adding daily_reset_hour column to user_settings table...')
    
    // Add daily_reset_hour column with default value 0 (midnight)
    await sql`
      ALTER TABLE user_settings 
      ADD COLUMN IF NOT EXISTS daily_reset_hour INTEGER DEFAULT 0
    `
    
    console.log('✅ daily_reset_hour column added successfully')
    
    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      AND column_name = 'daily_reset_hour'
    `
    
    if (result.length > 0) {
      console.log('✅ Column verified:', result[0])
    } else {
      console.log('❌ Column not found')
    }
    
  } catch (error) {
    console.error('❌ Error adding daily_reset_hour column:', error)
  }
}

addDailyResetHour()
