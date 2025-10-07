import { Inter } from 'next/font/google'
import { DynamicCestaLayout } from '@/components/DynamicCestaLayout'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'Moje Cesta - Sleduj svůj osobní rozvoj',
  description: 'Aplikace pro sledování osobního rozvoje s metaforou cesty. Najdi svůj směr a sleduj svůj pokrok.',
}

export default function MojeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} antialiased bg-background min-h-screen`}>
      <DynamicCestaLayout>
        {children}
      </DynamicCestaLayout>
    </div>
  )
}
