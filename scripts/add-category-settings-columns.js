const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addCategorySettingsColumns() {
  try {
    console.log('Adding missing columns to category_settings table...')
    
    // Add short_term_days column
    await sql`
      ALTER TABLE category_settings 
      ADD COLUMN IF NOT EXISTS short_term_days INTEGER DEFAULT 90
    `
    console.log('✅ short_term_days column added successfully')

    // Add long_term_days column
    await sql`
      ALTER TABLE category_settings 
      ADD COLUMN IF NOT EXISTS long_term_days INTEGER DEFAULT 365
    `
    console.log('✅ long_term_days column added successfully')

    // Verify the columns were added
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'category_settings' 
      AND column_name IN ('short_term_days', 'long_term_days')
    `
    console.log('✅ Columns verified:', result)

  } catch (error) {
    console.error('❌ Error adding category_settings columns:', error)
  } finally {
    // No need to end the pool with neon serverless
  }
}

addCategorySettingsColumns()
