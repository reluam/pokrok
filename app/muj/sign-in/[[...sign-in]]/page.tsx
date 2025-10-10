'use client'

import { SignIn } from '@clerk/nextjs'
import { useTranslations } from '@/lib/use-translations'

export default function SignInPage() {
  const { translations, loading } = useTranslations()

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          {translations?.app.signInTitle || 'Pokrok'}
        </h1>
        <p className="text-gray-600">
          {translations?.app.signInSubtitle || 'Přihlaste se a začněte dosahovat svých cílů'}
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 text-sm normal-case',
            card: 'shadow-xl border-0',
            headerTitle: 'text-text-primary',
            headerSubtitle: 'text-gray-600',
            identityPreviewText: 'text-gray-600',
            formFieldLabel: 'text-gray-700',
            formFieldInput: 'border-gray-300 focus:border-primary-500',
          }
        }}
        redirectUrl="/muj"
      />
    </div>
  )
}
