import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SettingsPage } from '@/components/SettingsPage'

export default async function NastaveniPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('https://accounts.pokrok.app/sign-in')
  }

  return <SettingsPage />
}
