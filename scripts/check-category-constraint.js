const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function checkCategoryConstraint() {
  try {
    console.log('Checking category_settings constraints...')
    
    // Get constraint information
    const constraints = await sql`
      SELECT conname, consrc
      FROM pg_constraint 
      WHERE conrelid = 'category_settings'::regclass 
      AND conname = 'category_settings_category_check'
    `
    console.log('Category check constraint:', constraints)

    // Try to see what values are allowed
    const tableInfo = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'category_settings' AND column_name = 'category'
    `
    console.log('Category column info:', tableInfo)

  } catch (error) {
    console.error('❌ Error checking constraints:', error)
  }
}

checkCategoryConstraint()
