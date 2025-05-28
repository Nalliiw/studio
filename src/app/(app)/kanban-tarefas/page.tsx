
// src/app/(app)/kanban-tarefas/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Kanban, PlusCircle, GripVertical, CalendarIcon as CalendarIconLucide, AlertTriangle, Filter, Eye, Minus } from 'lucide-react';
import type { KanbanTask, KanbanTaskStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isValid, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm, type SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';


const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres.' }),
  description: z.string().optional(),
  status: z.enum(['a_fazer', 'em_andamento', 'concluido'], { required_error: "Selecione um status" }),
  assignee: z.string().optional(),
  relatedTo: z.string().optional(),
  priority: z.enum(['Baixa', 'Média', 'Alta']).optional(),
  dueDate: z.string().optional().refine(val => {
    if (!val || val === '') return true; // Optional field
    const date = parseISO(val);
    // Check if date is valid and not in the past (allowing today)
    return isValid(date) && date >= startOfDay(new Date());
  }, { message: "Data inválida ou no passado." }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const initialMockKanbanTasks: KanbanTask[] = [
  { id: 'task1', title: 'Revisar Onboarding Clínica X e verificar documentos pendentes', description: 'Verificar se todos os documentos foram enviados e se o treinamento inicial foi concluído. Este é um texto de descrição um pouco mais longo para testar a quebra de linha e como o card se ajusta ao conteúdo completo sem truncamento excessivo.', status: 'a_fazer', assignee: 'Admin Equipe Suporte Principal com Nome Muito Longo Para Teste de Quebra de Linha no Campo de Responsável Para Garantir que Nao Quebre o Layout', relatedTo: 'Clínica X - Projeto Alpha de Integração Completa e Detalhada Para Testar Limites', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), priority: 'Alta', tags: ['Onboarding'] },
  { id: 'task2', title: 'Preparar Relatório Mensal de Uso da Plataforma para apresentar à diretoria da empresa', description: 'Coletar dados de uso da plataforma e gerar o relatório para a diretoria. Incluir métricas de engajamento, número de novos usuários e feedback geral.', status: 'em_andamento', assignee: 'Admin Equipe BI', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), priority: 'Média', tags: ['Relatório', 'Interno'] },
  { id: 'task3', title: 'Agendar Follow-up Paciente Y e enviar questionário pré-consulta detalhado sobre hábitos alimentares e progresso recente', status: 'a_fazer', assignee: 'Dr. Especialista A', relatedTo: 'Paciente Y', priority: 'Média', tags: ['Paciente'], description: "Entrar em contato com o Paciente Y para agendar a próxima consulta de acompanhamento, discutir os resultados recentes e ajustar o plano alimentar conforme necessário. Preparar questionário com foco em dificuldades, sucessos e novas metas." },
  { id: 'task4', title: 'Desenvolver Novo Fluxo de Acompanhamento: Pós-Parto e Primeiros Cuidados com o bebê, incluindo dicas de amamentação', description: 'Criar um novo fluxo de acompanhamento focado no período pós-parto para pacientes, com informações sobre recuperação, nutrição e cuidados com o recém-nascido.', status: 'a_fazer', assignee: 'Dr. Especialista B', priority: 'Alta', tags: ['Conteúdo', 'Fluxo'] },
  { id: 'task5', title: 'Finalizar Documentação da API v2.1 e revisar exemplos de código para integração de terceiros', status: 'concluido', assignee: 'Admin Equipe Dev', dueDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), priority: 'Alta', tags: ['API', 'Documentação'] },
  { id: 'task6', title: 'Treinamento Novos Especialistas Clínica Z - Módulo Avançado de Uso da Plataforma NutriTrack Lite', description: 'Realizar o treinamento sobre o uso da plataforma para os novos especialistas da Clínica Z, cobrindo funcionalidades avançadas e melhores práticas.', status: 'em_andamento', assignee: 'Admin Equipe Sucesso', relatedTo: 'Clínica Z', dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), priority: 'Alta', tags: ['Treinamento'] },
];

const KANBAN_COLUMNS: { id: KanbanTaskStatus; title: string }[] = [
  { id: 'a_fazer', title: 'A Fazer' },
  { id: 'em_andamento', title: 'Em Andamento' },
  { id: 'concluido', title: 'Concluído' },
];

const priorityBadgeVariant = (priority?: 'Baixa' | 'Média' | 'Alta'): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (priority) {
    case 'Alta': return 'destructive';
    case 'Média': return 'default'; // Changed to default for better contrast than 'warning'
    case 'Baixa': return 'secondary';
    default: return 'outline';
  }
};


