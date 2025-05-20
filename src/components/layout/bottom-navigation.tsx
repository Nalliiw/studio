
// src/components/layout/bottom-navigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types'; // Imported UserRole
import { SlidersHorizontal, Home, ClipboardList, PlaySquare, Award, LayoutDashboard, Users, Workflow, Library, Sparkles } from 'lucide-react';
import MobileMoreOptionsSheet from './mobile-more-options-sheet';
import { useAuth } from '@/hooks/useAuth';

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

const NutriTrackIcon = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-6 w-6 text-primary", className)} /> // Adjusted size for bottom bar
);


export default function BottomNavigation({ userNavItems }: BottomNavigationProps) {
  const pathname = usePathname();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const { user } = useAuth();
  const [clientHasMounted, setClientHasMounted] = useState(false);

  useEffect(() => {
    setClientHasMounted(true);
  }, []);

  if (!clientHasMounted || !user) {
    // Render nothing or a placeholder until client has mounted and user is available
    // to avoid mismatches or errors during SSR/hydration if user/role is client-side.
    return null;
  }

  const homePath = user?.role === UserRole.PATIENT ? "/inicio" :
                   user?.role === UserRole.NUTRITIONIST_WHITE_LABEL ? "/dashboard-nutricionista" :
                   (user?.role === UserRole.ADMIN_SUPREMO ? "/dashboard-geral" : "/login");

  // Display up to 3 main navigation items in the center, plus Logo and More button
  const numNavItemsToDisplay = 3;
  const mainDisplayItems = userNavItems.slice(0, numNavItemsToDisplay);
  const showMoreButton = true; // Always show "More" for Profile, Settings etc.

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-between border-t bg-card px-1 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05),0_-1px_3px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_5px_-1px_rgba(255,255,255,0.03),0_-1px_3px_-1px_rgba(255,255,255,0.02)]">
        {/* Logo on the left */}
        <Link
            href={homePath}
            className="flex flex-none flex-col items-center justify-center p-1 text-xs text-muted-foreground hover:bg-muted/50 w-1/5 max-w-[70px]"
            aria-label="Página Inicial"
        >
            <NutriTrackIcon />
            <span className="truncate text-[10px] leading-tight mt-0.5">Início</span>
        </Link>

        {/* Navigation items in the center, taking remaining space */}
        <div className="flex flex-1 items-stretch justify-around">
            {mainDisplayItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('dashboard') && !item.href.includes('inicio') && pathname.startsWith(item.href));
            const IconComponent = item.icon || iconMap[item.href] || Home;

            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex flex-col items-center justify-center p-1 text-xs transition-colors duration-150 ease-in-out min-w-0",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
                )}
                aria-current={isActive ? "page" : undefined}
                >
                <IconComponent className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "")} />
                <span className="truncate text-[10px] leading-tight w-full text-center">{item.label}</span>
                </Link>
            );
            })}
        </div>

        {/* "More" button on the right */}
        {showMoreButton && (
          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className={cn(
              "flex flex-none flex-col items-center justify-center p-1 text-xs transition-colors duration-150 ease-in-out hover:bg-muted/50 w-1/5 max-w-[70px]",
              isMoreSheetOpen ? "text-primary bg-primary/10" : "text-muted-foreground"
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
