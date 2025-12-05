'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export function InviteButton() {
  const { themeVersion } = useTheme(); // Force re-render on theme change
  
  return (
    <Button variant="outline" size="sm" asChild key={themeVersion}>
      <Link href="/invite">
        <UserPlus className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Convidar</span>
      </Link>
    </Button>
  );
}