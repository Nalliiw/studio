// src/components/layout/bottom-navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

// Mirrored from app-shell.tsx for consistency
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType; // Lucide icons are React.ElementType
  roles: UserRole[];
  subItems?: NavItem[];
}

interface BottomNavigationProps {
  userNavItems: NavItem[];
}

export default function BottomNavigation({ userNavItems }: BottomNavigationProps) {
  const pathname = usePathname();

  // Determine a sensible max number of items, or implement scrolling / "more" tab
  const displayItems = userNavItems.slice(0, 5); // Show up to 5 items

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-around border-t bg-card shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05),0_-1px_3px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_5px_-1px_rgba(255,255,255,0.03),0_-1px_3px_-1px_rgba(255,255,255,0.02)]">
      {displayItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/inicio' && pathname.startsWith(item.href));
        const IconComponent = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center p-1 text-xs transition-colors duration-150 ease-in-out",
              isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <IconComponent className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "")} />
            <span className="truncate text-[10px] leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
