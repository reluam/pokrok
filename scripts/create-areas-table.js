const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function createAreasTable() {
  try {
    console.log('Creating areas table...')
    await sql`
      CREATE TABLE IF NOT EXISTS areas (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
        icon VARCHAR(10),
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ areas table created successfully')

    // Add index for faster lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_areas_user_id ON areas(user_id)`
    console.log('✅ Index created successfully')

  } catch (error) {
    console.error('❌ Error creating areas table:', error)
  } finally {
    // No need to end the pool with neon serverless
  }
}

createAreasTable()
