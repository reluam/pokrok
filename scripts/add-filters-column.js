const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addFiltersColumn() {
  try {
    console.log('Adding filters column to user_settings table...')
    await sql`
      ALTER TABLE user_settings
      ADD COLUMN IF NOT EXISTS filters JSONB DEFAULT '{
        "showToday": true,
        "showOverdue": true,
        "showFuture": false,
        "showWithGoal": true,
        "showWithoutGoal": true,
        "sortBy": "date"
      }'
    `
    console.log('Filters column added successfully!')
  } catch (error) {
    console.error('Error adding filters column:', error)
  }
}

addFiltersColumn()
