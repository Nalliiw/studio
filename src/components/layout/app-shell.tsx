
// src/components/layout/app-shell.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  // SidebarTrigger, // No longer used as top bar is removed on mobile
  SidebarRail,
  useSidebar, 
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  Building,
  BarChart3,
  Users,
  Workflow,
  Library,
  Home,
  ClipboardList,
  PlaySquare,
  Award,
  LogOut,
  Settings,
  // Menu, // No longer used
  Sun,
  Moon,
  Sparkles,
  // SlidersHorizontal, // Moved to BottomNavigation
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import BottomNavigation from './bottom-navigation';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  // Admin Supremo
  { href: '/dashboard-geral', label: 'Dashboard Geral', icon: LayoutDashboard, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/empresas', label: 'Empresas', icon: Building, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/relatorios-gerais', label: 'Relatórios Gerais', icon: BarChart3, roles: [UserRole.ADMIN_SUPREMO] },
  // Nutricionista
  { href: '/dashboard-nutricionista', label: 'Dashboard Nutri', icon: LayoutDashboard, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/pacientes', label: 'Pacientes', icon: Users, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/flowbuilder/meus-fluxos', label: 'Meus Fluxos', icon: Workflow, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  // Paciente
  { href: '/inicio', label: 'Início', icon: Home, roles: [UserRole.PATIENT] },
  { href: '/formulario', label: 'Formulários', icon: ClipboardList, roles: [UserRole.PATIENT] },
  { href: '/conteudos', label: 'Conteúdos', icon: PlaySquare, roles: [UserRole.PATIENT] },
  { href: '/conquistas', label: 'Conquistas', icon: Award, roles: [UserRole.PATIENT] },
];

const NutriTrackIcon = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-7 w-7 text-sidebar-primary", className)} />
);


const AppShellInternal = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isMobile, state: sidebarState, collapsible: sidebarCollapsibleSetting, side: sidebarSideSetting, setOpenMobile } = useSidebar();
  const [clientHasMounted, setClientHasMounted] = useState(false);

  useEffect(() => {
    setClientHasMounted(true);
  }, []);


  if (!clientHasMounted || !user) { 
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }

  const userNavItems = navItems.filter(item => item.roles.includes(user.role));
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleUserAvatarClick = () => {
    if (isMobile) setOpenMobile(false); 
    router.push('/perfil');
  };

  const handleSettingsClick = () => {
    if (isMobile) setOpenMobile(false);
    router.push('/configuracoes');
  }
  
  return (
    <>
      {!isMobile && (
        <Sidebar collapsible={sidebarCollapsibleSetting} variant="sidebar" side={sidebarSideSetting}>
          <SidebarRail />
          <SidebarHeader>
            {/* Logo/Title logic is handled within SidebarHeader */}
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {userNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/dashboard-geral' && item.href !== '/dashboard-nutricionista' && item.href !== '/inicio' && pathname.startsWith(item.href));
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
             <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={user.name}
                    className="h-auto py-2 group-data-[collapsible=icon]:justify-center"
                    onClick={handleUserAvatarClick}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.name} data-ai-hint="profile avatar"/>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium leading-tight">{user.name}</span>
                        <span className="text-xs text-sidebar-foreground/70 leading-tight">{user.email}</span>
                    </span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton isActive={pathname === '/configuracoes'} tooltip="Configurações" onClick={handleSettingsClick}>
                      <Settings />
                      <span>Configurações</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <div
                  className={cn(
                     "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 h-8",
                    "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 justify-between group-data-[collapsible=icon]:justify-center cursor-default"
                  )}
                  title={sidebarState === "collapsed" && !isMobile ? (theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro') : undefined}
                   onClick={(e) => {
                     if (sidebarState === "collapsed" && !isMobile) {
                       toggleTheme();
                     }
                     if (sidebarState === "expanded" || isMobile) {
                       e.preventDefault();
                     }
                   }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center shrink-0">
                        {theme === 'dark' ? <Sun /> : <Moon />}
                      </div>
                    </TooltipTrigger>
                     <TooltipContent side="right" align="center" hidden={sidebarState !== "collapsed" || isMobile || (sidebarState === "expanded" && !isMobile)}>
                      {theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                    </TooltipContent>
                  </Tooltip>

                  <span className="flex-grow ml-2 group-data-[collapsible=icon]:hidden">
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </span>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    aria-label="Alternar tema"
                    className="ml-auto group-data-[collapsible=icon]:hidden shrink-0"
                  />
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                  <SidebarMenuButton onClick={logout} tooltip="Sair">
                      <LogOut />
                      <span>Sair</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
             </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Mobile Top Bar removed */}

      <SidebarInset className={cn(
          "flex-1 overflow-y-auto", 
          isMobile ? "pt-4 pb-16" : "p-6" 
        )}>
          {children}
      </SidebarInset>

      {clientHasMounted && isMobile && <BottomNavigation userNavItems={userNavItems} />}
    </>
  );
};


export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();


  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const sidebarCollapsibleType = "icon"; 
  const sidebarSidePlacement = "left"; 

  return (
    <TooltipProvider> 
      <SidebarProvider 
          defaultOpen={true} 
          collapsible={sidebarCollapsibleType} 
          side={sidebarSidePlacement}
      >
        <AppShellInternal>{children}</AppShellInternal>
      </SidebarProvider>
    </TooltipProvider>
  );
}
