const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addWorkflowColumn() {
  try {
    console.log('Adding workflow column to user_settings table...')

    // Add workflow column if it doesn't exist
    await sql`
      ALTER TABLE user_settings 
      ADD COLUMN IF NOT EXISTS workflow VARCHAR(20) DEFAULT 'daily_planning' CHECK (workflow IN ('daily_planning', 'no_workflow'))
    `

    console.log('Workflow column added successfully!')
  } catch (error) {
    console.error('Error adding workflow column:', error)
  }
}

addWorkflowColumn()

