import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smysluplné žití - Najdi smysl v nesmyslném světě',
  description: 'Odemkni svůj účel a najdi smysl. Koučing služby pro osobní rozvoj a nalezení životního smyslu.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className="antialiased bg-background">
        {children}
      </body>
    </html>
  )
}
