import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all admin routes except login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const authResponse = requireAuth(request)
    if (authResponse) {
      return authResponse
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
