import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Pokrok</h1>
        <p className="text-gray-600">Zaregistrujte se a začněte dosahovat svých cílů</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 text-sm normal-case',
            card: 'shadow-xl border-0',
            headerTitle: 'text-text-primary',
            headerSubtitle: 'text-gray-600',
          }
        }}
        redirectUrl="/muj"
      />
    </div>
  )
}
