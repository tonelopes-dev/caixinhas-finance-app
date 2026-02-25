"use client";

import { ReactNode } from "react";

interface MobileNavWrapperProps {
  children: ReactNode;
}

export function MobileNavWrapper({ children }: MobileNavWrapperProps) {
  return <div>{children}</div>;
}
