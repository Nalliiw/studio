
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
import { MoreHorizontal, PlusCircle, Search, Eye, Edit, PlayCircle, Trash2, CalendarPlus, Workflow } from 'lucide-react';
import type { Flow, FlowStep } from '@/types'; 
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Mock data for flows
const mockFlows: (Flow & { lastModified: string; status: 'draft' | 'active' | 'archived'; patientAssignments: number })[] = [
  { 
    id: 'flow1', 
    name: 'Questionário Inicial Completo', 
    steps: [
      { id: 'f1_step1', type: 'information_text', title: 'Bem-vindo ao Questionário', config: { text: 'Este é o questionário inicial completo.' }, position: {x: 50, y: 50}},
      { id: 'f1_step2', type: 'text_input', title: 'Seu Nome', config: { text: 'Qual o seu nome completo?', defaultNextStepId: 'f1_step3', placeholder: 'Nome Completo' }, position: {x: 350, y: 50}},
      { id: 'f1_step3', type: 'single_choice', title: 'Seu Sexo', config: { text: 'Qual o seu sexo?', options: [{value: 'm', label: 'Masculino'}, {value: 'f', label: 'Feminino'}]}, position: {x: 50, y: 300}},
    ], 
    nutritionistId: 'n1', 
    lastModified: '2024-05-28T10:00:00Z', 
    status: 'active', 
    patientAssignments: 15 
  },
  { id: 'flow2', name: 'Check-in Semanal Rápido', steps: [], nutritionistId: 'n1', lastModified: '2024-05-25T14:30:00Z', status: 'draft', patientAssignments: 0 },
  { id: 'flow3', name: 'Avaliação de Hábitos Alimentares (v2)', steps: [], nutritionistId: 'n1', lastModified: '2024-05-20T09:15:00Z', status: 'active', patientAssignments: 8 },
  { id: 'flow_old', name: 'Questionário de Satisfação (Antigo)', steps: [], nutritionistId: 'n1', lastModified: '2023-12-10T11:00:00Z', status: 'archived', patientAssignments: 22 },
];

export default function MeusFluxosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [flows, setFlows] = useState(mockFlows); 
  const router = useRouter();

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteFlow = (flowId: string) => {
    setFlows(prevFlows => prevFlows.filter(f => f.id !== flowId));
    toast({ title: "Fluxo Removido", description: "O fluxo foi removido com sucesso." });
  };
  
  const handleToggleStatus = (flowId: string) => {
    setFlows(prevFlows => prevFlows.map(f => {
        if (f.id === flowId) {
            let newStatus = f.status === 'active' ? 'draft' : 'active';
            if (f.status === 'archived') newStatus = 'draft'; 
            toast({ title: "Status Alterado", description: `Fluxo agora está ${newStatus === 'active' ? 'ativo' : (newStatus === 'draft' ? 'como rascunho' : 'arquivado')}.` });
            // @ts-ignore
            return {...f, status: newStatus};
        }
        return f;
    }));
  };


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
          {filteredFlows.length > 0 ? (
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
                    <TableCell>{format(new Date(flow.lastModified), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={flow.status === 'active' ? 'default' : (flow.status === 'draft' ? 'secondary' : 'outline')}
                             className={cn(
                                flow.status === 'active' && 'bg-green-500 hover:bg-green-600 text-white',
                                flow.status === 'draft' && 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900',
                                flow.status === 'archived' && 'bg-gray-400 hover:bg-gray-500 text-gray-800'
                             )}
                      >
                        {flow.status === 'active' ? 'Ativo' : (flow.status === 'draft' ? 'Rascunho' : 'Arquivado')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{flow.patientAssignments}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleToggleStatus(flow.id)}>
                            <PlayCircle className="mr-2 h-4 w-4" /> {flow.status === 'active' ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                           <DropdownMenuItem onSelect={() => alert(`Atribuir ${flow.name} a pacientes`)}>
                            <CalendarPlus className="mr-2 h-4 w-4" /> Atribuir/Agendar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDeleteFlow(flow.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
    </div>
  );
}
