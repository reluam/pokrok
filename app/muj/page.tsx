import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { InitialOnboarding } from '@/components/InitialOnboarding'
import { MainDashboard } from '@/components/MainDashboard'
import { getUserByClerkId } from '@/lib/cesta-db'

export default async function MojePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/muj/sign-in')
  }

  // Check if user has completed onboarding
  let hasCompletedOnboarding = false
  try {
    const user = await getUserByClerkId(userId)
    hasCompletedOnboarding = user?.has_completed_onboarding || false
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    // If we can't check, assume onboarding is needed
    hasCompletedOnboarding = false
  }

  if (!hasCompletedOnboarding) {
    return <InitialOnboarding />
  }

  return <MainDashboard />
}