export default function KanbanTarefasPage() {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialMockKanbanTasks);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const [filterAssignee, setFilterAssignee] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todas');

  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<KanbanTask | null>(null);

  const formMethods = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'a_fazer',
      priority: 'Média',
      assignee: '',
      relatedTo: '',
      dueDate: '',
    },
  });

  const assignees = useMemo(() => {
    const uniqueAssignees = new Set(tasks.map(task => task.assignee).filter(Boolean) as string[]);
    return ['todos', ...Array.from(uniqueAssignees).sort()];
  }, [tasks]);

  const priorities = useMemo(() => ['todas', 'Baixa', 'Média', 'Alta'], []);


  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const assigneeMatch = filterAssignee === 'todos' || !task.assignee || task.assignee === filterAssignee;
      const priorityMatch = filterPriority === 'todas' || !task.priority || task.priority === filterPriority;
      return assigneeMatch && priorityMatch;
    });
  }, [tasks, filterAssignee, filterPriority]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '1';
    }
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: KanbanTaskStatus) => {
    e.preventDefault();
    const taskIdToMove = e.dataTransfer.getData('taskId');
    if (!taskIdToMove) return;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskIdToMove ? { ...task, status: targetStatus } : task
      )
    );
    const movedTask = tasks.find(t => t.id === taskIdToMove);
    toast({
      title: "Tarefa Movida!",
      description: `A tarefa "${movedTask?.title || taskIdToMove}" foi movida para "${KANBAN_COLUMNS.find(c => c.id === targetStatus)?.title}".`,
    });
  };

  const onSubmitNewTask: SubmitHandler<TaskFormValues> = (data) => {
    const newTask: KanbanTask = {
      id: `task_${Date.now().toString()}`,
      title: data.title,
      description: data.description,
      status: data.status,
      assignee: data.assignee,
      relatedTo: data.relatedTo,
      priority: data.priority,
      dueDate: data.dueDate && data.dueDate !== '' ? new Date(data.dueDate).toISOString() : undefined,
      tags: [], // Placeholder for tags
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    toast({
      title: "Nova Tarefa Adicionada!",
      description: `A tarefa "${newTask.title}" foi criada com sucesso.`,
    });
    setIsNewTaskDialogOpen(false);
    formMethods.reset();
  };
  
  const handleTaskCardClick = (task: KanbanTask) => {
    setSelectedTaskDetail(task);
    setIsTaskDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col p-2">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center">
          <Kanban className="mr-3 h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quadro de Tarefas</h1>
            <p className="text-muted-foreground text-sm">Organize e acompanhe suas tarefas.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewTaskDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-3 border rounded-md bg-card shadow-sm">
        <div className="flex-1 min-w-[180px]">
            <Label htmlFor="filter-assignee" className="text-xs">Filtrar por Responsável</Label>
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger id="filter-assignee" className="h-9 text-xs">
                    <SelectValue placeholder="Responsável..." />
                </SelectTrigger>
                <SelectContent>
                    {assignees.map(assignee => (
                        <SelectItem key={assignee} value={assignee} className="text-xs">{assignee === 'todos' ? 'Todos' : assignee}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
            <Label htmlFor="filter-priority" className="text-xs">Filtrar por Prioridade</Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger id="filter-priority" className="h-9 text-xs">
                    <SelectValue placeholder="Prioridade..." />
                </SelectTrigger>
                <SelectContent>
                    {priorities.map(priority => (
                        <SelectItem key={priority} value={priority} className="text-xs">{priority === 'todas' ? 'Todas' : priority}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      <ScrollArea className="flex-grow whitespace-nowrap pb-4">
        <div className="flex gap-4 h-full">
          {KANBAN_COLUMNS.map(column => {
            const tasksInColumn = filteredTasks
              .filter(task => task.status === column.id)
              .sort((a,b) => { // Basic sort: High > Medium > Low
                const priorityOrder = { 'Alta': 1, 'Média': 2, 'Baixa': 3 };
                return (priorityOrder[a.priority || 'Baixa'] || 4) - (priorityOrder[b.priority || 'Baixa'] || 4);
              });

            return (
              <Card
                key={column.id}
                className="w-[380px] h-full flex flex-col shadow-md bg-muted/50 flex-shrink-0 rounded-lg"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <CardHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 p-4 border-b rounded-t-lg">
                  <CardTitle className="text-base font-semibold">{column.title} ({tasksInColumn.length})</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-grow">
                  <CardContent className="p-3 space-y-3">
                    {tasksInColumn.length > 0 ? (
                      tasksInColumn.map(task => (
                          <Card
                              key={task.id}
                              className="shadow-sm bg-card hover:shadow-md transition-shadow cursor-grab w-full max-w-[360px] overflow-hidden select-none rounded-md"
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => handleTaskCardClick(task)}
                          >
                            <CardHeader className="p-3 pb-2">
                              <div
                                className="w-full h-5 flex items-center justify-center cursor-grab mb-2 bg-muted/30 rounded-t-sm select-none active:bg-muted/50 -mx-3 -mt-3 rounded-b-none"
                              >
                                <Minus className="h-4 w-4 text-muted-foreground/60" />
                              </div>
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-grow min-w-0">
                                  <CardTitle className="text-sm font-semibold break-all">
                                    {task.title}
                                  </CardTitle>
                                </div>
                              </div>
                              {task.priority && (
                                <Badge variant={priorityBadgeVariant(task.priority)} className="mt-1 text-xs w-fit">{task.priority}</Badge>
                              )}
                            </CardHeader>
                            <CardContent className="p-3 pt-1 text-xs space-y-1.5">
                               {task.description && (
                                <p className="text-muted-foreground break-all whitespace-normal">
                                  {task.description}
                                </p>
                              )}
                               {task.assignee && (
                                  <div className="flex items-baseline gap-1">
                                    <strong className="flex-shrink-0 whitespace-nowrap">Responsável:</strong>
                                    <span className="text-muted-foreground min-w-0 break-all">{task.assignee}</span>
                                  </div>
                                )}
                                {task.relatedTo && (
                                  <div className="flex items-baseline gap-1">
                                    <strong className="flex-shrink-0 whitespace-nowrap">Ref:</strong>
                                    <span className="text-muted-foreground min-w-0 break-all">{task.relatedTo}</span>
                                  </div>
                                )}
                            </CardContent>
                            {task.dueDate && (
                              <CardFooter className="p-3 pt-1 text-xs text-muted-foreground border-t">
                                 <CalendarIconLucide className="mr-1.5 h-3.5 w-3.5" />
                                 Venc: {isValid(parseISO(task.dueDate)) ? format(parseISO(task.dueDate), "dd/MM/yy", { locale: ptBR }) : "Data inválida"}
                              </CardFooter>
                            )}
                          </Card>
                        ))
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <p className="text-sm">Nenhuma tarefa aqui.</p>
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            );
          })}
          <Button
            variant="outline"
            className="h-full w-20 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 flex-shrink-0 rounded-lg"
            onClick={() => toast({
              title: "Funcionalidade em Desenvolvimento",
              description: "A capacidade de adicionar colunas personalizadas será implementada em breve.",
            })}
          >
            <PlusCircle className="h-6 w-6 mb-1" />
            <span className="text-xs">Coluna</span>
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Modal para Adicionar Nova Tarefa */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
            <DialogDescription>Preencha os detalhes da nova tarefa.</DialogDescription>
          </DialogHeader>
          <Form {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmitNewTask)} className="space-y-4 py-2">
              <FormField
                control={formMethods.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Tarefa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formMethods.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={formMethods.control}
                  name="status"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status inicial" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {KANBAN_COLUMNS.map(col => <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formMethods.control}
                  name="assignee"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Responsável (Opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do responsável" />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />
                <FormField
                  control={formMethods.control}
                  name="relatedTo"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Relacionado a (Opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Clínica ABC, Paciente Z" />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={formMethods.control}
                      name="priority"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                            <Select onValueChange={field.onChange as (value: 'Baixa' | 'Média' | 'Alta') => void} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              <SelectItem value="Baixa">Baixa</SelectItem>
                              <SelectItem value="Média">Média</SelectItem>
                              <SelectItem value="Alta">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={formMethods.control}
                      name="dueDate"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Data de Vencimento (Opcional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={formMethods.formState.isSubmitting}>
                  {formMethods.formState.isSubmitting ? 'Salvando...' : 'Adicionar Tarefa'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para Detalhes da Tarefa */}
      {selectedTaskDetail && (
        <Dialog open={isTaskDetailModalOpen} onOpenChange={setIsTaskDetailModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="break-all">{selectedTaskDetail.title}</DialogTitle>
              <DialogDescription>
                Status: {KANBAN_COLUMNS.find(c => c.id === selectedTaskDetail.status)?.title || 'Desconhecido'}
                {selectedTaskDetail.priority && ` | Prioridade: ${selectedTaskDetail.priority}`}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow my-4 pr-2">
              <div className="space-y-3 text-sm">
                {selectedTaskDetail.description && (
                  <div>
                    <Label className="font-semibold">Descrição:</Label>
                    <p className="text-muted-foreground whitespace-pre-wrap break-all">{selectedTaskDetail.description}</p>
                  </div>
                )}
                {selectedTaskDetail.assignee && (
                  <div>
                    <Label className="font-semibold">Responsável:</Label>
                    <p className="text-muted-foreground break-all">{selectedTaskDetail.assignee}</p>
                  </div>
                )}
                {selectedTaskDetail.relatedTo && (
                  <div>
                    <Label className="font-semibold">Relacionado a:</Label>
                    <p className="text-muted-foreground break-all">{selectedTaskDetail.relatedTo}</p>
                  </div>
                )}
                {selectedTaskDetail.dueDate && (
                  <div>
                    <Label className="font-semibold">Data de Vencimento:</Label>
                    <p className="text-muted-foreground">
                      {isValid(parseISO(selectedTaskDetail.dueDate)) ? format(parseISO(selectedTaskDetail.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Data inválida"}
                    </p>
                  </div>
                )}
                {selectedTaskDetail.tags && selectedTaskDetail.tags.length > 0 && (
                  <div>
                    <Label className="font-semibold">Tags:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTaskDetail.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-auto">
              <Button variant="outline" onClick={() => setIsTaskDetailModalOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
    
