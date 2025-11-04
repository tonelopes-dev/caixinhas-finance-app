'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAuthComponent = (props: P) => {
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter();

    useEffect(() => {
      // In a real app, this would be a more robust check (e.g., verifying a token).
      // For this mock app, we check for the presence of the user ID cookie.
      const userId = localStorage.getItem('DREAMVAULT_USER_ID');
      
      if (!userId) {
        router.push('/login');
      } else {
        setIsVerified(true);
      }
    }, [router]);

    if (!isVerified) {
      // While verification is in progress, show a loader.
      // This prevents a flash of unstyled or protected content.
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }
    
    // If user is verified, render the component.
    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return WithAuthComponent;
}
