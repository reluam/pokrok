const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function resetDatabase() {
  try {
    console.log('Resetting Cesta database...')

    // Drop all tables in correct order (respecting foreign key constraints)
    const tables = [
      'user_streak',
      'daily_planning', 
      'user_settings',
      'needed_steps_settings',
      'category_settings',
      'events',
      'automations',
      'goal_metrics',
      'metrics',
      'daily_steps',
      'goals',
      'values',
      'users'
    ]

    for (const table of tables) {
      try {
        await sql.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
        console.log(`Dropped table: ${table}`)
      } catch (error) {
        console.log(`Table ${table} may not exist:`, error.message)
      }
    }

    console.log('Database reset completed!')
  } catch (error) {
    console.error('Error resetting database:', error)
    process.exit(1)
  }
}

resetDatabase()
