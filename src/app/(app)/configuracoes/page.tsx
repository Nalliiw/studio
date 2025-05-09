// src/app/(app)/configuracoes/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ConfiguracoesPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta e preferências.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            Preferências da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userName">Nome</Label>
            <Input id="userName" defaultValue={user?.name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email</Label>
            <Input id="userEmail" type="email" defaultValue={user?.email || ''} disabled />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-base">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber atualizações importantes e lembretes por email.
              </p>
            </div>
            <Switch id="notifications" aria-label="Ativar notificações por email" />
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode" className="text-base">Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">
                Alternar para o tema escuro da aplicação. (Funcionalidade em desenvolvimento)
              </p>
            </div>
            <Switch id="darkMode" aria-label="Ativar modo escuro" disabled />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button>
            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
