
// src/app/(app)/equipe/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, UsersRound, List, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { TeamMember } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function EquipePage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user?.companyId) {
        setError("ID da clínica não encontrado. Faça login como administrador de uma clínica para gerenciar a equipe.");
        setIsLoading(false);
        toast({
          title: "Acesso Negado",
          description: "Você precisa estar logado como administrador de uma clínica para ver a equipe.",
          variant: "destructive",
        });
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/team?clinicId=${user.companyId}`);
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || 'Falha ao buscar membros da equipe.');
        }
        setTeamMembers(responseData);
      } catch (err) {
        console.error("Erro ao buscar membros da equipe:", err);
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
        setError(errorMessage);
        toast({
          title: "Erro ao Carregar Equipe",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTeamMembers();
    } else {
      setIsLoading(false); 
      // Usuário pode não estar carregado ainda, AuthContext pode redirecionar
    }
  }, [user]);

  const getAccessTypeText = (accessType: TeamMember['accessType']) => {
    if (accessType === 'administrador_clinica') return 'Admin da Clínica';
    if (accessType === 'especialista_padrao') return 'Especialista';
    return 'Desconhecido';
  };
  
  const getStatusText = (status?: TeamMember['status']) => {
    if (status === 'active') return 'Ativo';
    if (status === 'pending_invitation') return 'Convite Pendente';
    if (status === 'inactive') return 'Inativo';
    return 'Desconhecido';
  };

  const getStatusBadgeVariant = (status?: TeamMember['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'active': return 'default'; // Usually primary or green
        case 'pending_invitation': return 'secondary'; // Yellowish or grayish
        case 'inactive': return 'outline'; // Grayish, less prominent
        default: return 'outline';
    }
  };


  // Placeholder para futuras ações de editar/excluir
  const handleEditMember = (memberId: string, memberName: string) => {
    toast({ title: "Ação Indisponível", description: `Editar membro "${memberName}" (ID: ${memberId}) ainda não implementado.`});
  }
  const handleDeleteMember = (memberId: string, memberName: string) => {
    // Aqui futuramente teremos um AlertDialog de confirmação
    toast({ title: "Ação Indisponível", description: `Excluir membro "${memberName}" (ID: ${memberId}) ainda não implementado.`, variant: "destructive"});
  }


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
          {isLoading && <CardDescription>Carregando membros...</CardDescription>}
          {!isLoading && !error && (
            <CardDescription>
              {teamMembers.length > 0 
                ? `Você tem ${teamMembers.length} membro(s) na equipe.` 
                : 'Nenhum membro na equipe ainda.'}
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
          ) : error && !user?.companyId ? ( 
             <div className="h-40 flex flex-col items-center justify-center text-destructive text-center">
                <AlertTriangle className="h-10 w-10 mb-3" />
                <p className="font-semibold mb-1">Acesso Negado</p>
                <p className="text-sm">{error}</p>
            </div>
          ) : error ? (
             <div className="h-40 flex flex-col items-center justify-center text-destructive text-center">
                <AlertTriangle className="h-10 w-10 mb-3" />
                <p className="font-semibold mb-1">Falha ao carregar membros da equipe</p>
                <p className="text-sm">{error}</p>
                 <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Tentar Novamente
                </Button>
            </div>
          ) : teamMembers.length > 0 ? (
            <ul className="space-y-4">
              {teamMembers.map((member) => (
                <li key={member.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                            {getAccessTypeText(member.accessType)}
                        </Badge>
                        <Badge 
                            variant={getStatusBadgeVariant(member.status)} 
                            className={cn(
                                "text-xs",
                                member.status === 'active' && 'bg-green-100 text-green-700 border-green-300',
                                member.status === 'pending_invitation' && 'bg-yellow-100 text-yellow-700 border-yellow-300',
                                member.status === 'inactive' && 'bg-slate-100 text-slate-600 border-slate-300'
                            )}
                        >
                            {getStatusText(member.status)}
                        </Badge>
                    </div>
                    {member.specialties && member.specialties.length > 0 && (
                      <p className="text-xs text-primary mt-1.5">
                        Especialidades: {member.specialties.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 self-start sm:self-center shrink-0 mt-2 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={() => handleEditMember(member.id, member.name)}>
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
              <p>Nenhum membro cadastrado na equipe.</p>
              <p className="text-sm">Clique em "Adicionar Novo Membro" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

