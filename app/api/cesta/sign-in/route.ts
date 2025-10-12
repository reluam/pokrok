import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // For now, we'll create a mock authentication
    // In production, you would use Clerk's authentication methods
    console.log('📧 Clerk iOS sign in attempt:', email)

    // Mock successful authentication
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email,
      firstName: 'Test',
      lastName: 'User'
    }

    const mockToken = 'mock_token_' + Date.now()

    return NextResponse.json({
      success: true,
      token: mockToken,
      user: mockUser
    })

  } catch (error) {
    console.error('Error in Clerk iOS authentication:', error)
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
