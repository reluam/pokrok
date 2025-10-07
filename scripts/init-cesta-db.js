const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function initializeCestaDatabase() {
  try {
    console.log('Initializing Cesta database...')

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        has_completed_onboarding BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create values table
    await sql`
      CREATE TABLE IF NOT EXISTS values (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(7) NOT NULL,
        icon VARCHAR(50) NOT NULL,
        is_custom BOOLEAN DEFAULT FALSE,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create goals table
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create goal_values junction table
    await sql`
      CREATE TABLE IF NOT EXISTS goal_values (
        id VARCHAR(255) PRIMARY KEY,
        goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        value_id VARCHAR(255) NOT NULL REFERENCES values(id) ON DELETE CASCADE,
        weight INTEGER DEFAULT 5 CHECK (weight >= 1 AND weight <= 10),
        UNIQUE(goal_id, value_id)
      )
    `

    // Create daily_steps table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_steps (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create weekly_reflections table
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_reflections (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,
        content TEXT NOT NULL,
        mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
        achievements TEXT[] DEFAULT '{}',
        challenges TEXT[] DEFAULT '{}',
        next_week_focus TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create progress_milestones table
    await sql`
      CREATE TABLE IF NOT EXISTS progress_milestones (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create value_actions table
    await sql`
      CREATE TABLE IF NOT EXISTS value_actions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        value_id VARCHAR(255) NOT NULL REFERENCES values(id) ON DELETE CASCADE,
        action VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

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

    // No system values - each user creates their own values

    console.log('Cesta database initialized successfully!')
  } catch (error) {
    console.error('Error initializing Cesta database:', error)
    process.exit(1)
  }
}

initializeCestaDatabase()
