import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/muj(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // Handle subdomain routing
  const hostname = request.headers.get('host') || ''
  
  // If accessing muj.pokrok.app, redirect to /muj
  if (hostname === 'muj.pokrok.app' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/muj', request.url))
  }
  
  // Protect routes
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}