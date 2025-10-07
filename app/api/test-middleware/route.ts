import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Middleware test successful',
      timestamp: new Date().toISOString(),
      url: request.url
    })
  } catch (error) {
    console.error('Middleware test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
