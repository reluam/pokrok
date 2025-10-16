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
        target_date DATE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
        priority VARCHAR(20) DEFAULT 'meaningful' CHECK (priority IN ('meaningful', 'nice-to-have')),
        category VARCHAR(20) DEFAULT 'medium-term' CHECK (category IN ('short-term', 'medium-term', 'long-term')),
        goal_type VARCHAR(20) DEFAULT 'outcome' CHECK (goal_type IN ('process', 'outcome')),
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        progress_type VARCHAR(20) DEFAULT 'percentage' CHECK (progress_type IN ('percentage', 'count', 'amount', 'steps')),
        progress_target INTEGER,
        progress_current INTEGER DEFAULT 0,
        progress_unit VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create daily_steps table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_steps (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_id VARCHAR(255) REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        date DATE NOT NULL,
        step_type VARCHAR(20) DEFAULT 'custom' CHECK (step_type IN ('custom', 'automated')),
        is_important BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS metrics (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        unit VARCHAR(50) NOT NULL,
        target_value DECIMAL(10,2),
        current_value DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create goal_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS goal_metrics (
        id VARCHAR(255) PRIMARY KEY,
        goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        metric_id VARCHAR(255) NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
        target_value DECIMAL(10,2),
        current_value DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(goal_id, metric_id)
      )
    `

    // Create automations table
    await sql`
      CREATE TABLE IF NOT EXISTS automations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('daily', 'weekly', 'monthly', 'custom')),
        trigger_config JSONB,
        action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('create_step', 'update_metric', 'send_notification')),
        action_config JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create events table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('milestone', 'reflection', 'celebration', 'challenge')),
        date DATE NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create category_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS category_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(20) NOT NULL CHECK (category IN ('short-term', 'medium-term', 'long-term')),
        max_goals INTEGER DEFAULT 3,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, category)
      )
    `

    // Create needed_steps_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS needed_steps_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(20) NOT NULL CHECK (category IN ('short-term', 'medium-term', 'long-term')),
        min_steps INTEGER DEFAULT 3,
        max_steps INTEGER DEFAULT 5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, category)
      )
    `

    // Create user_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        daily_steps_count INTEGER DEFAULT 3,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `

    // Create daily_planning table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_planning (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        planned_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
        completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `

    // Create user_streak table
    await sql`
      CREATE TABLE IF NOT EXISTS user_streak (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_values_user_id ON values(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_user_id ON daily_steps(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_goal_id ON daily_steps(goal_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_date ON daily_steps(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_completed ON daily_steps(completed)`
    await sql`CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_goal_metrics_goal_id ON goal_metrics(goal_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_goal_metrics_metric_id ON goal_metrics(metric_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_category_settings_user_id ON category_settings(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_needed_steps_settings_user_id ON needed_steps_settings(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_planning_user_id ON daily_planning(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_planning_date ON daily_planning(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_streak_user_id ON user_streak(user_id)`

    console.log('Cesta database initialized successfully!')
  } catch (error) {
    console.error('Error initializing Cesta database:', error)
    process.exit(1)
  }
}

initializeCestaDatabase()