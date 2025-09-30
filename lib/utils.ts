export function getBaseUrl(): string {
  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // Fallback for production when NEXT_PUBLIC_SITE_URL is not set
  // This should not happen in production, but provides a fallback
  return 'https://smysluplneziti.vercel.app'
}
