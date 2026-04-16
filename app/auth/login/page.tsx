import { LoginForm } from '@/components/auth/login-form'
import { Navigation } from '@/components/navigation'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mx-auto max-w-md">
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
