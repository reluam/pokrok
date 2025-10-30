import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserByClerkId } from '@/lib/cesta-db'

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('https://accounts.pokrok.app/sign-in')
  }

  // Check if user has completed onboarding
  let hasCompletedOnboarding = false
  try {
    const user = await getUserByClerkId(userId)
    hasCompletedOnboarding = user?.has_completed_onboarding || false
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    hasCompletedOnboarding = false
  }

  if (!hasCompletedOnboarding) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}

