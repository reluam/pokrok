import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export interface User {
  id: string
  clerk_user_id: string
  email: string
  name: string
  has_completed_onboarding: boolean
  created_at: Date
  updated_at: Date
}

export interface Value {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  icon: string
  is_custom: boolean
  level: number
  experience: number
  created_at: Date
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  target_date?: string | Date
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'meaningful' | 'nice-to-have'
  category: 'short-term' | 'medium-term' | 'long-term'
  goal_type: 'process' | 'outcome'
  progress_percentage: number
  progress_type: 'percentage' | 'count' | 'amount' | 'steps'
  progress_target?: number
  progress_current?: number
  progress_unit?: string
  icon?: string
  created_at: string | Date
  updated_at: string | Date
}

export interface DailyStep {
  id: string
  user_id: string
  goal_id: string
  title: string
  description?: string
  completed: boolean
  completed_at?: Date
  date: Date
  is_important: boolean
  is_urgent: boolean
  created_at: Date
  step_type: 'update' | 'revision' | 'custom'
  custom_type_name?: string
  deadline?: Date
  metric_id?: string
  isCompleting?: boolean // Loading state for completion
}

export interface Metric {
  id: string
  user_id: string
  step_id: string
  name: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  created_at: Date
  updated_at: Date
}

export interface GoalMetric {
  id: string
  user_id: string
  goal_id: string
  name: string
  description?: string
  type: 'number' | 'currency' | 'percentage' | 'distance' | 'time' | 'custom'
  unit: string
  target_value: number
  current_value: number
  created_at: Date
  updated_at: Date
}

export interface Note {
  id: string
  user_id: string
  goal_id?: string // Optional - can be assigned to a goal or be standalone
  title: string
  content: string
  created_at: Date
  updated_at: Date
}

export interface Event {
  id: string
  user_id: string
  goal_id: string
  automation_id: string
  title: string
  description?: string
  completed: boolean
  completed_at?: Date
  date: Date
  is_important: boolean
  is_urgent: boolean
  created_at: Date
  event_type: 'metric_update' | 'step_reminder'
  target_metric_id?: string
  target_step_id?: string
  update_value?: number
  update_unit?: string
}

export interface EventInteraction {
  id: string
  user_id: string
  automation_id: string
  date: Date
  status: 'completed' | 'postponed' | 'pending'
  postponed_to?: Date
  completed_at?: Date
  created_at: Date
  updated_at: Date
}

