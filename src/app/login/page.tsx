import LoginForm from '@/components/login-form';
import { Header } from '@/components/header';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <>
    <Header />
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground font-headline">
            Owner Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to access your dashboard.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
    </>
  );
}
