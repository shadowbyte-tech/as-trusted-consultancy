
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
        {/* Left Side - Informational Content with Video Background */}
        <div className="relative hidden md:flex flex-col items-center justify-center bg-zinc-900 text-white p-12 overflow-hidden">
           {/* Video Background */}
           <div className="absolute inset-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute w-full h-full object-cover opacity-100"
                >
                  <source src="/videos/user-login-background.mp4.mp4" type="video/mp4" />
                </video>
                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/60 via-zinc-900/50 to-zinc-900/60"></div>
           </div>
           
           {/* Floating Shapes */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float"></div>
             <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed"></div>
             <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
           </div>

           <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                <h2 className="text-4xl font-bold tracking-tight text-white font-headline mb-4">
                    Unlock Your Access to Premium Properties
                </h2>
                <p className="text-zinc-300 mb-8">
                    Sign in to your account to explore our curated list of properties and take advantage of our exclusive AI-powered real estate tools.
                </p>
                <ul className="space-y-4">
                    {features.map((feature, index) => (
                        <li 
                          key={index} 
                          className="flex items-start animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
           </div>
        </div>
        
        {/* Right Side - Login Form with Animated Background */}
        <div className="relative flex items-center justify-center bg-background p-8 overflow-hidden">
          {/* Animated Background for Right Side */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse-slow"></div>
          </div>

          <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in-up animation-delay-200">
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