export interface Automation {
  id: string
  user_id: string
  name: string
  description?: string
  type: 'metric' | 'step'
  target_id: string
  frequency_type: 'one-time' | 'recurring'
  frequency_time?: string
  scheduled_date?: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CategorySettings {
  id: string
  user_id: string
  short_term_days: number
  long_term_days: number
  created_at: Date
  updated_at: Date
}

export interface NeededStepsSettings {
  id: string
  user_id: string
  enabled: boolean
  days_of_week: number[]
  time_hour: number
  time_minute: number
  created_at: Date
  updated_at: Date
}

export async function initializeCestaDatabase() {
  try {
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
        goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        date DATE NOT NULL,
        is_important BOOLEAN DEFAULT FALSE,
        is_urgent BOOLEAN DEFAULT FALSE,
        step_type VARCHAR(20) DEFAULT 'custom' CHECK (step_type IN ('update', 'revision', 'custom')),
        custom_type_name VARCHAR(255),
        deadline DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create metrics table (legacy - for step metrics)
    await sql`
      CREATE TABLE IF NOT EXISTS metrics (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        step_id VARCHAR(255) NOT NULL REFERENCES daily_steps(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        target_value DECIMAL(10,2) NOT NULL,
        current_value DECIMAL(10,2) DEFAULT 0,
        unit VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create goal_metrics table (new - for goal-level metrics)
    await sql`
      CREATE TABLE IF NOT EXISTS goal_metrics (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('number', 'currency', 'percentage', 'distance', 'time', 'custom')),
        unit VARCHAR(50) NOT NULL,
        target_value DECIMAL(10,2) NOT NULL,
        current_value DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create automations table
    await sql`
      CREATE TABLE IF NOT EXISTS automations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(10) NOT NULL CHECK (type IN ('metric', 'step')),
        target_id VARCHAR(255) NOT NULL,
        frequency_type VARCHAR(20) NOT NULL CHECK (frequency_type IN ('one-time', 'recurring')),
        frequency_time VARCHAR(100),
        scheduled_date TIMESTAMP WITH TIME ZONE,
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
        goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        automation_id VARCHAR(255) NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        date DATE NOT NULL,
        is_important BOOLEAN DEFAULT FALSE,
        is_urgent BOOLEAN DEFAULT FALSE,
        event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('metric_update', 'step_reminder')),
        target_metric_id VARCHAR(255) REFERENCES metrics(id) ON DELETE CASCADE,
        target_step_id VARCHAR(255) REFERENCES daily_steps(id) ON DELETE CASCADE,
        update_value DECIMAL(10,2),
        update_unit VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create category_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS category_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        short_term_days INTEGER NOT NULL DEFAULT 90,
        long_term_days INTEGER NOT NULL DEFAULT 365,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `

    // Create needed_steps_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS needed_steps_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        enabled BOOLEAN DEFAULT FALSE,
        days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
        time_hour INTEGER DEFAULT 9,
        time_minute INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `

    // Add metric_id column to daily_steps table
    await sql`
      ALTER TABLE daily_steps 
      ADD COLUMN IF NOT EXISTS metric_id VARCHAR(255) REFERENCES metrics(id) ON DELETE SET NULL
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_values_user_id ON values(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_values_is_custom ON values(is_custom)`
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_user_id ON daily_steps(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_goal_id ON daily_steps(goal_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_date ON daily_steps(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_completed ON daily_steps(completed)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_steps_deadline ON daily_steps(deadline)`
    await sql`CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_metrics_step_id ON metrics(step_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_automations_target_id ON automations(target_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_automations_active ON automations(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_goal_id ON events(goal_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_automation_id ON events(automation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_completed ON events(completed)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_category_settings_user_id ON category_settings(user_id)`

    // Insert default values library
    await sql`
      INSERT INTO values (id, user_id, name, description, color, icon, is_custom) VALUES
      ('default-freedom', 'system', 'Svoboda', 'Možnost volby a nezávislost', '#3B82F6', 'compass', false),
      ('default-family', 'system', 'Rodina', 'Blízké vztahy a péče o blízké', '#10B981', 'heart', false),
      ('default-creativity', 'system', 'Kreativita', 'Tvořivost a sebevyjádření', '#F59E0B', 'palette', false),
      ('default-growth', 'system', 'Růst', 'Osobní rozvoj a učení', '#8B5CF6', 'trending-up', false),
      ('default-health', 'system', 'Zdraví', 'Fyzické a duševní zdraví', '#EF4444', 'heart-pulse', false),
      ('default-career', 'system', 'Kariéra', 'Profesní úspěch a naplnění', '#06B6D4', 'briefcase', false),
      ('default-adventure', 'system', 'Dobrodružství', 'Nové zkušenosti a výzvy', '#84CC16', 'map', false),
      ('default-peace', 'system', 'Klid', 'Vnitřní mír a harmonie', '#6B7280', 'moon', false)
      ON CONFLICT (id) DO NOTHING
    `

    console.log('Cesta database initialized successfully')
  } catch (error) {
    console.error('Error initializing Cesta database:', error)
    throw error
  }
}

export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT * FROM users 
      WHERE clerk_user_id = ${clerkUserId}
      LIMIT 1
    `
    return users[0] as User || null
  } catch (error) {
    console.error('Error fetching user by clerk ID:', error)
    return null
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await sql`
      SELECT * FROM users ORDER BY created_at DESC
    `
    return result as User[]
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
}

// Needed Steps Settings functions
export async function getNeededStepsSettings(userId: string): Promise<NeededStepsSettings | null> {
  try {
    const result = await sql`
      SELECT * FROM needed_steps_settings 
      WHERE user_id = ${userId}
    `
    return result.length > 0 ? result[0] as NeededStepsSettings : null
  } catch (error) {
    console.error('Error fetching needed steps settings:', error)
    return null
  }
}

export async function createNeededStepsSettings(userId: string, settings: Partial<NeededStepsSettings>): Promise<NeededStepsSettings> {
  try {
    const id = crypto.randomUUID()
    const result = await sql`
      INSERT INTO needed_steps_settings (
        id, user_id, enabled, days_of_week, time_hour, time_minute
      ) VALUES (
        ${id}, ${userId}, ${settings.enabled || false}, 
        ${settings.days_of_week || [1,2,3,4,5]}, 
        ${settings.time_hour || 9}, 
        ${settings.time_minute || 0}
      ) RETURNING *
    `
    return result[0] as NeededStepsSettings
  } catch (error) {
    console.error('Error creating needed steps settings:', error)
    throw error
  }
}

export async function updateNeededStepsSettings(userId: string, settings: Partial<NeededStepsSettings>): Promise<NeededStepsSettings> {
  try {
    const result = await sql`
      UPDATE needed_steps_settings 
      SET 
        enabled = ${settings.enabled},
        days_of_week = ${settings.days_of_week},
        time_hour = ${settings.time_hour},
        time_minute = ${settings.time_minute},
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `
    
    if (result.length === 0) {
      throw new Error('Settings not found')
    }
    
    return result[0] as NeededStepsSettings
  } catch (error) {
    console.error('Error updating needed steps settings:', error)
    throw error
  }
}

export async function upsertNeededStepsSettings(userId: string, settings: Partial<NeededStepsSettings>): Promise<NeededStepsSettings> {
  try {
    const existing = await getNeededStepsSettings(userId)
    
    if (existing) {
      return await updateNeededStepsSettings(userId, settings)
    } else {
      return await createNeededStepsSettings(userId, settings)
    }
  } catch (error) {
    console.error('Error upserting needed steps settings:', error)
    throw error
  }
}

export async function createUser(clerkUserId: string, email: string, name: string): Promise<User> {
  const id = crypto.randomUUID()
  const user = await sql`
    INSERT INTO users (id, clerk_user_id, email, name, has_completed_onboarding)
    VALUES (${id}, ${clerkUserId}, ${email}, ${name}, false)
    RETURNING *
  `
  return user[0] as User
}

export async function getGoalsByUserId(userId: string): Promise<Goal[]> {
  try {
    const goals = await sql`
      SELECT * FROM goals 
      WHERE user_id = ${userId}
      ORDER BY 
        CASE WHEN target_date IS NULL THEN 1 ELSE 0 END,
        target_date ASC,
        created_at DESC
    `
    return goals as Goal[]
  } catch (error) {
    console.error('Error fetching goals:', error)
    return []
  }
}

export async function getDailyStepsByUserId(userId: string): Promise<DailyStep[]> {
  try {
    const steps = await sql`
      SELECT * FROM daily_steps 
      WHERE user_id = ${userId}
      ORDER BY 
        CASE WHEN completed THEN 1 ELSE 0 END,
        date ASC,
        is_important DESC,
        is_urgent DESC,
        created_at DESC
    `
    return steps as DailyStep[]
  } catch (error) {
    console.error('Error fetching daily steps:', error)
    return []
  }
}

// Alias for backward compatibility
export const getAllDailySteps = getDailyStepsByUserId

export async function calculateNextCustomStepDate(frequencyTime: string): Promise<Date> {
  // Simple implementation - returns tomorrow for now
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

export async function getInspirationValues(): Promise<Value[]> {
  try {
    const values = await sql`
      SELECT * FROM values 
      WHERE is_custom = false
      ORDER BY name
    `
    return values as Value[]
  } catch (error) {
    console.error('Error fetching inspiration values:', error)
    return []
  }
}

export async function createGoal(goalData: Partial<Goal>): Promise<Goal> {
  const id = crypto.randomUUID()
  const goal = await sql`
    INSERT INTO goals (
      id, user_id, title, description, target_date, status, priority, 
      category, goal_type, progress_percentage, progress_type, 
      progress_target, progress_current, progress_unit
    ) VALUES (
      ${id}, ${goalData.user_id}, ${goalData.title}, ${goalData.description || null}, 
      ${goalData.target_date || null}, ${goalData.status || 'active'}, 
      ${goalData.priority || 'meaningful'}, ${goalData.category || 'medium-term'}, 
      ${goalData.goal_type || 'outcome'}, ${goalData.progress_percentage || 0}, 
      ${goalData.progress_type || 'percentage'}, ${goalData.progress_target || null}, 
      ${goalData.progress_current || 0}, ${goalData.progress_unit || null}
    ) RETURNING *
  `
  return goal[0] as Goal
}

export async function createDailyStep(stepData: Partial<DailyStep>): Promise<DailyStep> {
  const id = crypto.randomUUID()
  const step = await sql`
    INSERT INTO daily_steps (
      id, user_id, goal_id, title, description, completed, date, 
      is_important, is_urgent, step_type, custom_type_name, 
      deadline, metric_id
    ) VALUES (
      ${id}, ${stepData.user_id}, ${stepData.goal_id}, ${stepData.title}, 
      ${stepData.description || null}, ${stepData.completed || false}, 
      ${stepData.date}, ${stepData.is_important || false}, 
      ${stepData.is_urgent || false}, ${stepData.step_type || 'custom'}, 
      ${stepData.custom_type_name || null}, ${stepData.deadline || null}, 
      ${stepData.metric_id || null}
    ) RETURNING *
  `
  return step[0] as DailyStep
}

export async function toggleDailyStep(stepId: string): Promise<DailyStep> {
  try {
    // First get the current step
    const currentStep = await sql`
      SELECT * FROM daily_steps WHERE id = ${stepId}
    `
    
    if (currentStep.length === 0) {
      throw new Error('Step not found')
    }

    const step = currentStep[0] as DailyStep
    const newCompleted = !step.completed

    // Update the step
    const updatedStep = await sql`
      UPDATE daily_steps 
      SET completed = ${newCompleted}, 
          completed_at = ${newCompleted ? new Date().toISOString() : null},
          updated_at = NOW()
      WHERE id = ${stepId}
      RETURNING *
    `

    // Update goal progress if step was completed
    if (newCompleted && step.goal_id) {
      await updateGoalProgressCombined(step.goal_id)
    }

    return updatedStep[0] as DailyStep
  } catch (error) {
    console.error('Error toggling daily step:', error)
    throw error
  }
}

export async function completeDailyStep(stepId: string): Promise<DailyStep> {
  try {
    const updatedStep = await sql`
      UPDATE daily_steps 
      SET completed = true, completed_at = ${new Date().toISOString()}, updated_at = NOW()
      WHERE id = ${stepId}
      RETURNING *
    `
    
    if (updatedStep.length === 0) {
      throw new Error('Step not found')
    }

    const step = updatedStep[0] as DailyStep
    
    // Update goal progress if step was completed
    if (step.goal_id) {
      await updateGoalProgressCombined(step.goal_id)
    }
    
    return step
  } catch (error) {
    console.error('Error completing daily step:', error)
    throw error
  }
}

export async function updateDailyStep(stepId: string, stepData: Partial<DailyStep>): Promise<DailyStep> {
  try {
    const updatedStep = await sql`
      UPDATE daily_steps 
      SET title = ${stepData.title || ''}, 
          description = ${stepData.description || ''},
          completed = ${stepData.completed || false},
          completed_at = ${stepData.completed ? new Date().toISOString() : null},
          date = ${stepData.date ? new Date(stepData.date).toISOString().split('T')[0] : ''},
          is_important = ${stepData.is_important || false},
          is_urgent = ${stepData.is_urgent || false},
          updated_at = NOW()
      WHERE id = ${stepId}
      RETURNING *
    `
    
    if (updatedStep.length === 0) {
      throw new Error('Step not found')
    }
    
    return updatedStep[0] as DailyStep
  } catch (error) {
    console.error('Error updating daily step:', error)
    throw error
  }
}

export async function deleteDailyStep(stepId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM daily_steps WHERE id = ${stepId}
    `
  } catch (error) {
    console.error('Error deleting daily step:', error)
    throw error
  }
}

