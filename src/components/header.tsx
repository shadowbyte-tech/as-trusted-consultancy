
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Home, LogOut, PanelLeft, User, UserCog, FileUp, Users, Settings, UserPlus, MessageSquare, Landmark, UserCheck } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { ASLogo } from './as-logo';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';


const dashboardNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/upload', label: 'Upload Plot', icon: FileUp },
  { href: '/dashboard/registrations', label: 'Registrations', icon: UserCheck },
  { href: '/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Landmark },
  { href: '/dashboard/users', label: 'Manage Logins', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];


export function Header() {
  const { role, logout, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const LogoAndBrand = () => (
    <Link href="/" className="flex items-center space-x-2">
      <ASLogo className="h-8 w-8" />
      <span className="font-semibold sm:inline-block font-headline">
        AS TRUSTED CONSULTANCY
      </span>
    </Link>
  );
  
  const MobileNav = () => {
    // Show only on dashboard pages for logged in owners
    if (role !== 'Owner' || !pathname.startsWith('/dashboard')) return null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="md:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                 <SheetHeader className="border-b pb-4 mb-4 text-left">
                    <SheetTitle>Navigation Menu</SheetTitle>
                 </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium">
                      <Link href="/" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                        <ASLogo className="h-6 w-6 transition-all group-hover:scale-110" />
                        <span className="sr-only">AS Trusted Consultancy</span>
                    </Link>
                    {dashboardNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                            'flex items-center gap-4 px-2.5',
                            pathname === item.href
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )
  };

  const AuthButtons = () => {
    if (!isAuthReady) return <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
    
    if (role) {
      return (
        <div className="flex items-center gap-2">
            {role === 'Owner' && (
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/dashboard">
                    <UserCog className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
            )}
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
        </div>
      )
    }

    return (
       <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
                <Link href="/register">
                <UserPlus className="mr-2 h-4 w-4" />
                New User
                </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
                <Link href="/user-login">
                <User className="mr-2 h-4 w-4" />
                User Login
                </Link>
            </Button>
            <Button asChild size="sm" variant="default">
                <Link href="/login">
                <UserCog className="mr-2 h-4 w-4" />
                Owner Login
                </Link>
            </Button>
      </div>
    )
  }

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center">
            {isDashboard ? <MobileNav /> : null}
            <div className={cn(isDashboard && 'md:mr-4')}>
              <LogoAndBrand />
            </div>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <AuthButtons />
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
