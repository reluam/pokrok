const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addQuestTables() {
  try {
    console.log('Adding quest tables...')
    
    // Create quest templates table
    await sql`
      CREATE TABLE IF NOT EXISTS quest_templates (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('daily', 'weekly', 'special', 'purchased')),
        category VARCHAR(50) NOT NULL CHECK (category IN ('value', 'goal', 'overdue', 'general')),
        reward_xp INTEGER NOT NULL DEFAULT 0,
        reward_coins INTEGER DEFAULT 0,
        price_coins INTEGER DEFAULT 0,
        duration_days INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    // Create quests table
    await sql`
      CREATE TABLE IF NOT EXISTS quests (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('daily', 'weekly', 'special', 'purchased')),
        category VARCHAR(50) NOT NULL CHECK (category IN ('value', 'goal', 'overdue', 'general')),
        target_value_id VARCHAR(255) REFERENCES values(id) ON DELETE CASCADE,
        target_goal_id VARCHAR(255) REFERENCES goals(id) ON DELETE CASCADE,
        reward_xp INTEGER NOT NULL DEFAULT 0,
        reward_coins INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `
    
    // Create user coins table
    await sql`
      CREATE TABLE IF NOT EXISTS user_coins (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        coins INTEGER NOT NULL DEFAULT 0,
        total_earned INTEGER NOT NULL DEFAULT 0,
        total_spent INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    console.log('Quest tables added successfully!')
  } catch (error) {
    console.error('Error adding quest tables:', error)
    process.exit(1)
  }
}

addQuestTables()
