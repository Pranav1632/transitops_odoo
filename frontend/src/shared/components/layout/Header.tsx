'use client';

import { useSession } from '../../hooks/useSession';
import { supabase } from '../../lib/apiClient';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumb from './Breadcrumb';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { profile } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-background px-6">
      {/* Breadcrumb section */}
      <Breadcrumb />

      {/* Action / Profile section */}
      <div className="flex items-center gap-4">
        {profile && (
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold">{profile.full_name}</p>
            <p className="text-[10px] text-muted-foreground uppercase">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
          title="Log Out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
