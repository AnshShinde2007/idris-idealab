import { SignupForm } from '@/components/auth/signup-form'
import { Navigation } from '@/components/navigation'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mx-auto max-w-md">
          <SignupForm />
        </div>
      </main>
    </div>
  )
}
