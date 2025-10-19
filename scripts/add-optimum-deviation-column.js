const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addOptimumDeviationColumn() {
  try {
    console.log('Adding optimum_deviation column to daily_stats table...')
    await sql`
      ALTER TABLE daily_stats 
      ADD COLUMN IF NOT EXISTS optimum_deviation INTEGER DEFAULT 0
    `
    console.log('✅ optimum_deviation column added successfully')

    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'daily_stats' AND column_name = 'optimum_deviation'
    `
    console.log('✅ Column verified:', result[0])

  } catch (error) {
    console.error('❌ Error adding optimum_deviation column:', error)
  } finally {
    // No need to end the pool with neon serverless
  }
}

addOptimumDeviationColumn()
