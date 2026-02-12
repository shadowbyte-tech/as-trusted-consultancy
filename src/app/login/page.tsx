import { Header } from '@/components/header';
import LoginForm from '@/components/login-form';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background p-4 py-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
