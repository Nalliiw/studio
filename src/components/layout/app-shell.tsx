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
  CalendarDays, // For Agenda
  Sparkles, // For NutriTrack logo icon
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  subItems?: NavItem[]; // For nested items like Agenda under Pacientes
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
    // Example of how Agenda could be linked from here, actual navigation to specific patient agenda would be from patient list
    // subItems: [
    //   { href: '/pacientes', label: 'Ver Pacientes', icon: Users, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
    //   // Dynamic link, would need logic to go to a specific patient's agenda or a general agenda management page
    //   // { href: '/agenda-geral', label: 'Agendas', icon: CalendarDays, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] }
    // ]
  },
  { href: '/flowbuilder', label: 'Criador de Fluxos', icon: Workflow, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library, roles: [UserRole.NUTRITIONIST_WHITE_LABEL] },
  // Paciente
  { href: '/inicio', label: 'Início', icon: Home, roles: [UserRole.PATIENT] },
  { href: '/formulario', label: 'Formulários', icon: ClipboardList, roles: [UserRole.PATIENT] },
  { href: '/conteudos', label: 'Conteúdos', icon: PlaySquare, roles: [UserRole.PATIENT] },
  { href: '/elogios', label: 'Elogios', icon: Award, roles: [UserRole.PATIENT] },
];

// Simple NutriTrack Icon for collapsed sidebar
const NutriTrackIcon = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-7 w-7 text-sidebar-primary", className)} />
);


export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme(); // Changed to get theme and toggleTheme directly

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

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <SidebarProvider 
        defaultOpen={true} 
        collapsible={sidebarCollapsibleType} 
        side={sidebarSidePlacement}
    >
      <Sidebar collapsible={sidebarCollapsibleType} variant="sidebar" side={sidebarSidePlacement}>
        <SidebarHeader className="p-4 flex flex-col items-center">
            {/* Logo/Title for expanded sidebar */}
            <div className="group-data-[state=expanded]:flex group-data-[state=collapsed]:group-data-[collapsible=icon]:hidden flex-col items-center">
                <div className="p-2 rounded-md bg-sidebar-primary/10 text-sidebar-primary w-fit">
                    <NutriTrackIcon className="h-8 w-8" />
                </div>
                <h1 className="text-xl font-semibold text-sidebar-foreground mt-2">NutriTrack Lite</h1>
            </div>
            {/* Icon for collapsed sidebar (icon mode) */}
            <div className="group-data-[state=collapsed]:group-data-[collapsible=icon]:flex hidden justify-center w-full my-2">
                 <NutriTrackIcon className="h-8 w-8" />
            </div>
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
                <SidebarMenuButton
                  tooltip={user.name}
                  className="h-auto py-2 group-data-[collapsible=icon]:justify-center cursor-default"
                  asChild={false} 
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
                tooltip={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                onClick={handleThemeToggle}
              >
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  <span className="flex-grow">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={handleThemeToggle} 
                    aria-label="Alternar tema"
                    className="ml-auto group-data-[collapsible=icon]:hidden shrink-0"
                    onClick={(e) => e.stopPropagation()} 
                  />
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
        {/* Removed the fixed header from here */}
        <main className="flex-1 p-6 overflow-auto"> {/* Added overflow-auto for content scroll */}
           <div className="md:hidden fixed top-2 left-2 z-50"> {/* Mobile sidebar trigger */}
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
