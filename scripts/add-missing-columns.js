const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to existing tables...')

    // Add missing columns to values table
    try {
      await sql`ALTER TABLE values ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1`
      console.log('Added level column to values table')
    } catch (error) {
      console.log('Level column may already exist:', error.message)
    }

    try {
      await sql`ALTER TABLE values ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0`
      console.log('Added experience column to values table')
    } catch (error) {
      console.log('Experience column may already exist:', error.message)
    }

    // Add missing columns to daily_steps table
    try {
      await sql`ALTER TABLE daily_steps ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE`
      console.log('Added is_important column to daily_steps table')
    } catch (error) {
      console.log('is_important column may already exist:', error.message)
    }

    try {
      await sql`ALTER TABLE daily_steps ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE`
      console.log('Added is_urgent column to daily_steps table')
    } catch (error) {
      console.log('is_urgent column may already exist:', error.message)
    }

    try {
      await sql`ALTER TABLE daily_steps ADD COLUMN IF NOT EXISTS custom_type_name VARCHAR(255)`
      console.log('Added custom_type_name column to daily_steps table')
    } catch (error) {
      console.log('custom_type_name column may already exist:', error.message)
    }

    try {
      await sql`ALTER TABLE daily_steps ADD COLUMN IF NOT EXISTS deadline DATE`
      console.log('Added deadline column to daily_steps table')
    } catch (error) {
      console.log('deadline column may already exist:', error.message)
    }

    console.log('Missing columns added successfully!')
  } catch (error) {
    console.error('Error adding missing columns:', error)
    process.exit(1)
  }
}

addMissingColumns()
