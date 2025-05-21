
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Search, Eye, Edit, PlayCircle, Trash2, CalendarPlus, Workflow, Loader2, AlertTriangle } from 'lucide-react';
import type { Flow } from '@/types'; 
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card'; 
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function MeusFluxosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [flows, setFlows] = useState<Flow[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchFlows = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setError("Usuário não autenticado.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/flows?nutritionistId=${user.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao buscar fluxos.');
        }
        const data: Flow[] = await response.json();
        setFlows(data);
      } catch (err) {
        console.error("Erro ao buscar fluxos:", err);
        setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
        fetchFlows();
    } else {
        // Se o usuário não estiver disponível imediatamente, podemos aguardar ou lidar com isso.
        // Por agora, vamos apenas não buscar se não houver ID.
        setIsLoading(false); 
    }
  }, [user?.id]);

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteFlow = async () => {
    if (!flowToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/flows/${flowToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir fluxo.');
      }
      setFlows(prevFlows => prevFlows.filter(f => f.id !== flowToDelete.id));
      toast({ title: "Fluxo Removido", description: `O fluxo "${flowToDelete.name}" foi removido com sucesso.` });
    } catch (err) {
      toast({ title: "Erro ao Remover Fluxo", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setFlowToDelete(null);
    }
  };
  
  const handleToggleStatus = async (flow: Flow) => {
    let newStatus: Flow['status'] = 'draft';
    if (flow.status === 'draft') newStatus = 'active';
    else if (flow.status === 'active') newStatus = 'archived';
    else if (flow.status === 'archived') newStatus = 'draft';

    try {
        const response = await fetch(`/api/flows/${flow.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao alterar status do fluxo.');
        }
        setFlows(prevFlows => prevFlows.map(f => f.id === flow.id ? {...f, status: newStatus, lastModified: new Date().toISOString()} : f));
        toast({ title: "Status Alterado", description: `Fluxo "${flow.name}" agora está ${newStatus === 'active' ? 'ativo' : (newStatus === 'draft' ? 'como rascunho' : 'arquivado')}.` });
    } catch (err) {
        toast({ title: "Erro ao Alterar Status", description: (err as Error).message, variant: "destructive" });
    }
  };

  const getStatusText = (status?: Flow['status']) => {
    if (status === 'active') return 'Ativo';
    if (status === 'draft') return 'Rascunho';
    if (status === 'archived') return 'Arquivado';
    return 'Desconhecido';
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <Workflow className="mr-3 h-8 w-8 text-primary" />
                Meus Fluxos de Acompanhamento
            </h1>
            <p className="text-muted-foreground">Gerencie seus fluxos de perguntas e interações com pacientes.</p>
        </div>
        <Link href="/flowbuilder" passHref> 
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Fluxo</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar fluxos por nome..."
          className="pl-10 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar fluxos"
        />
      </div>

      <Card className="shadow-md flex-grow">
        <CardContent className="p-0 h-full">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Carregando fluxos...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-destructive p-10 text-center">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Erro ao carregar fluxos</p>
                <p className="text-sm mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
          ) : filteredFlows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Fluxo</TableHead>
                  <TableHead>Última Modificação</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Atribuições</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlows.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell className="font-medium">{flow.name}</TableCell>
                    <TableCell>{flow.lastModified ? format(parseISO(flow.lastModified as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={flow.status === 'active' ? 'default' : (flow.status === 'draft' ? 'secondary' : 'outline')}
                             className={cn(
                                flow.status === 'active' && 'bg-green-500 hover:bg-green-600 text-white',
                                flow.status === 'draft' && 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900',
                                flow.status === 'archived' && 'bg-gray-400 hover:bg-gray-500 text-gray-800'
                             )}
                      >
                        {getStatusText(flow.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{flow.patientAssignments || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Ações para ${flow.name}`}>
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => router.push(`/flowbuilder?edit=${flow.id}`)}> 
                            <Edit className="mr-2 h-4 w-4" /> Editar Fluxo
                          </DropdownMenuItem>
                           <DropdownMenuItem onSelect={() => alert(`Visualizar ${flow.name}`)}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleToggleStatus(flow)}>
                            <PlayCircle className="mr-2 h-4 w-4" /> 
                            {flow.status === 'active' ? 'Arquivar' : (flow.status === 'draft' ? 'Ativar' : 'Reativar (Rascunho)')}
                          </DropdownMenuItem>
                           <DropdownMenuItem onSelect={() => alert(`Atribuir ${flow.name} a pacientes`)}>
                            <CalendarPlus className="mr-2 h-4 w-4" /> Atribuir/Agendar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onSelect={(e) => {e.preventDefault(); setFlowToDelete(flow)}}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir Fluxo
                          </DropdownMenuItem>
                          
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-10">
                <Workflow className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">Nenhum fluxo encontrado.</p>
                <p className="text-sm text-center mb-4">Crie seu primeiro fluxo para começar a interagir com seus pacientes de forma automatizada.</p>
                <Link href="/flowbuilder" passHref>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Fluxo</Button>
                </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!flowToDelete} onOpenChange={(open) => !open && setFlowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fluxo "{flowToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFlowToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFlow} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

