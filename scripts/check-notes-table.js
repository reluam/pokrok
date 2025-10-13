require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

async function checkNotesTable() {
  try {
    console.log('Checking notes table structure...')
    
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      )
    `
    console.log('Table exists:', tableExists[0].exists)
    
    if (tableExists[0].exists) {
      // Check table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'notes'
        ORDER BY ordinal_position
      `
      console.log('Table columns:')
      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`)
      })
      
      // Try to insert a test note
      console.log('Testing note creation...')
      const testNote = await sql`
        INSERT INTO notes (user_id, title, content)
        VALUES ('test-user-id', 'Test Note', 'Test content')
        RETURNING *
      `
      console.log('Test note created:', testNote[0])
      
      // Clean up test note
      await sql`DELETE FROM notes WHERE user_id = 'test-user-id'`
      console.log('Test note cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Error checking notes table:', error)
  }
}

checkNotesTable()
