
// src/components/layout/mobile-more-options-sheet.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose, // Adicionado SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { UserCircle, Settings, LogOut, Moon, Sun, HelpCircle, CalendarClock, Users as UsersIcon, Kanban, LayoutGrid } from 'lucide-react'; 
import { UserRole } from '@/types'; 

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}
interface MobileMoreOptionsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  additionalNavItems?: NavItem[];
}

export default function MobileMoreOptionsSheet({ isOpen, onOpenChange, additionalNavItems = [] }: MobileMoreOptionsSheetProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onOpenChange(false); 
  };

  const handleLogout = () => {
    logout();
    onOpenChange(false); 
  };
  
  const allSheetItems: NavItem[] = [
    // Itens que sempre aparecem se o usuário estiver logado
    { href: '/perfil', label: 'Ver Perfil', icon: UserCircle, roles: [UserRole.ADMIN_SUPREMO, UserRole.CLINIC_SPECIALIST, UserRole.PATIENT] },
    // Adiciona os itens passados por props
    ...additionalNavItems,
    // Adiciona itens específicos de Admin Supremo que podem não estar no navItems principal se a lógica de filtro for diferente
    { href: '/central-ajuda', label: 'Central de Ajuda', icon: HelpCircle, roles: [UserRole.ADMIN_SUPREMO] },
    { href: '/agenda-admin', label: 'Agenda Admin', icon: CalendarClock, roles: [UserRole.ADMIN_SUPREMO] },
    { href: '/admin/equipe', label: 'Equipe Admin', icon: UsersIcon, roles: [UserRole.ADMIN_SUPREMO] },
    // Adiciona o novo CRM (Tarefas) para Admin e Especialista
    { href: '/kanban-tarefas', label: 'CRM (Tarefas)', icon: LayoutGrid, roles: [UserRole.ADMIN_SUPREMO, UserRole.CLINIC_SPECIALIST] },
  ];

  // Filtra e remove duplicados, mantendo a ordem de `allSheetItems`
  const uniqueSheetItems = allSheetItems.reduce((acc, current) => {
    const x = acc.find(item => item.href === current.href && item.label === current.label);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as NavItem[]);


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] flex flex-col rounded-t-lg p-0">
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-lg text-center">Mais Opções</SheetTitle>
          {/* O SheetContent já adiciona um botão X por padrão. Se você quiser um customizado, pode usar SheetClose aqui */}
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-1">
            {user && uniqueSheetItems.map(item => (
                 item.roles.includes(user?.role as UserRole) && ( 
                    <Button
                        key={`${item.href}-${item.label}`}
                        variant="ghost"
                        className="w-full justify-start text-base py-3 h-auto gap-3"
                        onClick={() => handleNavigate(item.href)}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Button>
                 )
            ))}
            
            <Separator className="my-2"/>

            <Button
                variant="ghost"
                className="w-full justify-start text-base py-3 h-auto gap-3"
                onClick={() => handleNavigate('/configuracoes')}
            >
                <Settings className="h-5 w-5" />
                Config. da Conta
            </Button>

            <div 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted text-base h-auto cursor-pointer gap-3"
                onClick={toggleTheme}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
            >
                <div className="flex items-center gap-3">
                 {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                 <Label htmlFor="dark-mode-toggle-sheet" className="cursor-pointer">
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                 </Label>
                </div>
                <Switch
                    id="dark-mode-toggle-sheet"
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    aria-label="Alternar tema"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
             <Separator className="my-2"/>
            <Button
                variant="ghost"
                className="w-full justify-start text-base py-3 h-auto text-destructive hover:text-destructive gap-3"
                onClick={handleLogout}
            >
                <LogOut className="h-5 w-5" />
                Sair
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
