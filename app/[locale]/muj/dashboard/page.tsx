import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { MainDashboard } from '@/components/MainDashboard'

export default async function MojePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('https://accounts.pokrok.app/sign-in')
  }

  return <MainDashboard />
}
