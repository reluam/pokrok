const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function testFiltersColumn() {
  try {
    console.log('Testing filters column...')
    
    // Try to insert a test record with filters
    const testResult = await sql`
      INSERT INTO user_settings (id, user_id, daily_steps_count, workflow, filters)
      VALUES ('test-123', 'test-user', 3, 'daily_planning', '{"showToday": true}')
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        filters = '{"showToday": true}',
        updated_at = NOW()
      RETURNING *
    `
    
    console.log('Test insert successful:', testResult[0])
    
    // Clean up test record
    await sql`DELETE FROM user_settings WHERE user_id = 'test-user'`
    console.log('Test record cleaned up')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testFiltersColumn()
