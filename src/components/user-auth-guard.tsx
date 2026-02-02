'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

export default function UserAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to view this page.',
        variant: 'destructive',
      });
      router.replace('/user-login');
    }
  }, [user, isLoading, router, toast]);

  if (isLoading || !user) {
    // Return a loading state until authentication status is confirmed
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <div className="space-y-4 p-8 w-full max-w-md">
                <p className="text-center text-muted-foreground">Authenticating...</p>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
