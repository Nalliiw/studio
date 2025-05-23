
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
  // SidebarTrigger, // No longer needed for top-left hamburger
  SidebarRail, // Keep for desktop collapse/expand
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
  Settings2,
  Sun,
  Moon,
  CalendarDays, 
  UsersRound,
  ImageIcon, // Placeholder for clinic logo/favicon
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
  { href: '/empresas', label: 'Empresas (Clínicas)', icon: Building, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/relatorios-gerais', label: 'Relatórios Gerais', icon: BarChart3, roles: [UserRole.ADMIN_SUPREMO] },
  // Especialista da Clínica
  { href: '/dashboard-especialista', label: 'Painel do Especialista', icon: LayoutDashboard, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/pacientes', label: 'Pacientes', icon: Users, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/flowbuilder/meus-fluxos', label: 'Meus Fluxos', icon: Workflow, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/agenda-especialista', label: 'Agenda do Especialista', icon: CalendarDays, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/equipe', label: 'Equipe', icon: UsersRound, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/clinica/configuracoes', label: 'Config. Clínica', icon: Settings2, roles: [UserRole.CLINIC_SPECIALIST] },
  // Paciente
  { href: '/inicio', label: 'Início', icon: Home, roles: [UserRole.PATIENT] },
  { href: '/formulario', label: 'Formulários', icon: ClipboardList, roles: [UserRole.PATIENT] },
  { href: '/conteudos', label: 'Conteúdos', icon: PlaySquare, roles: [UserRole.PATIENT] },
  { href: '/conquistas', label: 'Conquistas', icon: Award, roles: [UserRole.PATIENT] },
  { href: '/minha-agenda', label: 'Minha Agenda', icon: CalendarDays, roles: [UserRole.PATIENT] },
];

// Removed the local NutriTrackIcon (Sparkles) definition, SidebarHeader handles its own logo placeholder

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


  if (!clientHasMounted) { 
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }
  
  if (!user) {
    // AuthContext will handle redirection to login if user is null and not on a login page.
    // This prevents rendering AppShell content before redirection.
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
          {/* SidebarRail is now rendered inside SidebarHeader by default if collapsible=icon */}
          <SidebarHeader /> {/* SidebarHeader now handles its own logo placeholder */}

          <SidebarContent className="p-2">
            <SidebarMenu>
              {userNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && !item.href.startsWith('/dashboard') && !item.href.startsWith('/inicio') && !item.href.startsWith('/clinica') && pathname.startsWith(item.href)) || (item.href.startsWith('/clinica') && pathname.startsWith(item.href));
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90")}
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
                  <SidebarMenuButton isActive={pathname === '/configuracoes'} tooltip="Configurações da Conta" onClick={handleSettingsClick}  className={cn(pathname === '/configuracoes' && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90")}>
                      <Settings />
                      <span>Config. da Conta</span>
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
                       // Prevent click on the div itself from toggling if there's a Switch inside
                       if (e.target === e.currentTarget && sidebarState === "expanded" && !isMobile) e.preventDefault();
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
                    onClick={(e) => e.stopPropagation()} 
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
      
      <SidebarInset className={cn(
          "flex-1 overflow-y-auto", 
          isMobile ? "px-4 pt-4 pb-16" : "p-6 pt-6" // Adjusted mobile padding
        )}>
          {children}
      </SidebarInset>

      {clientHasMounted && isMobile && <BottomNavigation userNavItems={userNavItems} />}
    </>
  );
};


export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();


  if (authLoading && !user) { // Show loading only if user is not yet available
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not loading and still no user, AuthContext's useEffect will redirect to /login.
  // Returning null here prevents AppShellInternal from rendering prematurely during that redirect.
  if (!user) {
      return null;
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

