
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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Button removed as it's not directly used for the trigger anymore, SidebarMenuButton is
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  UserCircle,
  Menu,
  // Sun, Moon removed as they are not used
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Admin Supremo
  { href: '/dashboard-geral', label: 'Dashboard Geral', icon: LayoutDashboard, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/empresas', label: 'Empresas', icon: Building, roles: [UserRole.ADMIN_SUPREMO] },
  { href: '/relatorios-gerais', label: 'Relatórios Gerais', icon: BarChart3, roles: [UserRole.ADMIN_SUPREMO] },
  // Nutricionista
  { href: '/dashboard-nutricionista', label: 'Dashboard Nutri', icon: LayoutDashboard, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/pacientes', label: 'Pacientes', icon: Users, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/flowbuilder', label: 'Criador de Fluxos', icon: Workflow, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  // Paciente
  { href: '/inicio', label: 'Início', icon: Home, roles: [UserRole.PATIENT] },
  { href: '/formulario', label: 'Formulários', icon: ClipboardList, roles: [UserRole.PATIENT] },
  { href: '/conteudos', label: 'Conteúdos', icon: PlaySquare, roles: [UserRole.PATIENT] },
  { href: '/elogios', label: 'Elogios', icon: Award, roles: [UserRole.PATIENT] },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  const userNavItems = navItems.filter(item => item.roles.includes(user.role));
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  
  const sidebarCollapsibleType = "icon"; 
  const sidebarSidePlacement = "left"; 

  return (
    <SidebarProvider 
        defaultOpen={true} 
        collapsible={sidebarCollapsibleType} 
        side={sidebarSidePlacement}
    >
      <Sidebar collapsible={sidebarCollapsibleType} variant="sidebar" side={sidebarSidePlacement}>
        <SidebarHeader className="p-4 justify-center items-center flex flex-col">
           <div className="p-2 rounded-md bg-primary/10 text-primary w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M15.5 7.5c0-1.105-.895-2-2-2s-2 .895-2 2c0 1.105.895 2 2 2 .653 0 1.231-.316 1.601-.809l.007-.013c.055-.09.105-.184.149-.282.139-.31.243-.645.243-.996z"/><path d="M8.5 15c0-1.105.895-2 2-2s2 .895 2 2c0 1.105-.895 2-2 2s-2-.895-2-2z"/><path d="M12 12.5c-1.5 0-2.5 1-2.5 2.5S10.5 17.5 12 17.5s2.5-1 2.5-2.5S13.5 12.5 12 12.5zM12 9.5c-1.5 0-2.5-1-2.5-2.5S10.5 4.5 12 4.5s2.5 1 2.5 2.5S13.5 9.5 12 9.5z"/></svg>
           </div>
          <h1 className="text-xl font-semibold text-sidebar-foreground mt-2">NutriTrack Lite</h1>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {userNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
           <SidebarMenu>
             <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={user.name}
                      className="h-auto py-2 group-data-[collapsible=icon]:justify-center"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.name} data-ai-hint="profile avatar" />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                          <span className="text-sm font-medium leading-tight">{user.name}</span>
                          <span className="text-xs text-sidebar-foreground/70 leading-tight">{user.email}</span>
                      </span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-56" sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Perfil link removed based on user request */}
                    {/* <DropdownMenuItem asChild>
                      <Link href="/perfil"><UserCircle className="mr-2 h-4 w-4" /> Perfil</Link>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem asChild>
                      <Link href="/configuracoes"><Settings className="mr-2 h-4 w-4" /> Configurações</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" /> Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-6">
          <SidebarTrigger className="md:hidden">
            <Menu />
          </SidebarTrigger>
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          {/* User profile DropdownMenu and its container div are removed from here */}
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

