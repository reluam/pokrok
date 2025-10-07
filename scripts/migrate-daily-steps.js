const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function migrateDailySteps() {
  try {
    console.log('Migrating daily_steps table...')

    // Check if value_id column exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'daily_steps' 
      AND column_name = 'value_id'
    `

    if (columnExists.length > 0) {
      console.log('Removing value_id column from daily_steps table...')
      
      // Drop the value_id column
      await sql`
        ALTER TABLE daily_steps 
        DROP COLUMN IF EXISTS value_id
      `
      
      console.log('value_id column removed successfully!')
    } else {
      console.log('value_id column does not exist, no migration needed.')
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

migrateDailySteps()


