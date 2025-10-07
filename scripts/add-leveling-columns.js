const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addLevelingColumns() {
  try {
    console.log('Adding leveling columns to values table...')
    
    // Add level and experience columns if they don't exist
    await sql`
      ALTER TABLE values 
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1
    `
    
    await sql`
      ALTER TABLE values 
      ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0
    `
    
    console.log('Leveling columns added successfully!')
  } catch (error) {
    console.error('Error adding leveling columns:', error)
    process.exit(1)
  }
}

addLevelingColumns()
