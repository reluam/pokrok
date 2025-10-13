require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

async function createNotesTable() {
  try {
    console.log('Creating notes table...')
    
    // Create notes table
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_goal_id ON notes(goal_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at)`
    
    // Create trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_notes_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `
    
    // Create trigger
    await sql`
      CREATE TRIGGER trigger_update_notes_updated_at
        BEFORE UPDATE ON notes
        FOR EACH ROW
        EXECUTE FUNCTION update_notes_updated_at()
    `
    
    console.log('✅ Notes table created successfully!')
  } catch (error) {
    console.error('❌ Error creating notes table:', error)
  }
}

createNotesTable()