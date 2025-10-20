const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function fixCategorySettings() {
  try {
    console.log('Fixing category_settings table...')
    
    // First, let's see what columns exist
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'category_settings'
      ORDER BY ordinal_position
    `
    console.log('Current columns:', columns)

    // Add category column if it doesn't exist
    await sql`
      ALTER TABLE category_settings 
      ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'general'
    `
    console.log('✅ category column added successfully')

    // Update existing rows to have a category
    await sql`
      UPDATE category_settings 
      SET category = 'general' 
      WHERE category IS NULL
    `
    console.log('✅ Updated existing rows with category')

    // Make category NOT NULL
    await sql`
      ALTER TABLE category_settings 
      ALTER COLUMN category SET NOT NULL
    `
    console.log('✅ Made category column NOT NULL')

  } catch (error) {
    console.error('❌ Error fixing category_settings:', error)
  }
}

fixCategorySettings()
