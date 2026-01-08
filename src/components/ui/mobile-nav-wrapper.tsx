'use client';

import { ReactNode } from 'react';

interface MobileNavWrapperProps {
  children: ReactNode;
}

export function MobileNavWrapper({ children }: MobileNavWrapperProps) {
  return (
    <div className="sm:pb-0 pb-28">
      {children}
    </div>
  );
}