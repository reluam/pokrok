import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/muj(.*)', '/(cs|en)/muj(.*)', '/api/cesta(.*)'])
const isPublicRoute = createRouteMatcher(['/muj/sign-in(.*)', '/muj/sign-up(.*)', '/(cs|en)/muj/sign-in(.*)', '/(cs|en)/muj/sign-up(.*)'])

// Supported locales
const locales = ['cs', 'en']
const defaultLocale = 'cs'

export default clerkMiddleware(async (auth, request) => {
  // Handle subdomain routing
  const hostname = request.headers.get('host') || ''
  
  // Development environment detection
  const isDevelopment = process.env.NODE_ENV === 'development' || hostname.includes('localhost')
  
  // Debug logging for all requests
  console.log('🔄 Middleware: Processing request:', request.method, request.nextUrl.pathname, 'from', request.url)
  
  // If accessing muj.pokrok.app, redirect to /muj
  if (hostname === 'muj.pokrok.app' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/muj', request.url))
  }
  
  const pathname = request.nextUrl.pathname
  
  // Handle API routes - remove locale prefix if present
  if (pathname.startsWith('/api/') || pathname.match(/^\/(cs|en)\/api\//)) {
    console.log('🔄 Middleware: API route detected:', pathname)
    // If API route has locale prefix, redirect to remove it
    if (pathname.match(/^\/(cs|en)\/api\//)) {
      const apiPath = pathname.replace(/^\/(cs|en)\//, '/')
      console.log('🔄 Middleware: Redirecting API route from', pathname, 'to', apiPath)
      console.log('🔄 Middleware: Redirect URL:', new URL(apiPath, request.url).href)
      return NextResponse.redirect(new URL(apiPath, request.url))
    }
    
    // Set pathname header for layout detection
    console.log('🔄 Middleware: Processing API route:', pathname)
    
    // Skip auth for public routes (sign-in, sign-up)
    if (isPublicRoute(request)) {
      console.log('🔄 Middleware: Public API route, continuing...')
      return NextResponse.next()
    }
    
    // Protect routes
    if (isProtectedRoute(request)) {
      console.log('🔄 Middleware: Protecting route:', pathname)
      const authResult = await auth.protect()
      console.log('🔄 Middleware: Auth result:', authResult)
    }
    
    console.log('🔄 Middleware: API route processed, continuing to handler...', {
      method: request.method,
      pathname,
      url: request.url
    })
    return NextResponse.next()
  }
  
  // Handle internationalization for non-API routes
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Always use Czech as default locale
    const preferredLocale = defaultLocale
    
    // Redirect to the same path with locale
    const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url)
    console.log('🔄 Middleware: Redirecting to locale:', newUrl.href)
    return NextResponse.redirect(newUrl)
  }

  // Extract locale from pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    // Set locale header for the application
    const locale = pathname.split('/')[1]
    const response = NextResponse.next()
    response.headers.set('x-locale', locale)
    return response
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
    console.log('🔄 Middleware: Protecting non-API route:', pathname)
    const authResult = await auth.protect()
    console.log('🔄 Middleware: Non-API auth result:', authResult)
  }
  
  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Include locale routes
    '/(cs|en)/:path*',
  ],
}