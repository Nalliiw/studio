
// src/app/(app)/equipe/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, UsersRound, List, Edit, Trash2, Loader2, AlertTriangle, CheckCircle, MailQuestion } from 'lucide-react';
import Link from 'next/link';
import type { TeamMember } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function EquipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);


  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user?.companyId) {
        setError("ID da clínica não encontrado. Faça login como administrador de uma clínica para gerenciar a equipe.");
        setIsLoading(false);
        if (user) { 
            toast({
              title: "Acesso Negado",
              description: "Você precisa estar logado como administrador de uma clínica para ver a equipe.",
              variant: "destructive",
            });
        }
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

    if (!authLoading && user) { 
      fetchTeamMembers();
    } else if (!authLoading && !user) {
        setError("Usuário não autenticado.");
        setIsLoading(false); 
    }
  }, [user, authLoading]);

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
        case 'active': return 'default'; 
        case 'pending_invitation': return 'secondary'; 
        case 'inactive': return 'outline'; 
        default: return 'outline';
    }
  };

  const handleEditMember = (memberId: string) => {
    router.push(`/equipe/${memberId}/editar`);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/team/${memberToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Falha ao excluir membro.';
        try {
            const responseData = await response.json();
            errorMessage = responseData.error || errorMessage;
        } catch (e) {
            // Could not parse JSON, stick to generic error
        }
        throw new Error(errorMessage);
      }
      setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      toast({ title: "Membro Excluído", description: `O membro "${memberToDelete.name}" foi excluído.` });
    } catch (err) {
      console.error("Erro ao excluir membro:", err);
      toast({
        title: "Erro ao Excluir",
        description: err instanceof Error ? err.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  const handleActivateInvitation = async (member: TeamMember) => {
    setIsActivating(member.id);
    try {
      const response = await fetch(`/api/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Falha ao ativar convite.';
        try {
            const responseData = await response.json();
            errorMessage = responseData.error || errorMessage;
        } catch (e) {
             // Could not parse JSON
        }
        throw new Error(errorMessage);
      }
      setTeamMembers(prev => 
        prev.map(m => m.id === member.id ? { ...m, status: 'active', invitationToken: undefined } : m)
      );
      toast({ title: "Convite Ativado!", description: `O membro "${member.name}" foi ativado.` });
    } catch (err) {
      console.error("Erro ao ativar convite:", err);
      toast({
        title: "Erro ao Ativar",
        description: err instanceof Error ? err.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(null);
    }
  };


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
          {authLoading ? ( 
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p>Carregando dados do usuário...</p>
            </div>
          ) : isLoading ? (
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
                  <div className="flex flex-wrap gap-2 self-start sm:self-center shrink-0 mt-2 sm:mt-0">
                    {member.status === 'pending_invitation' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleActivateInvitation(member)}
                        disabled={isActivating === member.id}
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                      >
                        {isActivating === member.id ? <Loader2 className="h-3 w-3 animate-spin sm:mr-1.5" /> : <CheckCircle className="h-3 w-3 sm:mr-1.5" />}
                        <span className="hidden sm:inline">Ativar Convite</span>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEditMember(member.id)}>
                        <Edit className="h-3 w-3 sm:mr-1.5" />
                        <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setMemberToDelete(member)}>
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
      
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
                Tem certeza que deseja excluir o membro "{memberToDelete?.name}" da equipe? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDeleteMember}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Excluir
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
