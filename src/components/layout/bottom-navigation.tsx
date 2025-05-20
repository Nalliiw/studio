
// src/components/layout/bottom-navigation.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { SlidersHorizontal, Home, ClipboardList, PlaySquare, Award, LayoutDashboard, Users, Workflow, Library } from 'lucide-react'; // Added MoreHorizontal
import MobileMoreOptionsSheet from './mobile-more-options-sheet';

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

// Define a mapping for icons if not directly on item
const iconMap: Record<string, React.ElementType> = {
    '/inicio': Home,
    '/formulario': ClipboardList,
    '/conteudos': PlaySquare,
    '/conquistas': Award,
    '/dashboard-geral': LayoutDashboard,
    '/dashboard-nutricionista': LayoutDashboard, // Can reuse or use specific
    '/pacientes': Users,
    '/flowbuilder/meus-fluxos': Workflow,
    '/biblioteca': Library,
};


export default function BottomNavigation({ userNavItems }: BottomNavigationProps) {
  const pathname = usePathname();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Show up to 4 main items, the 5th slot is for "More"
  const maxMainItems = 4;
  const mainDisplayItems = userNavItems.slice(0, maxMainItems);
  const hasMoreItemsOrAlwaysShowMore = userNavItems.length > maxMainItems || true; // Always show "More" for now

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-around border-t bg-card shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05),0_-1px_3px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_5px_-1px_rgba(255,255,255,0.03),0_-1px_3px_-1px_rgba(255,255,255,0.02)]">
        {mainDisplayItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('dashboard') && !item.href.includes('inicio') && pathname.startsWith(item.href));
          const IconComponent = item.icon || iconMap[item.href] || Home; // Fallback icon

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

        {hasMoreItemsOrAlwaysShowMore && (
          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center p-1 text-xs transition-colors duration-150 ease-in-out",
              isMoreSheetOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
            )}
            aria-label="Mais opções"
          >
            <SlidersHorizontal className={cn("h-5 w-5 mb-0.5", isMoreSheetOpen ? "text-primary" : "")} />
            <span className="truncate text-[10px] leading-tight">Mais</span>
          </button>
        )}
      </nav>
      <MobileMoreOptionsSheet isOpen={isMoreSheetOpen} onOpenChange={setIsMoreSheetOpen} />
    </>
  );
}
