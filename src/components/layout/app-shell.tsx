
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
  Settings2,
  Sun,
  Moon,
  CalendarDays,
  UsersRound,
  HelpCircle,
  CalendarClock,
  Kanban,
  ImageIcon,
  MessagesSquare, // Novo ícone para Mensagens
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import BottomNavigation from './bottom-navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  subItems?: NavItem[];
  notifications?: number; // Para o badge de notificação
}

const navItems: NavItem[] = [
  // Admin Supremo
  { href: '/dashboard-geral', label: 'Dashboard Geral', icon: LayoutDashboard, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/empresas', label: 'Empresas (Clínicas)', icon: Building, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/mensagens', label: 'Mensagens', icon: MessagesSquare, roles: [UserRole.ADMIN_SUPREMO], notifications: 3 },
  { href: '/admin/equipe', label: 'Equipe Admin', icon: Users, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/agenda-admin', label: 'Agenda Admin', icon: CalendarClock, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/kanban-tarefas', label: 'Tarefas (Kanban)', icon: Kanban, roles: [UserRole.ADMIN_SUPREMO, UserRole.CLINIC_SPECIALIST] },
  { href: '/central-ajuda', label: 'Central de Ajuda', icon: HelpCircle, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/relatorios-gerais', label: 'Relatórios Gerais', icon: BarChart3, roles: [UserRole.ADMIN_SUPREMO] },


  // Especialista da Clínica (Clinic Specialist)
  { href: '/dashboard-especialista', label: 'Painel do Especialista', icon: LayoutDashboard, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/pacientes', label: 'Pacientes', icon: Users, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/mensagens', label: 'Mensagens', icon: MessagesSquare, roles: [UserRole.CLINIC_SPECIALIST], notifications: 5 },
  { href: '/flowbuilder/meus-fluxos', label: 'Meus Fluxos', icon: Workflow, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/agenda-especialista', label: 'Agenda do Especialista', icon: CalendarDays, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/equipe', label: 'Equipe da Clínica', icon: UsersRound, roles: [UserRole.CLINIC_SPECIALIST] },
  { href: '/clinica/configuracoes', label: 'Config. Clínica', icon: Settings2, roles: [UserRole.CLINIC_SPECIALIST] },

  // Paciente
  { href: '/inicio', label: 'Início', icon: Home, roles: [UserRole.PATIENT] },
  { href: '/formulario', label: 'Formulários', icon: ClipboardList, roles: [UserRole.PATIENT] },
  { href: '/conteudos', label: 'Conteúdos', icon: PlaySquare, roles: [UserRole.PATIENT] },
  { href: '/conquistas', label: 'Conquistas', icon: Award, roles: [UserRole.PATIENT] },
  { href: '/minha-agenda', label: 'Minha Agenda', icon: CalendarDays, roles: [UserRole.PATIENT] },
];


const AppShellInternal = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isMobile, state: sidebarState, collapsible: sidebarCollapsibleSetting, side: sidebarSideSetting, setOpenMobile } = useSidebar();
  const [clientHasMounted, setClientHasMounted] = useState(false);

  useEffect(() => {
    setClientHasMounted(true);
  }, []);

  if (!clientHasMounted || authLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!user) {
    // AuthContext's useEffect should handle redirection to /login
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
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

  const handleLogoutClick = () => {
    if (isMobile) setOpenMobile(false);
    logout();
  }
  
  const handleThemeToggleAsButton = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('[role="switch"]')) {
        e.stopPropagation(); 
    } else {
        toggleTheme();
    }
  };


  return (
    <>
      {!isMobile && (
        <Sidebar collapsible={sidebarCollapsibleSetting} variant="sidebar" side={sidebarSideSetting}>
          <SidebarHeader />

          <SidebarContent className="p-2">
            <SidebarMenu>
              {userNavItems.map((item) => {
                const isActive = pathname === item.href || 
                                 (item.href !== '/' && !item.href.startsWith('/dashboard') && !item.href.startsWith('/inicio') && !item.href.startsWith('/admin') && !item.href.startsWith('/clinica') && !item.href.startsWith('/central-ajuda') && !item.href.startsWith('/mensagens') && pathname.startsWith(item.href)) ||
                                 ((item.href.startsWith('/clinica') || item.href.startsWith('/central-ajuda') || item.href.startsWith('/admin') || item.href.startsWith('/mensagens')) && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={`${item.href}-${item.label}`}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn("relative", isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90")}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                         {item.notifications && item.notifications > 0 && (
                          <Badge
                            variant="destructive"
                            className={cn(
                              "absolute text-xs p-0.5 h-4 min-w-[1rem] flex items-center justify-center rounded-full",
                              sidebarState === 'collapsed' && !isMobile ? "top-0.5 right-0.5" : "top-1 right-1 group-data-[collapsible=icon]:hidden"
                            )}
                          >
                            {item.notifications}
                          </Badge>
                        )}
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
                    tooltip={user.name || user.email || 'Usuário'}
                    className="h-auto py-2 group-data-[collapsible=icon]:justify-center"
                    onClick={handleUserAvatarClick}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="profile avatar" alt={user.name || 'Avatar'}/>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium leading-tight">{user.displayName || user.name || 'Usuário'}</span>
                        <span className="text-xs text-sidebar-foreground/70 leading-tight">{user.email}</span>
                    </span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton isActive={pathname === '/configuracoes'} tooltip="Config. da Conta" onClick={handleSettingsClick}  className={cn(pathname === '/configuracoes' && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90")}>
                      <Settings />
                      <span>Config. da Conta</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                 <div
                  className={cn(
                    sidebarMenuButtonVariants({variant: "default", size: "default"}), // Use variants here
                    "h-8 text-sm", 
                    "justify-between cursor-pointer" 
                  )}
                  onClick={handleThemeToggleAsButton}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleThemeToggleAsButton(e);}}
                  tabIndex={0}
                  role="button"
                  aria-label={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                  title={sidebarState === "collapsed" && !isMobile ? (theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro') : undefined}
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun /> : <Moon />}
                    <span className="group-data-[collapsible=icon]:hidden">
                      {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    </span>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    aria-label="Alternar tema"
                    className="ml-auto group-data-[collapsible=icon]:hidden"
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogoutClick} tooltip="Sair">
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
           isMobile ? "px-4 pt-4 pb-20" : "p-6" // Ensure consistent pt-6 for desktop, adjusted pb for mobile
        )}>
          {children}
      </SidebarInset>

      {clientHasMounted && isMobile && <BottomNavigation userNavItems={userNavItems} />}
    </>
  );
};

// Helper for sidebarMenuButtonVariants - ensure this is defined or imported correctly if used.
// For this example, I've inlined the classes to the div.
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      },
      size: {
        default: "h-8 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);


export default function AppShell({ children }: { children: React.ReactNode }) {
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
