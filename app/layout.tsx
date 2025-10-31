import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { PageProvider } from '../components/PageContext'
import { ThemeProvider } from '../components/ThemeProvider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Pokrok - Aplikace pro osobní rozvoj a smysluplné žití',
  description: 'Objevte Pokrok - aplikaci, která vám pomůže najít smysl života, stanovit cíle a dosáhnout osobního růstu. Začněte svou cestu k lepšímu životu.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get base URL for Clerk configuration
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://pokrok.vercel.app')
  
  // In development, use local routes with locale
  // In production, use environment variables or defaults
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const signInUrl = isDevelopment 
    ? `${baseUrl}/cs/muj/sign-in`
    : (process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'https://accounts.pokrok.app/sign-in')
    
  const signUpUrl = isDevelopment
    ? `${baseUrl}/cs/muj/sign-up`
    : (process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'https://accounts.pokrok.app/sign-up')
  
  const afterSignInUrl = isDevelopment
    ? `${baseUrl}/cs/muj`
    : (process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL || 'https://muj.pokrok.app')
    
  const afterSignOutUrl = isDevelopment
    ? `${baseUrl}/cs/muj/sign-in`
    : (process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || 'https://muj.pokrok.app/sign-in')
  
  return (
    <ClerkProvider
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      afterSignInUrl={afterSignInUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      <html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Asul:wght@400&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.variable} antialiased`}>
          <ThemeProvider>
            <PageProvider>
              {children}
            </PageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
