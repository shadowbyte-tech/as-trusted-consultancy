
import { Header } from '@/components/header';
import RegistrationForm from '@/components/registration-form';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <>
      <Header />
      <div className="container flex-1 py-12">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Unlock Exclusive Property Access</h1>
            <p className="text-muted-foreground mt-2">
              Join our priority list. Provide your details below, and our team will contact you with premier plot opportunities.
            </p>
          </div>
          <RegistrationForm />
        </div>
      </div>
    </>
  );
}
