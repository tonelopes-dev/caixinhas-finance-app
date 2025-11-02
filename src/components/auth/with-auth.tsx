'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Mock user for development
const mockUser = { uid: 'dev-user' };

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAuthComponent = (props: P) => {
    // In a real scenario, you'd use a hook like `useUser` from Firebase.
    // For now, we simulate a logged-in user.
    const user = mockUser;
    const isUserLoading = false; 
    const router = useRouter();

    useEffect(() => {
      // This check would be important in a real auth flow.
      // For now, it's safe since we have a mock user.
      if (!isUserLoading && !user) {
        router.push('/login');
      }
    }, [user, isUserLoading, router]);

    // This would show a loader in a real auth flow.
    if (isUserLoading) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    // If user is "logged in" (mocked), render the component.
    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return WithAuthComponent;
}
