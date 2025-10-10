import { Inter } from 'next/font/google'
import { PageProvider } from '@/components/PageContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'Onboarding - Pokrok',
  description: 'Vítejte v aplikaci Pokrok! Začněte svou cestu k dosažení cílů.',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} antialiased bg-gray-50 min-h-screen`}>
      <PageProvider>
        <div className="w-full px-4 py-8">
          {children}
        </div>
      </PageProvider>
    </div>
  )
}
