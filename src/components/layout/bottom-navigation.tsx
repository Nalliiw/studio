
// src/components/layout/bottom-navigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types'; 
import { SlidersHorizontal, Home, ClipboardList, PlaySquare, Award, LayoutDashboard, Users, Workflow, Library, Sparkles, CalendarDays } from 'lucide-react';
import MobileMoreOptionsSheet from './mobile-more-options-sheet';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType; 
  roles: UserRole[];
  subItems?: NavItem[];
}

interface BottomNavigationProps {
  userNavItems: NavItem[];
}

const iconMap: Record<string, React.ElementType> = {
    '/inicio': Home,
    '/formulario': ClipboardList,
    '/conteudos': PlaySquare,
    '/conquistas': Award,
    '/dashboard-geral': LayoutDashboard,
    '/dashboard-especialista': LayoutDashboard, 
    '/pacientes': Users,
    '/flowbuilder/meus-fluxos': Workflow,
    '/biblioteca': Library,
    '/minha-agenda': CalendarDays,
    '/agenda-especialista': CalendarDays,
};

const NutriTrackIcon = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-6 w-6 text-primary", className)} /> 
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
    return null;
  }

  const homePath = user?.role === UserRole.PATIENT ? "/inicio" :
                   user?.role === UserRole.CLINIC_SPECIALIST ? "/dashboard-especialista" :
                   (user?.role === UserRole.ADMIN_SUPREMO ? "/dashboard-geral" : "/login");

  const numNavItemsToDisplay = 3;
  const mainDisplayItems = userNavItems.slice(0, numNavItemsToDisplay);
  const showMoreButton = true; 

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-between border-t bg-card px-1 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05),0_-1px_3px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_5px_-1px_rgba(255,255,255,0.03),0_-1px_3px_-1px_rgba(255,255,255,0.02)]">
        <Link
            href={homePath}
            className="flex flex-none flex-col items-center justify-center p-1 text-xs text-muted-foreground hover:bg-muted/50 w-1/5 max-w-[70px]"
            aria-label="Página Inicial"
        >
            <NutriTrackIcon />
            <span className="truncate text-[10px] leading-tight mt-0.5">Início</span>
        </Link>

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