export async function updateDailyStepValue(stepId: string, value: number): Promise<DailyStep> {
  try {
    const updatedStep = await sql`
      UPDATE daily_steps 
      SET update_value = ${value}, updated_at = NOW()
      WHERE id = ${stepId}
      RETURNING *
    `
    
    if (updatedStep.length === 0) {
      throw new Error('Step not found')
    }
    
    return updatedStep[0] as DailyStep
  } catch (error) {
    console.error('Error updating daily step value:', error)
    throw error
  }
}

export async function updateDailyStepDate(stepId: string, newDate: Date): Promise<DailyStep> {
  try {
    const updatedStep = await sql`
      UPDATE daily_steps 
      SET date = ${newDate.toISOString().split('T')[0]}, updated_at = NOW()
      WHERE id = ${stepId}
      RETURNING *
    `
    return updatedStep[0] as DailyStep
  } catch (error) {
    console.error('Error updating daily step date:', error)
    throw error
  }
}

export async function getUpdatedGoalAfterStepCompletion(goalId: string): Promise<Goal> {
  try {
    const goal = await sql`
      SELECT * FROM goals WHERE id = ${goalId}
    `
    return goal[0] as Goal
  } catch (error) {
    console.error('Error fetching updated goal:', error)
    throw error
  }
}

