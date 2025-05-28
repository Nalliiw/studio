
// src/app/(app)/mensagens/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesSquare, Archive, Inbox } from 'lucide-react';

export default function MensagensPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <MessagesSquare className="mr-3 h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Mensagens</h1>
          <p className="text-muted-foreground">Gerencie todas as suas conversas e mensagens.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Inbox className="mr-2 h-5 w-5 text-green-500" />
              Chats Ativos (3)
            </CardTitle>
            <CardDescription>Conversas recentes e em andamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Funcionalidade de chat em desenvolvimento.</p>
            {/* Placeholder para lista de chats ativos */}
            <div className="mt-2 space-y-2">
              <div className="p-2 border rounded-md bg-muted/50">Conversa com Clínica A...</div>
              <div className="p-2 border rounded-md bg-muted/50">Mensagem de Paciente B...</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessagesSquare className="mr-2 h-5 w-5 text-orange-500" />
              Mensagens Pendentes (1)
            </CardTitle>
            <CardDescription>Mensagens aguardando sua resposta.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Funcionalidade de chat em desenvolvimento.</p>
             {/* Placeholder para lista de mensagens pendentes */}
             <div className="mt-2 space-y-2">
              <div className="p-2 border rounded-md bg-muted/50">Re: Dúvida sobre plano alimentar...</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Archive className="mr-2 h-5 w-5 text-blue-500" />
              Arquivadas
            </CardTitle>
            <CardDescription>Conversas antigas ou resolvidas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Funcionalidade de chat em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
       <p className="text-center text-muted-foreground mt-8">
        A interface completa de chat, com listas de conversas, envio e recebimento de mensagens em tempo real, será implementada em breve.
      </p>
    </div>
  );
}
