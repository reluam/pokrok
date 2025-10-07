import { NextRequest, NextResponse } from 'next/server'
import { generateAutomatedSteps, getAllUsers } from '@/lib/cesta-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check for authorization (optional - you can add API key validation)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get all users and generate steps for each
    const users = await getAllUsers()
    let totalGenerated = 0
    
    for (const user of users) {
      try {
        await generateAutomatedSteps(user.id)
        totalGenerated++
      } catch (error) {
        console.error(`Error generating steps for user ${user.id}:`, error)
      }
    }
    
    console.log(`Cron job completed: Generated steps for ${totalGenerated} users`)
    
    return NextResponse.json({
      success: true,
      message: `Generated steps for ${totalGenerated} users`,
      generatedCount: totalGenerated,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      generatedCount: 0,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
