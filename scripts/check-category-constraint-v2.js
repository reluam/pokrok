const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function checkCategoryConstraint() {
  try {
    console.log('Checking category_settings constraints...')
    
    // Get constraint information using pg_get_constraintdef
    const constraints = await sql`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'category_settings'::regclass 
      AND conname = 'category_settings_category_check'
    `
    console.log('Category check constraint:', constraints)

    // Try to see what values are allowed by looking at existing data
    const existingData = await sql`
      SELECT DISTINCT category FROM category_settings WHERE category IS NOT NULL
    `
    console.log('Existing category values:', existingData)

  } catch (error) {
    console.error('❌ Error checking constraints:', error)
  }
}

checkCategoryConstraint()
