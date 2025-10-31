import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function MojePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('https://accounts.pokrok.app/sign-in')
  }

  // Redirect to dashboard
  redirect('/muj/dashboard')
}
