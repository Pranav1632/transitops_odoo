'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from '@/components/ui/sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      {/* Sidebar (fixed at 64 / 256px wide) */}
      <Sidebar />

      {/* Main viewport (starts after sidebar) */}
      <div className="flex-1 flex flex-col min-h-screen pl-64">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
