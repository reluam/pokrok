import { redirect } from 'next/navigation'

export default function LocalePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // Redirect to the main page with locale
  redirect(`/${locale}/muj`)
}
