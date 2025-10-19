const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function testDailyReset() {
  try {
    console.log('Testing daily reset functionality...')
    
    // Get all users with daily_planning workflow
    const users = await sql`
      SELECT u.id, u.clerk_id, us.daily_reset_hour
      FROM users u
      JOIN user_settings us ON u.id = us.user_id
      WHERE us.workflow = 'daily_planning'
    `
    
    console.log(`Found ${users.length} users with daily planning workflow`)
    
    for (const user of users) {
      console.log(`\nProcessing user ${user.id} (reset hour: ${user.daily_reset_hour})`)
      
      // Check if it's time to reset for this user
      const now = new Date()
      const currentHour = now.getHours()
      
      if (currentHour === user.daily_reset_hour) {
        console.log(`✅ Time to reset for user ${user.id}`)
        
        // Call the reset API
        try {
          const response = await fetch('http://localhost:3000/api/cesta/daily-reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Note: In production, you'd need proper authentication
            }
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log(`✅ Reset successful:`, result.statistics)
          } else {
            console.log(`❌ Reset failed:`, await response.text())
          }
        } catch (error) {
          console.log(`❌ Error calling reset API:`, error.message)
        }
      } else {
        console.log(`⏰ Not time to reset yet (current: ${currentHour}, reset: ${user.daily_reset_hour})`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing daily reset:', error)
  }
}

testDailyReset()
