
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
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { UserCircle, Settings, LogOut, Moon, Sun, X } from 'lucide-react';

interface MobileMoreOptionsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function MobileMoreOptionsSheet({ isOpen, onOpenChange }: MobileMoreOptionsSheetProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onOpenChange(false); // Close sheet after navigation
  };

  const handleLogout = () => {
    logout();
    onOpenChange(false); // Close sheet after logout
  };
  
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] flex flex-col rounded-t-lg">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-lg text-center">Mais Opções</SheetTitle>
           <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {user && (
                <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleNavigate('/perfil')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigate('/perfil')}
                >
                    <UserCircle className="h-6 w-6 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">Ver Perfil</span>
                    </div>
                </div>
            )}
            <Separator />
            <Button
                variant="ghost"
                className="w-full justify-start text-base py-3 h-auto"
                onClick={() => handleNavigate('/configuracoes')}
            >
                <Settings className="mr-3 h-5 w-5" />
                Configurações
            </Button>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                <Label htmlFor="dark-mode-toggle-sheet" className="flex items-center text-base cursor-pointer">
                {theme === 'dark' ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
                {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </Label>
                <Switch
                id="dark-mode-toggle-sheet"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Alternar tema"
                />
            </div>
             <Separator />
            <Button
                variant="ghost"
                className="w-full justify-start text-base py-3 h-auto text-destructive hover:text-destructive"
                onClick={handleLogout}
            >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
