import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, redirectUrl } = body

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    console.log('🌐 Clerk iOS Google OAuth attempt:', provider)

    // For iOS, we need to redirect to Clerk's OAuth URL
    // This will open the OAuth flow in Safari/WebView
    const clerkOAuthUrl = `https://ideal-koi-18.accounts.dev/oauth/google?redirect_url=${encodeURIComponent(redirectUrl || 'http://localhost:3001/muj')}`

    return NextResponse.json({
      success: true,
      oauthUrl: clerkOAuthUrl,
      message: 'Redirect to OAuth URL'
    })

  } catch (error) {
    console.error('Error in Clerk iOS Google OAuth:', error)
    return NextResponse.json(
      { 
        error: 'Google OAuth failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