export async function updateGoal(goalId: string, userId: string, goalData: Partial<Goal>): Promise<Goal> {
  try {
    // Build dynamic update query to only update provided fields
    const updateFields = []
    const values = []
    
    if (goalData.title !== undefined) {
      updateFields.push('title = $' + (values.length + 1))
      values.push(goalData.title)
    }
    if (goalData.description !== undefined) {
      updateFields.push('description = $' + (values.length + 1))
      values.push(goalData.description)
    }
    if (goalData.target_date !== undefined) {
      updateFields.push('target_date = $' + (values.length + 1))
      values.push(goalData.target_date)
    }
    if (goalData.priority !== undefined) {
      updateFields.push('priority = $' + (values.length + 1))
      values.push(goalData.priority)
    }
    if (goalData.category !== undefined) {
      updateFields.push('category = $' + (values.length + 1))
      values.push(goalData.category)
    }
    if (goalData.progress_type !== undefined) {
      updateFields.push('progress_type = $' + (values.length + 1))
      values.push(goalData.progress_type)
    }
    if (goalData.progress_target !== undefined) {
      updateFields.push('progress_target = $' + (values.length + 1))
      values.push(goalData.progress_target)
    }
    if (goalData.progress_current !== undefined) {
      updateFields.push('progress_current = $' + (values.length + 1))
      values.push(goalData.progress_current)
    }
    if (goalData.progress_unit !== undefined) {
      updateFields.push('progress_unit = $' + (values.length + 1))
      values.push(goalData.progress_unit)
    }
    
    // Always update the updated_at field
    updateFields.push('updated_at = NOW()')
    
    if (updateFields.length === 1) { // Only updated_at
      throw new Error('No fields to update')
    }
    
    const query = `
      UPDATE goals 
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
      RETURNING *
    `
    
    values.push(goalId, userId)
    
    const updatedGoal = await sql.unsafe(query) as unknown as any[]
    
    if (updatedGoal.length === 0) {
      throw new Error('Goal not found or access denied')
    }
    
    return updatedGoal[0] as Goal
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}

export async function deleteGoal(goalId: string, userId: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting goal ${goalId} for user ${userId}`)
    
    // First check if goal exists
    const goalExists = await sql`
      SELECT id FROM goals 
      WHERE id = ${goalId} AND user_id = ${userId}
    `
    
    if (goalExists.length === 0) {
      throw new Error('Goal not found or access denied')
    }
    
    // Get all step IDs for this goal
    const steps = await sql`
      SELECT id FROM daily_steps 
      WHERE goal_id = ${goalId} AND user_id = ${userId}
    `
    
    const stepIds = steps.map(step => step.id)
    console.log(`📝 Found ${stepIds.length} steps to delete`)
    
    if (stepIds.length > 0) {
      // First get automation IDs before deleting them
      const automations = await sql`
        SELECT id FROM automations 
        WHERE target_id = ANY(${stepIds})
      `
      const automationIds = automations.map(automation => automation.id)
      console.log(`🤖 Found ${automationIds.length} automations to delete`)
      
      if (automationIds.length > 0) {
        // Delete related event interactions first
        console.log('🗑️ Deleting event interactions...')
        await sql`
          DELETE FROM event_interactions 
          WHERE automation_id = ANY(${automationIds})
        `
      }
      
      // Delete related metrics
      console.log('📊 Deleting metrics...')
      await sql`
        DELETE FROM metrics 
        WHERE step_id = ANY(${stepIds})
      `
      
      // Delete related automations
      console.log('🤖 Deleting automations...')
      await sql`
        DELETE FROM automations 
        WHERE target_id = ANY(${stepIds})
      `
    }
    
    // Delete events related to this goal
    console.log('⚡ Deleting events...')
    await sql`
      DELETE FROM events 
      WHERE goal_id = ${goalId} AND user_id = ${userId}
    `
    
    // Delete related steps
    console.log('👣 Deleting steps...')
    await sql`
      DELETE FROM daily_steps 
      WHERE goal_id = ${goalId} AND user_id = ${userId}
    `
    
    // Delete the goal
    console.log('🎯 Deleting goal...')
    const result = await sql`
      DELETE FROM goals 
      WHERE id = ${goalId} AND user_id = ${userId}
    `
    
    console.log('✅ Goal deleted successfully')
  } catch (error) {
    console.error('❌ Error deleting goal:', error)
    throw error
  }
}

export async function determineGoalCategoryWithSettings(targetDate: Date | null, shortTermDays: number = 90, longTermDays: number = 365): Promise<'short-term' | 'medium-term' | 'long-term'> {
  if (!targetDate) {
    return 'medium-term'
  }

  const today = new Date()
  const daysDiff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= shortTermDays) {
    return 'short-term'
  } else if (daysDiff <= longTermDays) {
    return 'medium-term'
  } else {
    return 'long-term'
  }
}

export async function updateGoalProgressFromMetrics(goalId: string) {
  try {
    // Use a single query to calculate and update progress
    const result = await sql`
      WITH step_progress AS (
        SELECT 
          CASE 
            WHEN ds.metric_id IS NOT NULL AND m.target_value > 0 AND m.current_value IS NOT NULL THEN
              LEAST((m.current_value / m.target_value) * 100, 100)
            WHEN ds.completed THEN 100
            ELSE 0
          END as progress
        FROM daily_steps ds
        LEFT JOIN metrics m ON ds.metric_id = m.id
        WHERE ds.goal_id = ${goalId}
      )
      UPDATE goals 
      SET 
        progress_percentage = COALESCE(
          (SELECT ROUND(AVG(progress)) FROM step_progress), 
          0
        ),
        updated_at = NOW()
      WHERE id = ${goalId}
    `

    console.log(`Updated goal ${goalId} progress using optimized query`)
    return result
  } catch (error) {
    console.error('Error updating goal progress from metrics:', error)
    throw error
  }
}

export async function updateGoalProgress(goalId: string, progressPercentage: number): Promise<Goal> {
  try {
    const updatedGoal = await sql`
      UPDATE goals 
      SET progress_percentage = ${progressPercentage}, updated_at = NOW()
      WHERE id = ${goalId}
      RETURNING *
    `
    
    if (updatedGoal.length === 0) {
      throw new Error('Goal not found')
    }
    
    return updatedGoal[0] as Goal
  } catch (error) {
    console.error('Error updating goal progress:', error)
    throw error
  }
}

export async function updateGoalProgressCount(goalId: string, currentCount: number): Promise<Goal> {
  try {
    const updatedGoal = await sql`
      UPDATE goals 
      SET progress_current = ${currentCount}, 
          progress_percentage = CASE 
            WHEN progress_target > 0 THEN LEAST((${currentCount}::float / progress_target) * 100, 100)
            ELSE 0
          END,
          updated_at = NOW()
      WHERE id = ${goalId}
      RETURNING *
    `
    
    if (updatedGoal.length === 0) {
      throw new Error('Goal not found')
    }
    
    return updatedGoal[0] as Goal
  } catch (error) {
    console.error('Error updating goal progress count:', error)
    throw error
  }
}

export async function updateGoalProgressAmount(goalId: string, currentAmount: number): Promise<Goal> {
  try {
    const updatedGoal = await sql`
      UPDATE goals 
      SET progress_current = ${currentAmount}, 
          progress_percentage = CASE 
            WHEN progress_target > 0 THEN LEAST((${currentAmount}::float / progress_target) * 100, 100)
            ELSE 0
          END,
          updated_at = NOW()
      WHERE id = ${goalId}
      RETURNING *
    `
    
    if (updatedGoal.length === 0) {
      throw new Error('Goal not found')
    }
    
    return updatedGoal[0] as Goal
  } catch (error) {
    console.error('Error updating goal progress amount:', error)
    throw error
  }
}

export async function updateGoalProgressSteps(goalId: string): Promise<Goal> {
  try {
    // Calculate progress based on completed steps
    const result = await sql`
      WITH step_counts AS (
        SELECT 
          COUNT(*) as total_steps,
          COUNT(CASE WHEN completed = true THEN 1 END) as completed_steps
        FROM daily_steps 
        WHERE goal_id = ${goalId}
      )
      UPDATE goals 
      SET 
        progress_percentage = CASE 
          WHEN (SELECT total_steps FROM step_counts) > 0 THEN
            LEAST((SELECT completed_steps FROM step_counts)::float / (SELECT total_steps FROM step_counts) * 100, 100)
          ELSE 0
        END,
        updated_at = NOW()
      WHERE id = ${goalId}
      RETURNING *
    `
    
    if (result.length === 0) {
      throw new Error('Goal not found')
    }
    
    return result[0] as Goal
  } catch (error) {
    console.error('Error updating goal progress steps:', error)
    throw error
  }
}

// Category Settings functions
export async function getCategorySettings(userId: string): Promise<CategorySettings | null> {
  try {
    const result = await sql`
      SELECT * FROM category_settings 
      WHERE user_id = ${userId}
    `
    return result[0] as CategorySettings || null
  } catch (error) {
    console.error('Error getting category settings:', error)
    return null
  }
}

export async function createCategorySettings(
  userId: string, 
  shortTermDays: number = 90, 
  longTermDays: number = 365
): Promise<CategorySettings> {
  try {
    const id = crypto.randomUUID()
    const result = await sql`
      INSERT INTO category_settings (id, user_id, short_term_days, long_term_days)
      VALUES (${id}, ${userId}, ${shortTermDays}, ${longTermDays})
      RETURNING *
    `
    return result[0] as CategorySettings
  } catch (error) {
    console.error('Error creating category settings:', error)
    throw error
  }
}

export async function updateCategorySettings(
  userId: string, 
  shortTermDays: number, 
  longTermDays: number
): Promise<CategorySettings> {
  try {
    const result = await sql`
      UPDATE category_settings 
      SET short_term_days = ${shortTermDays}, 
          long_term_days = ${longTermDays}, 
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `
    return result[0] as CategorySettings
  } catch (error) {
    console.error('Error updating category settings:', error)
    throw error
  }
}

// Value functions
export async function getUserValues(userId: string): Promise<Value[]> {
  try {
    const result = await sql`
      SELECT * FROM values 
      WHERE user_id = ${userId}
      ORDER BY 
        is_custom ASC,
        level DESC,
        experience DESC,
        name ASC
    `
    return result as Value[]
  } catch (error) {
    console.error('Error getting user values:', error)
    return []
  }
}

export async function createUserValue(
  userId: string,
  name: string,
  description: string,
  color: string,
  icon: string,
  isCustom: boolean = true
): Promise<Value> {
  try {
    const id = crypto.randomUUID()
    const result = await sql`
      INSERT INTO values (id, user_id, name, description, color, icon, is_custom, level, experience)
      VALUES (${id}, ${userId}, ${name}, ${description}, ${color}, ${icon}, ${isCustom}, 1, 0)
      RETURNING *
    `
    return result[0] as Value
  } catch (error) {
    console.error('Error creating user value:', error)
    throw error
  }
}

export async function updateUserValue(
  valueId: string,
  userId: string,
  name: string,
  description: string,
  color: string,
  icon: string
): Promise<Value> {
  try {
    const result = await sql`
      UPDATE values 
      SET 
        name = ${name}, 
        description = ${description},
        color = ${color},
        icon = ${icon},
        updated_at = NOW()
      WHERE id = ${valueId} AND user_id = ${userId}
      RETURNING *
    `
    
    if (result.length === 0) {
      throw new Error('Value not found or access denied')
    }
    
    return result[0] as Value
  } catch (error) {
    console.error('Error updating user value:', error)
    throw error
  }
}

export async function deleteUserValue(valueId: string, userId: string): Promise<void> {
  try {
    const result = await sql`DELETE FROM values WHERE id = ${valueId} AND user_id = ${userId}`
    
    if (result.length === 0) {
      throw new Error('Value not found or access denied')
    }
  } catch (error) {
    console.error('Error deleting user value:', error)
    throw error
  }
}

export async function addExperienceToValue(valueId: string, userId: string, experiencePoints: number): Promise<Value> {
  try {
    const result = await sql`
      UPDATE values 
      SET 
        experience = experience + ${experiencePoints},
        level = CASE 
          WHEN experience + ${experiencePoints} >= 1000 THEN 5
          WHEN experience + ${experiencePoints} >= 750 THEN 4
          WHEN experience + ${experiencePoints} >= 500 THEN 3
          WHEN experience + ${experiencePoints} >= 250 THEN 2
          ELSE 1
        END,
        updated_at = NOW()
      WHERE id = ${valueId} AND user_id = ${userId}
      RETURNING *
    `
    
    if (result.length === 0) {
      throw new Error('Value not found or access denied')
    }
    
    return result[0] as Value
  } catch (error) {
    console.error('Error adding experience to value:', error)
    throw error
  }
}

export async function updateUserOnboardingStatus(userId: string, hasCompletedOnboarding: boolean): Promise<void> {
  try {
    const result = await sql`
      UPDATE users 
      SET 
        has_completed_onboarding = ${hasCompletedOnboarding}, 
        updated_at = NOW()
      WHERE id = ${userId}
    `
    
    if (result.length === 0) {
      throw new Error('User not found')
    }
  } catch (error) {
    console.error('Error updating user onboarding status:', error)
    throw error
  }
}

// Goal Metrics functions
export async function createGoalMetric(metricData: Omit<GoalMetric, 'id' | 'created_at' | 'updated_at'>): Promise<GoalMetric> {
  try {
    const id = crypto.randomUUID()
    const metric = await sql`
      INSERT INTO goal_metrics (
        id, user_id, goal_id, name, description, type, unit, target_value, current_value
      ) VALUES (
        ${id}, ${metricData.user_id}, ${metricData.goal_id}, ${metricData.name}, 
        ${metricData.description || null}, ${metricData.type}, ${metricData.unit}, 
        ${metricData.target_value}, ${metricData.current_value}
      ) RETURNING *
    `
    return metric[0] as GoalMetric
  } catch (error) {
    console.error('Error creating goal metric:', error)
    throw error
  }
}

export async function getGoalMetricsByGoalId(goalId: string): Promise<GoalMetric[]> {
  try {
    const metrics = await sql`
      SELECT * FROM goal_metrics 
      WHERE goal_id = ${goalId}
      ORDER BY created_at ASC
    `
    return metrics as GoalMetric[]
  } catch (error) {
    console.error('Error fetching goal metrics:', error)
    return []
  }
}

export async function updateGoalMetric(metricId: string, updates: Partial<Omit<GoalMetric, 'id' | 'user_id' | 'goal_id' | 'created_at'>>): Promise<GoalMetric> {
  try {
    const metric = await sql`
      UPDATE goal_metrics 
      SET 
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        type = COALESCE(${updates.type}, type),
        unit = COALESCE(${updates.unit}, unit),
        target_value = COALESCE(${updates.target_value}, target_value),
        current_value = COALESCE(${updates.current_value}, current_value),
        updated_at = NOW()
      WHERE id = ${metricId}
      RETURNING *
    `
    return metric[0] as GoalMetric
  } catch (error) {
    console.error('Error updating goal metric:', error)
    throw error
  }
}

export async function deleteGoalMetric(metricId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM goal_metrics 
      WHERE id = ${metricId}
    `
  } catch (error) {
    console.error('Error deleting goal metric:', error)
    throw error
  }
}

