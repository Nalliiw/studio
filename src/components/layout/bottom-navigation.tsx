
// src/components/layout/bottom-navigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types'; 
import { SlidersHorizontal, Home, ClipboardList, PlaySquare, Award, LayoutDashboard, Users, Workflow, Library, Sparkles, CalendarDays, UsersRound } from 'lucide-react';
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

// Main nav items that might appear directly on the bottom bar
const mainBottomNavLinksPatient: string[] = ['/inicio', '/formulario', '/conteudos', '/minha-agenda', '/conquistas'];
const mainBottomNavLinksSpecialist: string[] = ['/dashboard-especialista', '/pacientes', '/flowbuilder/meus-fluxos', '/biblioteca', '/agenda-especialista', '/equipe']; // Added /equipe
const mainBottomNavLinksAdmin: string[] = ['/dashboard-geral', '/empresas', '/relatorios-gerais'];


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

  let relevantMainLinks: string[];
  switch (user.role) {
    case UserRole.PATIENT:
      relevantMainLinks = mainBottomNavLinksPatient;
      break;
    case UserRole.CLINIC_SPECIALIST:
      relevantMainLinks = mainBottomNavLinksSpecialist;
      break;
    case UserRole.ADMIN_SUPREMO:
      relevantMainLinks = mainBottomNavLinksAdmin;
      break;
    default:
      relevantMainLinks = [];
  }
  
  const displayItems = userNavItems.filter(item => relevantMainLinks.includes(item.href)).slice(0, 3);
  const moreSheetItems = userNavItems.filter(item => !relevantMainLinks.includes(item.href) || !displayItems.includes(item));


  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-between border-t bg-card px-1 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05),0_-1px_3px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_5px_-1px_rgba(255,255,255,0.03),0_-1px_3px_-1px_rgba(255,255,255,0.02)]">
        <Link
            href={homePath}
            className="flex flex-none flex-col items-center justify-center p-1 text-xs text-muted-foreground hover:bg-muted/50 w-1/5 max-w-[70px]"
            aria-label="Página Inicial"
        >
            <Sparkles className={cn("h-6 w-6", pathname === homePath ? "text-primary" : "")} />
            <span className="truncate text-[10px] leading-tight mt-0.5">Início</span>
        </Link>

        <div className="flex flex-1 items-stretch justify-around">
            {displayItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('dashboard') && !item.href.includes('inicio') && pathname.startsWith(item.href));
            const IconComponent = item.icon;

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

        {(moreSheetItems.length > 0 || user) && ( // Show "More" if there are other nav items or always if user is logged in for Profile/Settings
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
      <MobileMoreOptionsSheet 
        isOpen={isMoreSheetOpen} 
        onOpenChange={setIsMoreSheetOpen} 
        additionalNavItems={moreSheetItems}
      />
    </>
  );
}

