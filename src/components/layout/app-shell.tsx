
// src/components/layout/app-shell.tsx
'use client';

import React from 'react';
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
  SidebarTrigger, 
  SidebarRail,
  useSidebar, 
  sidebarMenuButtonVariants,
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
  Menu, 
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import BottomNavigation from './bottom-navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


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
  { href: '/conquistas', label: 'Conquistas', icon: Award, roles: [UserRole.PATIENT] }, // Changed from Elogios
];

const NutriTrackIcon = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-7 w-7 text-sidebar-primary", className)} />
);


const AppShellInternal = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isMobile, state: sidebarState, collapsible: sidebarCollapsibleSetting, side: sidebarSideSetting } = useSidebar();

  if (!user) { 
    return null;
  }

  const userNavItems = navItems.filter(item => item.roles.includes(user.role));
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleUserAvatarClick = () => {
    router.push('/perfil');
  };
  
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
                if (item.href === '/flowbuilder/meus-fluxos' && pathname === '/flowbuilder') {
                  // Special case for /flowbuilder to also activate /flowbuilder/meus-fluxos
                }
                
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
                  <Link href="/configuracoes" legacyBehavior passHref>
                      <SidebarMenuButton isActive={pathname === '/configuracoes'} tooltip="Configurações">
                          <Settings />
                          <span>Configurações</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <div
                  className={cn(
                    sidebarMenuButtonVariants({ variant: "default", size: "default" }),
                    "flex w-full items-center justify-between cursor-default group-data-[collapsible=icon]:justify-center"
                  )}
                  title={sidebarState === "collapsed" && !isMobile ? (theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro') : undefined}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center shrink-0"> {/* Ensure icon doesn't shrink */}
                        {theme === 'dark' ? <Sun /> : <Moon />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center" hidden={sidebarState !== "collapsed" || isMobile}>
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

      <SidebarInset>
        <main className={cn(
          "flex-1 p-4 md:p-6 overflow-y-auto h-screen", 
          isMobile ? "pb-[70px] pt-4" : "md:pt-6" 
        )}>
          {children}
        </main>
      </SidebarInset>

      {isMobile && <BottomNavigation userNavItems={userNavItems} />}
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

  if (!user) {
    return null;
  }
  
  const sidebarCollapsibleType = "icon"; 
  const sidebarSidePlacement = "left"; 

  return (
    <SidebarProvider 
        defaultOpen={true} 
        collapsible={sidebarCollapsibleType} 
        side={sidebarSidePlacement}
    >
      <AppShellInternal>{children}</AppShellInternal>
    </SidebarProvider>
  );
}

