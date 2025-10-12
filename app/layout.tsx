import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { PageProvider } from '../components/PageContext'
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
  return (
    <ClerkProvider>
      <html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Asul:wght@400&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.variable} antialiased`}>
          <PageProvider>
            {children}
          </PageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
