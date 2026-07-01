'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import PersistentExperience from './PersistentExperience';
import { isStandaloneRoute } from '../lib/routes';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isStandaloneRoute(pathname)) {
    return <>{children}</>;
  }

  return <PersistentExperience>{children}</PersistentExperience>;
}
