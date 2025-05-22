
// src/app/(app)/equipe/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, UsersRound, List } from 'lucide-react';
import Link from 'next/link';

// Mock data - substituir por dados reais ou chamada de API
const mockTeamMembers = [
  { id: 'tm1', name: 'Dr. Carlos Andrade', email: 'carlos.andrade@clinica.com', role: 'Especialista Chefe' },
  { id: 'tm2', name: 'Fernanda Lima', email: 'fernanda.lima@clinica.com', role: 'Especialista' },
  { id: 'tm3', name: 'Roberto Dias', email: 'roberto.dias@clinica.com', role: 'Especialista (Nutrição Esportiva)' },
];

export default function EquipePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UsersRound className="mr-3 h-8 w-8 text-primary" />
            Gerenciamento de Equipe
          </h1>
          <p className="text-muted-foreground">Adicione e gerencie os membros da equipe da sua clínica.</p>
        </div>
        <Link href="/equipe/novo" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Membro
          </Button>
        </Link>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            {mockTeamMembers.length > 0 
              ? `Você tem ${mockTeamMembers.length} membro(s) na equipe.` 
              : 'Nenhum membro na equipe ainda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockTeamMembers.length > 0 ? (
            <ul className="space-y-4">
              {mockTeamMembers.map((member) => (
                <li key={member.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs bg-secondary text-secondary-foreground inline-block px-2 py-0.5 rounded-full mt-1">{member.role}</p>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum membro cadastrado na equipe.</p>
              <p className="text-sm">Clique em "Adicionar Novo Membro" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
