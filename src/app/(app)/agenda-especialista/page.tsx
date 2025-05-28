
// src/app/(app)/agenda-especialista/page.tsx
'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Clock, Workflow, MessageSquare, User, CalendarDays, Users, ListChecks } from 'lucide-react';
import { format, isSameDay, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { EspecialistaScheduledItem } from '@/types';

const mockEspecialistaAgenda: EspecialistaScheduledItem[] = [
  { id: 'n_sch1', type: 'appointment', title: 'Consulta - Ana Silva', date: new Date().toISOString(), time: '10:00', patientName: 'Ana Silva', patientId: 'p1', description: 'Consulta de acompanhamento.', status: 'scheduled' },
  { id: 'n_sch2', type: 'patient_flow', title: 'Fluxo: Check-in Semanal', date: new Date().toISOString(), time: '11:00', patientName: 'Bruno Costa', patientId: 'p2', description: 'Verificar respostas do fluxo semanal.', status: 'scheduled' },
  { id: 'n_sch3', type: 'personal_reminder', title: 'Preparar material para workshop da clínica', date: new Date().toISOString(), time: '14:00', description: 'Revisar slides e anotações.', status: 'scheduled' },
  { id: 'n_sch4', type: 'appointment', title: 'Consulta - Carlos Lima', date: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), time: '09:00', patientName: 'Carlos Lima', patientId: 'p3', description: 'Primeira consulta.', status: 'scheduled' },
  { id: 'n_sch5', type: 'meeting', title: 'Reunião de equipe da clínica', date: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), time: '16:00', description: 'Alinhamento semanal da equipe.', status: 'scheduled' },
  { id: 'n_sch6', type: 'patient_flow', title: 'Fluxo: Diário Alimentar', date: format(addDays(new Date(), -1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), time: '00:00', patientName: 'Daniela Souza', patientId: 'p4', description: 'Fluxo atribuído para preenchimento.', status: 'completed' },
  { id: 'n_task1', type: 'task_kanban', kanbanTaskId: 'task4_especialista', kanbanTaskTitle: 'Desenvolver Novo Fluxo Pós-Parto', title: 'Tarefa: Desenvolver Fluxo Pós-Parto', date: format(addDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), time: 'Dia todo', description: 'Vencimento da tarefa do Kanban: Criar novo fluxo de acompanhamento focado no período pós-parto.', status: 'pending' },
  { id: 'n_task2', type: 'task_kanban', kanbanTaskId: 'task3_especialista', kanbanTaskTitle: 'Follow-up Paciente Y', title: 'Tarefa: Follow-up Paciente Y', date: new Date().toISOString(), time: '17:00', description: 'Vencimento da tarefa do Kanban: Agendar e preparar questionário.', status: 'pending' },
];

const AgendaItemIcon = ({ type }: { type: EspecialistaScheduledItem['type'] }) => {
  switch (type) {
    case 'appointment': return <User className="h-5 w-5 text-purple-500" />;
    case 'patient_flow': return <Workflow className="h-5 w-5 text-blue-500" />;
    case 'personal_reminder': return <MessageSquare className="h-5 w-5 text-orange-500" />;
    case 'meeting': return <Users className="h-5 w-5 text-green-500" />;
    case 'task_kanban': return <ListChecks className="h-5 w-5 text-teal-500" />;
    default: return <List className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadgeVariant = (status?: EspecialistaScheduledItem['status']) => {
  switch (status) {
    case 'scheduled': return 'default';
    case 'completed': return 'secondary';
    case 'cancelled': return 'destructive';
    case 'pending': return 'outline';
    default: return 'outline';
  }
};

const getStatusText = (status?: EspecialistaScheduledItem['status']) => {
    switch (status) {
        case 'scheduled': return 'Agendado';
        case 'completed': return 'Concluído';
        case 'cancelled': return 'Cancelado';
        case 'pending': return 'Pendente';
        default: return 'Status Desconhecido';
    }
};

export default function AgendaEspecialistaPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const scheduledItemsForSelectedDate = selectedDate
    ? mockEspecialistaAgenda.filter(item => isSameDay(parseISO(item.date), selectedDate))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda do Especialista</h1>
            <p className="text-muted-foreground">Visão consolidada dos seus compromissos, tarefas e agendamentos.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
              modifiers={{
                scheduled: mockEspecialistaAgenda.map(item => parseISO(item.date))
              }}
              modifiersStyles={{
                scheduled: { fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'hsl(var(--primary))', textUnderlineOffset: '0.2em' }
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>
              Eventos para {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : 'Nenhuma data selecionada'}
            </CardTitle>
            <CardDescription>
              {scheduledItemsForSelectedDate.length > 0
                ? `Você tem ${scheduledItemsForSelectedDate.length} item(ns) para este dia.`
                : 'Nenhum evento para este dia.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledItemsForSelectedDate.length > 0 ? (
              scheduledItemsForSelectedDate.sort((a,b) => (a.time || "00:00").localeCompare(b.time || "00:00")).map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="pt-1">
                    <AgendaItemIcon type={item.type} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.status && (
                             <Badge
                                variant={getStatusBadgeVariant(item.status)}
                                className={cn(
                                    item.status === 'scheduled' && 'bg-blue-100 text-blue-700 border-blue-300',
                                    item.status === 'completed' && 'bg-green-100 text-green-700 border-green-300',
                                    item.status === 'cancelled' && 'bg-red-100 text-red-700 border-red-300',
                                    item.status === 'pending' && 'bg-yellow-100 text-yellow-700 border-yellow-300',
                                )}
                            >
                                {getStatusText(item.status)}
                            </Badge>
                        )}
                    </div>
                    {item.time && <p className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{item.time}</p>}
                    {item.patientName && <p className="text-sm text-foreground mt-0.5">Paciente: {item.patientName}</p>}
                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                    {item.type === 'task_kanban' && item.kanbanTaskTitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">Ref. Kanban: {item.kanbanTaskTitle}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum evento agendado para esta data.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
