import { notFound } from 'next/navigation'

const locales = ['cs', 'en']

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  return <>{children}</>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
