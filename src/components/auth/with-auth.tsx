'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAuthComponent = (props: P) => {
    const [user, setUser] = useState<string | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true); 
    const router = useRouter();

    useEffect(() => {
      // In a real app, you'd use a hook like `useUser` from Firebase.
      // For now, we simulate checking localStorage.
      const userId = localStorage.getItem('DREAMVAULT_USER_ID');
      setUser(userId);
      setIsUserLoading(false);
      
      if (!userId) {
        router.push('/login');
      }
    }, [router]);

    // This would show a loader in a real auth flow.
    if (isUserLoading) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }
    
    if (!user) {
        // This case handles the moment after loading is false but before the redirect effect runs.
        return null;
    }

    // If user is "logged in", render the component.
    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return WithAuthComponent;
}
