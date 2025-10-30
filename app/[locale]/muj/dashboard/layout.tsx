import { Inter } from 'next/font/google'
import { DynamicCestaLayout } from '@/components/DynamicCestaLayout'
import { PageProvider } from '@/components/PageContext'
import { headers } from 'next/headers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'Pokrok - Dosáhněte svých cílů',
  description: 'Aplikace pro dosažení cílů a získání jasnosti v životě. Definujte si cíle, rozložte je na kroky a sledujte svůj pokrok.',
}

export default function MojeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Check if this is an auth page
  const isAuthPage = pathname.includes('/sign-in') || pathname.includes('/sign-up')
  
  if (isAuthPage) {
    return (
      <div className={`${inter.variable} antialiased bg-gray-50 min-h-screen flex items-center justify-center`}>
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`${inter.variable} antialiased bg-background min-h-screen`}>
      <DynamicCestaLayout>
        {children}
      </DynamicCestaLayout>
    </div>
  )
}
