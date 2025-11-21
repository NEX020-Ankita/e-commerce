'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
}