'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import React from 'react';

export default function Breadcrumb() {
  const pathname = usePathname() || '';
  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-semibold text-foreground" aria-current="page">
                {capitalize(segment)}
              </span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {capitalize(segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
