const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function checkAndAddFiltersColumn() {
  try {
    console.log('Checking if filters column exists...')
    
    // First check if column exists
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'filters'
    `
    
    if (checkResult.length === 0) {
      console.log('Filters column does not exist, adding it...')
      await sql`
        ALTER TABLE user_settings
        ADD COLUMN filters JSONB DEFAULT '{
          "showToday": true,
          "showOverdue": true,
          "showFuture": false,
          "showWithGoal": true,
          "showWithoutGoal": true,
          "sortBy": "date"
        }'
      `
      console.log('Filters column added successfully!')
    } else {
      console.log('Filters column already exists!')
    }
    
    // Verify the column was added
    const verifyResult = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'filters'
    `
    console.log('Column details:', verifyResult[0])
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAndAddFiltersColumn()
