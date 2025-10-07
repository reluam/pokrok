import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Moje Cesta</h1>
          <p className="text-gray-600">Přihlaste se a začněte svou cestu k osobnímu rozvoji</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 text-sm normal-case',
            }
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  )
}
