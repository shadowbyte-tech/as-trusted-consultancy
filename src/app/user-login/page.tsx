
import UserLoginForm from '@/components/user-login-form';
import { Header } from '@/components/header';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const features = [
    "Access exclusive plot details and pricing.",
    "Get free AI-powered Vastu analysis for any plot.",
    "Visualize future development potential with AI.",
    "Save your favorite properties for later viewing."
];

export default function UserLoginPage() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2">
        {/* Left Side - Informational Content */}
        <div className="relative hidden md:flex flex-col items-center justify-center bg-zinc-900 text-white p-12">
           <div className="absolute inset-0">
                <Image 
                    src="https://media.itsfoss.com/wp-content/uploads/2023/11/AS-Trusted-Land-Consultancy.png"
                    alt="Modern architecture"
                    fill
                    className="object-cover opacity-20"
                    data-ai-hint="modern house"
                />
           </div>
           <div className="relative z-10 w-full max-w-md">
                <h2 className="text-4xl font-bold tracking-tight text-white font-headline mb-4">
                    Unlock Your Access to Premium Properties
                </h2>
                <p className="text-zinc-300 mb-8">
                    Sign in to your account to explore our curated list of properties and take advantage of our exclusive AI-powered real estate tools.
                </p>
                <ul className="space-y-4">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
           </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center bg-background p-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground font-headline">
                User Sign In
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Enter your credentials to view available plots and details.
              </p>
            </div>
            <UserLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
