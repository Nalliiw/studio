
// src/components/layout/bottom-navigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types'; 
import { SlidersHorizontal, Home, ClipboardList, PlaySquare, Award, LayoutDashboard, Users, Workflow, Library, CalendarDays, UsersRound, Settings2, ImageIcon, MessagesSquare } from 'lucide-react';
import MobileMoreOptionsSheet from './mobile-more-options-sheet';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType; 
  roles: UserRole[];
  subItems?: NavItem[];
  notifications?: number;
}

interface BottomNavigationProps {
  userNavItems: NavItem[];
}

// Main nav items that might appear directly on the bottom bar
const mainBottomNavLinksPatient: string[] = ['/formulario', '/conteudos', '/minha-agenda'];
const mainBottomNavLinksSpecialist: string[] = ['/pacientes', '/mensagens', '/flowbuilder/meus-fluxos'];
const mainBottomNavLinksAdmin: string[] = ['/empresas', '/mensagens', '/admin/equipe'];


export default function BottomNavigation({ userNavItems }: BottomNavigationProps) {
  const pathname = usePathname();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const { user, company } = useAuth();
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
  let allRoleSpecificNavItems: NavItem[];

  switch (user.role) {
    case UserRole.PATIENT:
      relevantMainLinks = mainBottomNavLinksPatient;
      allRoleSpecificNavItems = userNavItems.filter(item => item.roles.includes(UserRole.PATIENT));
      break;
    case UserRole.CLINIC_SPECIALIST:
      relevantMainLinks = mainBottomNavLinksSpecialist;
      allRoleSpecificNavItems = userNavItems.filter(item => item.roles.includes(UserRole.CLINIC_SPECIALIST));
      break;
    case UserRole.ADMIN_SUPREMO:
      relevantMainLinks = mainBottomNavLinksAdmin;
      allRoleSpecificNavItems = userNavItems.filter(item => item.roles.includes(UserRole.ADMIN_SUPREMO));
      break;
    default:
      relevantMainLinks = [];
      allRoleSpecificNavItems = [];
  }
  
  // Ensure homePath related item is not duplicated in displayItems if it's also in userNavItems
  const displayItems = allRoleSpecificNavItems.filter(item => relevantMainLinks.includes(item.href) && item.href !== homePath).slice(0, 3); // Max 3 + Home + More = 5 items
  const moreSheetItems = allRoleSpecificNavItems.filter(item => !displayItems.find(displayed => displayed.href === item.href) && item.href !== homePath);


  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-between border-t bg-card px-1 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05),0_-1px_3px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_5px_-1px_rgba(255,255,255,0.03),0_-1px_3px_-1px_rgba(255,255,255,0.02)]">
        <Link
            href={homePath}
            className="flex flex-none flex-col items-center justify-center p-1 text-xs text-muted-foreground hover:bg-muted/50 w-1/5 max-w-[70px]"
            aria-label="Página Inicial"
        >
            {company?.logoUrl ? (
              <Image src={company.logoUrl} alt="Logo" width={24} height={24} className="h-6 w-6 object-contain rounded-sm" data-ai-hint="company logo small"/>
            ) : (
              <ImageIcon className={cn("h-6 w-6", pathname === homePath ? "text-primary" : "")} />
            )}
            <span className="truncate text-[10px] leading-tight mt-0.5">Início</span>
        </Link>

        <div className="flex flex-1 items-stretch justify-around">
            {displayItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('dashboard') && !item.href.includes('inicio') && !item.href.includes('clinica') && pathname.startsWith(item.href)) || (item.href.includes('clinica') && pathname.startsWith(item.href));
            const IconComponent = item.icon;

            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "relative flex flex-col items-center justify-center p-1 text-xs transition-colors duration-150 ease-in-out min-w-0",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
                )}
                aria-current={isActive ? "page" : undefined}
                >
                <IconComponent className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "")} />
                <span className="truncate text-[10px] leading-tight w-full text-center">{item.label}</span>
                {item.notifications && item.notifications > 0 && (
                  <Badge variant="destructive" className="absolute top-1 right-1 text-[8px] p-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full">
                    {item.notifications}
                  </Badge>
                )}
                </Link>
            );
            })}
        </div>

        {(moreSheetItems.length > 0 || user) && ( // Ensure "More" button always shows if there's a user for profile/settings access
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
