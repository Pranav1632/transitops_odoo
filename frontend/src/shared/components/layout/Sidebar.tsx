'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '../../hooks/useSession';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Fleet', href: '/fleet', icon: Truck, roles: ['fleet_manager'] },
  { name: 'Drivers', href: '/drivers', icon: Users, roles: ['fleet_manager', 'safety_officer'] },
  { name: 'Trips', href: '/trips', icon: Route, roles: ['dispatcher'] },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['fleet_manager', 'financial_analyst'] },
  { name: 'Fuel & Expenses', href: '/fuel-expenses', icon: Fuel, roles: ['fleet_manager', 'financial_analyst'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['financial_analyst'] },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useSession();

  // Simple role authorization filter
  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    if (!profile) return false;
    return item.roles.includes(profile.role);
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col border-r border-border bg-card text-card-foreground">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Truck className="h-6 w-6 text-primary" />
          <span className="text-lg tracking-wider uppercase">TransitOps</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="block">
              <span
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Profile/Footer */}
      <div className="border-t border-border p-4">
        {profile ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{profile.full_name}</p>
              <p className="truncate text-xs text-muted-foreground uppercase">
                {profile.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <p className="text-xs text-muted-foreground">Not signed in</p>
          </div>
        )}
      </div>
    </aside>
  );
}
