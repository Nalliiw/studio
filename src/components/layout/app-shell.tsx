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
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

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
  { 
    href: '/pacientes', 
    label: 'Pacientes', 
    icon: Users, 
    roles: [UserRole.NUTRITIONIST_WHITE_LABEL],
  },
  { href: '/flowbuilder/meus-fluxos', label: 'Meus Fluxos', icon: Workflow, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  // Paciente
  { href: '/inicio', label: 'Início', icon: Home, roles: [UserRole.PATIENT] },
  { href: '/formulario', label: 'Formulários', icon: ClipboardList, roles: [UserRole.PATIENT] },
  { href: '/conteudos', label: 'Conteúdos', icon: PlaySquare, roles: [UserRole.PATIENT] },
  { href: '/elogios', label: 'Elogios', icon: Award, roles: [UserRole.PATIENT] },
];

const NutriTrackIcon = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-7 w-7 text-sidebar-primary", className)} />
);


export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (pathname !== '/login') { // Prevent redirect loop if already on login
        router.push('/login');
    }
    return null; 
  }

  const userNavItems = navItems.filter(item => item.roles.includes(user.role));
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  
  const sidebarCollapsibleType = "icon"; 
  const sidebarSidePlacement = "left"; 

  const handleThemeToggle = () => {
    toggleTheme();
  };
  
  const handleUserAvatarClick = () => {
    router.push('/perfil');
  };

  return (
    <SidebarProvider 
        defaultOpen={true} 
        collapsible={sidebarCollapsibleType} 
        side={sidebarSidePlacement}
    >
      <Sidebar collapsible={sidebarCollapsibleType} variant="sidebar" side={sidebarSidePlacement}>
        <SidebarRail />
        <SidebarHeader>
            {/* Logo/Title logic is handled within SidebarHeader now */}
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {userNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/dashboard-geral' && item.href !== '/dashboard-nutricionista' && item.href !== '/inicio' && pathname.startsWith(item.href));
              if (item.href === '/flowbuilder/meus-fluxos' && pathname === '/flowbuilder') {
                // Special case for /flowbuilder to also activate /flowbuilder/meus-fluxos
                // This might need refinement if /flowbuilder itself becomes a distinct page
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
                    <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.name} data-ai-hint="profile avatar" />
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
              <SidebarMenuButton
                asChild
                tooltip={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                onClick={handleThemeToggle}
              >
                <div
                  onKeyDown={(e) => { 
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleThemeToggle();
                    }
                  }}
                  tabIndex={0} 
                  role="menuitemcheckbox"
                  aria-checked={theme === 'dark'}
                >
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  <span className="flex-grow">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={handleThemeToggle}
                    aria-label="Alternar tema"
                    className="ml-auto group-data-[collapsible=icon]:hidden shrink-0"
                    onClick={(e) => {
                      e.stopPropagation(); 
                    }}
                  />
                </div>
              </SidebarMenuButton>
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

      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 pt-12 md:pt-6 overflow-auto h-screen"> {/* Adjusted padding for mobile */}
           <div className="md:hidden fixed top-2 left-2 z-50">
             <SidebarTrigger>
                <Menu />
             </SidebarTrigger>
           </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
