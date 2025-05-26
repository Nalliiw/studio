
// src/app/(app)/admin/equipe/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, List, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { AdminTeamMember } from '@/types'; // Novo tipo para equipe admin
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Mock data para a equipe administrativa
const mockAdminTeamMembers: AdminTeamMember[] = [
  { id: 'adm_tm1', name: 'Carlos Pereira', email: 'carlos.pereira@nutritrack.com', roleAdminTeam: 'Suporte Técnico Nível 2', status: 'active', addedAt: new Date().toISOString() },
  { id: 'adm_tm2', name: 'Beatriz Almeida', email: 'beatriz.almeida@nutritrack.com', roleAdminTeam: 'Gerente de Contas', status: 'active', addedAt: new Date().toISOString() },
  { id: 'adm_tm3', name: 'Fernando Costa', email: 'fernando.costa@nutritrack.com', roleAdminTeam: 'Desenvolvedor Backend', status: 'inactive', addedAt: new Date().toISOString() },
];


export default function AdminEquipePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [adminTeamMembers, setAdminTeamMembers] = useState<AdminTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchAdminTeamMembers = async () => {
      // Simulação de busca - substituir por chamada de API no futuro
      setIsLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay
      setAdminTeamMembers(mockAdminTeamMembers);
      setIsLoading(false);
    };

    if (user?.role === 'administrador_supremo') {
      fetchAdminTeamMembers();
    } else {
      setError("Acesso negado.");
      setIsLoading(false);
    }
  }, [user]);

  const handleEditMember = (memberId: string) => {
    toast({ title: "Ação: Editar Membro Admin", description: `Editar membro ${memberId} (funcionalidade em desenvolvimento).` });
    // router.push(`/admin/equipe/${memberId}/editar`); // Futura rota
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
     toast({ title: "Ação: Excluir Membro Admin", description: `Excluir membro ${memberName} (funcionalidade em desenvolvimento).` });
    // Implementar diálogo de confirmação e chamada de API no futuro
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Equipe Administrativa
          </h1>
          <p className="text-muted-foreground">Gerencie os membros da equipe interna da plataforma.</p>
        </div>
        <Link href="/admin/equipe/novo" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Membro à Equipe Admin
          </Button>
        </Link>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Membros da Equipe Administrativa</CardTitle>
          {isLoading && <CardDescription>Carregando membros...</CardDescription>}
          {!isLoading && !error && (
            <CardDescription>
              {adminTeamMembers.length > 0 
                ? `Você tem ${adminTeamMembers.length} membro(s) na equipe administrativa.` 
                : 'Nenhum membro na equipe administrativa ainda.'}
            </CardDescription>
          )}
          {!isLoading && error && <CardDescription className="text-destructive">Erro: {error}</CardDescription>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p>Carregando membros da equipe...</p>
            </div>
          ) : error ? (
             <div className="h-40 flex flex-col items-center justify-center text-destructive text-center">
                <AlertTriangle className="h-10 w-10 mb-3" />
                <p className="font-semibold mb-1">Falha ao carregar equipe</p>
                <p className="text-sm">{error}</p>
            </div>
          ) : adminTeamMembers.length > 0 ? (
            <ul className="space-y-4">
              {adminTeamMembers.map((member) => (
                <li key={member.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-primary mt-0.5">{member.roleAdminTeam}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 self-start sm:self-center">
                    <Badge 
                        variant={member.status === 'active' ? 'default' : 'outline'} 
                        className={cn(member.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-slate-100 text-slate-600 border-slate-300', "text-xs")}
                    >
                        {member.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start sm:self-center shrink-0 mt-2 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={() => handleEditMember(member.id)}>
                        <Edit className="h-3 w-3 sm:mr-1.5" />
                        <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteMember(member.id, member.name)}>
                        <Trash2 className="h-3 w-3 sm:mr-1.5" />
                        <span className="hidden sm:inline">Excluir</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum membro cadastrado na equipe administrativa.</p>
              <p className="text-sm">Clique em "Adicionar Membro" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
