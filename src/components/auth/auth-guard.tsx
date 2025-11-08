'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Pages that don't require authentication
const PUBLIC_PATHS = ['/signin', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the initial user loading is complete
    if (isUserLoading) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    
    // If there is no user and the path is not public, redirect to signin
    if (!user && !isPublicPath) {
      router.replace('/signin');
    }
    
    // If there is a user and the path is a public auth page, redirect to home
    if (user && isPublicPath) {
        router.replace('/home');
    }

  }, [user, isUserLoading, router, pathname]);
  
  // While loading, or if redirecting, you can show a loader or nothing.
  // This prevents a flash of the protected content.
  if (isUserLoading || (!user && !PUBLIC_PATHS.includes(pathname))) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
  }

  // If user is logged in, or the path is public and there's no user, show the children
  return <>{children}</>;
}
