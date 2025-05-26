
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
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { UserCircle, Settings, LogOut, Moon, Sun, HelpCircle, CalendarClock, Users as UsersIcon, Kanban } from 'lucide-react'; 
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
  
  // Combine a base set of "more" options with any dynamically passed additionalNavItems
  const baseMoreOptions: NavItem[] = [
    { href: '/perfil', label: 'Ver Perfil', icon: UserCircle, roles: [UserRole.ADMIN_SUPREMO, UserRole.CLINIC_SPECIALIST, UserRole.PATIENT] },
    // Add other static "more" items if any
  ];

  const allPotentialSheetItems: NavItem[] = [
    ...baseMoreOptions,
    ...additionalNavItems,
    // Ensure these ADMIN_SUPREMO specific items are only added if not already in additionalNavItems
    // or define them as base if they ALWAYS appear in "more" for admin.
    // For now, let additionalNavItems take precedence if there are overlaps.
  ];
  
  // Filter unique items and then filter by role
  const uniqueSheetItems = allPotentialSheetItems.reduce((acc, current) => {
    const x = acc.find(item => item.href === current.href && item.label === current.label);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as NavItem[]);

  const finalSheetItems = uniqueSheetItems.filter(item => user && item.roles.includes(user.role as UserRole));


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] flex flex-col rounded-t-lg p-0">
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-lg text-center">Mais Opções</SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-1">
            {finalSheetItems.map(item => (
                <Button
                    key={`${item.href}-${item.label}`}
                    variant="ghost"
                    className="w-full justify-start text-base py-3 h-auto gap-3"
                    onClick={() => handleNavigate(item.href)}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Button>
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