export async function updateGoalProgressFromGoalMetrics(goalId: string) {
  try {
    // Calculate progress based on goal metrics
    const result = await sql`
      WITH metric_progress AS (
        SELECT 
          CASE 
            WHEN target_value > 0 AND current_value IS NOT NULL THEN
              LEAST((current_value / target_value) * 100, 100)
            ELSE 0
          END as progress
        FROM goal_metrics
        WHERE goal_id = ${goalId}
      )
      UPDATE goals 
      SET 
        progress_percentage = COALESCE(
          (SELECT ROUND(AVG(progress)) FROM metric_progress), 
          0
        ),
        updated_at = NOW()
      WHERE id = ${goalId}
    `

    console.log(`Updated goal ${goalId} progress using goal metrics`)
    return result
  } catch (error) {
    console.error('Error updating goal progress from goal metrics:', error)
    throw error
  }
}

export async function updateGoalProgressCombined(goalId: string) {
  try {
    // Calculate progress based on new formula: 50% metrics + 50% steps
    const result = await sql`
      WITH metric_progress AS (
        SELECT 
          CASE 
            WHEN target_value > 0 AND current_value IS NOT NULL THEN
              LEAST((current_value / target_value) * 100, 100)
            ELSE 0
          END as progress
        FROM goal_metrics
        WHERE goal_id = ${goalId}
      ),
      step_progress AS (
        SELECT 
          CASE 
            WHEN COUNT(*) > 0 THEN
              LEAST((COUNT(CASE WHEN completed = true THEN 1 END)::float / COUNT(*)) * 100, 100)
            ELSE 0
          END as progress
        FROM daily_steps 
        WHERE goal_id = ${goalId}
      ),
      combined_progress AS (
        SELECT 
          CASE 
            WHEN (SELECT COUNT(*) FROM goal_metrics WHERE goal_id = ${goalId}) > 0 
                 AND (SELECT COUNT(*) FROM daily_steps WHERE goal_id = ${goalId}) > 0 THEN
              -- Both metrics and steps exist: 50% metrics + 50% steps
              ((SELECT AVG(progress) FROM metric_progress) * 0.5) + 
              ((SELECT progress FROM step_progress) * 0.5)
            WHEN (SELECT COUNT(*) FROM goal_metrics WHERE goal_id = ${goalId}) > 0 THEN
              -- Only metrics exist: 100% metrics
              (SELECT AVG(progress) FROM metric_progress)
            WHEN (SELECT COUNT(*) FROM daily_steps WHERE goal_id = ${goalId}) > 0 THEN
              -- Only steps exist: 100% steps
              (SELECT progress FROM step_progress)
            ELSE 0
          END as final_progress
      )
      UPDATE goals 
      SET 
        progress_percentage = COALESCE(
          (SELECT ROUND(final_progress) FROM combined_progress), 
          0
        ),
        updated_at = NOW()
      WHERE id = ${goalId}
    `

    console.log(`Updated goal ${goalId} progress using combined formula (50% metrics + 50% steps)`)
    return result
  } catch (error) {
    console.error('Error updating goal progress with combined formula:', error)
    throw error
  }
}

