import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('https://accounts.pokrok.app/sign-in')
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}

