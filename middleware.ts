import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/muj(.*)'])
const isPublicRoute = createRouteMatcher(['/muj/sign-in(.*)', '/muj/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // Handle subdomain routing
  const hostname = request.headers.get('host') || ''
  
  // Development environment detection
  const isDevelopment = process.env.NODE_ENV === 'development' || hostname.includes('localhost')
  
  // If accessing muj.pokrok.app, redirect to /muj
  if (hostname === 'muj.pokrok.app' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/muj', request.url))
  }
  
  // Set pathname header for layout detection
  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname)
  
  // Skip auth for public routes (sign-in, sign-up)
  if (isPublicRoute(request)) {
    return response
  }
  
  // Protect routes
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
  
  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}