// Event functions
export async function getEventsByUserId(userId: string): Promise<Event[]> {
  try {
    const events = await sql`
      SELECT * FROM events 
      WHERE user_id = ${userId}
      ORDER BY 
        CASE WHEN completed THEN 1 ELSE 0 END,
        date ASC,
        is_important DESC,
        is_urgent DESC,
        created_at DESC
    `
    return events as Event[]
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function createEvent(eventData: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
  try {
    const id = crypto.randomUUID()
    const event = await sql`
      INSERT INTO events (
        id, user_id, goal_id, automation_id, title, description, 
        completed, date, is_important, is_urgent, event_type,
        target_metric_id, target_step_id, update_value, update_unit
      ) VALUES (
        ${id}, ${eventData.user_id}, ${eventData.goal_id}, ${eventData.automation_id},
        ${eventData.title}, ${eventData.description || null}, ${eventData.completed},
        ${eventData.date}, ${eventData.is_important}, ${eventData.is_urgent},
        ${eventData.event_type}, ${eventData.target_metric_id || null},
        ${eventData.target_step_id || null}, ${eventData.update_value || null},
        ${eventData.update_unit || null}
      ) RETURNING *
    `
    return event[0] as Event
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

export async function updateEvent(eventId: string, userId: string, eventData: Partial<Event>): Promise<Event> {
  try {
    const updateFields = []
    const values = []
    
    if (eventData.title !== undefined) {
      updateFields.push('title = $' + (values.length + 1))
      values.push(eventData.title)
    }
    if (eventData.description !== undefined) {
      updateFields.push('description = $' + (values.length + 1))
      values.push(eventData.description)
    }
    if (eventData.completed !== undefined) {
      updateFields.push('completed = $' + (values.length + 1))
      values.push(eventData.completed)
    }
    if (eventData.completed_at !== undefined) {
      updateFields.push('completed_at = $' + (values.length + 1))
      values.push(eventData.completed_at)
    }
    if (eventData.date !== undefined) {
      updateFields.push('date = $' + (values.length + 1))
      values.push(eventData.date)
    }
    if (eventData.is_important !== undefined) {
      updateFields.push('is_important = $' + (values.length + 1))
      values.push(eventData.is_important)
    }
    if (eventData.is_urgent !== undefined) {
      updateFields.push('is_urgent = $' + (values.length + 1))
      values.push(eventData.is_urgent)
    }
    if (eventData.update_value !== undefined) {
      updateFields.push('update_value = $' + (values.length + 1))
      values.push(eventData.update_value)
    }
    if (eventData.update_unit !== undefined) {
      updateFields.push('update_unit = $' + (values.length + 1))
      values.push(eventData.update_unit)
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }
    
    const query = `
      UPDATE events 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
      RETURNING *
    `
    
    values.push(eventId, userId)
    
    const updatedEvent = await sql.unsafe(query) as unknown as any[]
    
    if (updatedEvent.length === 0) {
      throw new Error('Event not found or access denied')
    }
    
    return updatedEvent[0] as Event
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM events 
      WHERE id = ${eventId} AND user_id = ${userId}
    `
    
    if (result.length === 0) {
      throw new Error('Event not found or access denied')
    }
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

// EventInteraction functions
export async function getEventInteractionsByUserId(userId: string): Promise<EventInteraction[]> {
  try {
    const interactions = await sql`
      SELECT * FROM event_interactions 
      WHERE user_id = ${userId}
      ORDER BY date DESC, created_at DESC
    `
    return interactions as EventInteraction[]
  } catch (error) {
    console.error('Error fetching event interactions:', error)
    return []
  }
}

export async function getEventInteractionsByDate(userId: string, date: Date): Promise<EventInteraction[]> {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const interactions = await sql`
      SELECT * FROM event_interactions 
      WHERE user_id = ${userId} AND date = ${dateStr}
      ORDER BY created_at DESC
    `
    return interactions as EventInteraction[]
  } catch (error) {
    console.error('Error fetching event interactions by date:', error)
    return []
  }
}

export async function createEventInteraction(interactionData: Omit<EventInteraction, 'id' | 'created_at' | 'updated_at'>): Promise<EventInteraction> {
  try {
    const id = crypto.randomUUID()
    const interaction = await sql`
      INSERT INTO event_interactions (
        id, user_id, automation_id, date, status, 
        postponed_to, completed_at
      ) VALUES (
        ${id}, ${interactionData.user_id}, ${interactionData.automation_id},
        ${interactionData.date}, ${interactionData.status},
        ${interactionData.postponed_to || null}, ${interactionData.completed_at || null}
      ) RETURNING *
    `
    return interaction[0] as EventInteraction
  } catch (error) {
    console.error('Error creating event interaction:', error)
    throw error
  }
}

export async function updateEventInteraction(interactionId: string, userId: string, interactionData: Partial<EventInteraction>): Promise<EventInteraction> {
  try {
    // Build dynamic update query using template literals
    let updateFields = ['updated_at = NOW()']
    
    if (interactionData.status !== undefined) {
      updateFields.push(`status = '${interactionData.status}'`)
    }
    if (interactionData.postponed_to !== undefined) {
      updateFields.push(`postponed_to = '${interactionData.postponed_to.toISOString().split('T')[0]}'`)
    }
    if (interactionData.completed_at !== undefined) {
      updateFields.push(`completed_at = '${interactionData.completed_at.toISOString()}'`)
    }
    
    if (updateFields.length === 1) {
      throw new Error('No fields to update')
    }
    
    const updateClause = updateFields.join(', ')
    
    const updatedInteraction = await sql`
      UPDATE event_interactions 
      SET ${sql.unsafe(updateClause)}
      WHERE id = ${interactionId} AND user_id = ${userId}
      RETURNING *
    `
    
    if (updatedInteraction.length === 0) {
      throw new Error('Event interaction not found or access denied')
    }
    
    return updatedInteraction[0] as EventInteraction
  } catch (error) {
    console.error('Error updating event interaction:', error)
    throw error
  }
}

export async function deleteEventInteraction(interactionId: string, userId: string): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM event_interactions 
      WHERE id = ${interactionId} AND user_id = ${userId}
    `
    
    if (result.length === 0) {
      throw new Error('Event interaction not found or access denied')
    }
  } catch (error) {
    console.error('Error deleting event interaction:', error)
    throw error
  }
}

export async function getActiveAutomations(userId: string): Promise<Automation[]> {
  try {
    const automations = await sql`
      SELECT * FROM automations 
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
    `
    return automations as Automation[]
  } catch (error) {
    console.error('Error fetching active automations:', error)
    return []
  }
}

export async function generateAutomatedSteps(userId: string): Promise<void> {
  try {
    console.log(`Generating automated steps for user ${userId}`)
    
    // Get active automations for the user
    const automations = await getActiveAutomations(userId)
    
    for (const automation of automations) {
      try {
        // Only process recurring automations
        if (automation.frequency_type !== 'recurring' || !automation.frequency_time) {
          continue
        }
        
        // Calculate next scheduled date based on frequency
        const nextDate = await calculateNextCustomStepDate(automation.frequency_time)
        
        // Get the goal for this automation
        const goal = await sql`
          SELECT id FROM goals WHERE id = ${automation.target_id}
        `
        
        if (goal.length === 0) {
          console.log(`Goal not found for automation ${automation.id}`)
          continue
        }
        
        // Check if a step already exists for this automation and date
        const existingStep = await sql`
          SELECT id FROM daily_steps 
          WHERE goal_id = ${automation.target_id}
          AND title = ${automation.name}
          AND date = ${nextDate.toISOString().split('T')[0]}
        `
        
        if (existingStep.length === 0) {
          // Create new automated step
          await createDailyStep({
            user_id: userId,
            goal_id: automation.target_id,
            title: automation.name,
            description: automation.description || '',
            date: nextDate,
            completed: false
          })
          
          console.log(`Created automated step: ${automation.name} for ${nextDate.toISOString().split('T')[0]}`)
        }
      } catch (error) {
        console.error(`Error generating step for automation ${automation.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Error generating automated steps:', error)
    throw error
  }
}

// Notes functions
export async function createNote(noteData: Partial<Note>): Promise<Note> {
  const note = await sql`
    INSERT INTO notes (
      user_id, goal_id, title, content
    ) VALUES (
      ${noteData.user_id}, ${noteData.goal_id || null}, 
      ${noteData.title}, ${noteData.content}
    ) RETURNING *
  `
  return note[0] as Note
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const notes = await sql`
    SELECT * FROM notes 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return notes as Note[]
}

export async function getNotesByGoal(goalId: string): Promise<Note[]> {
  const notes = await sql`
    SELECT * FROM notes 
    WHERE goal_id = ${goalId}
    ORDER BY created_at DESC
  `
  return notes as Note[]
}

export async function getStandaloneNotes(userId: string): Promise<Note[]> {
  const notes = await sql`
    SELECT * FROM notes 
    WHERE user_id = ${userId} AND goal_id IS NULL
    ORDER BY created_at DESC
  `
  return notes as Note[]
}

export async function updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
  const note = await sql`
    UPDATE notes 
    SET title = ${updates.title}, content = ${updates.content}, updated_at = NOW()
    WHERE id = ${noteId}
    RETURNING *
  `
  return note[0] as Note
}

export async function deleteNote(noteId: string): Promise<void> {
  await sql`
    DELETE FROM notes WHERE id = ${noteId}
  `
}