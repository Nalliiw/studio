
// src/app/(app)/minha-agenda/page.tsx
'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Clock, Workflow, MessageSquare, Award, CheckCircle } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FlowStep } from '@/types'; // Reusing FlowStep for simplicity, might need specific type later

// Mock data for patient's scheduled items
interface PatientScheduledItem {
  id: string;
  type: 'flow' | 'reminder' | 'appointment' | 'praise' | 'task_completed'; // Added task_completed
  title: string;
  date: string; // ISO String
  time?: string; // HH:mm
  description?: string;
  status?: 'pending' | 'completed' | 'upcoming'; // More granular status
  flowStepsCount?: number; // For flows
}

const mockPatientAgenda: PatientScheduledItem[] = [
  { id: 'ps1', type: 'flow', title: 'Check-in Semanal - Semana 5', date: new Date().toISOString(), time: '09:00', description: 'Responder ao formulário de acompanhamento semanal.', status: 'pending', flowStepsCount: 3 },
  { id: 'ps2', type: 'reminder', title: 'Beber Água', date: new Date().toISOString(), time: '10:00', description: 'Lembre-se de se hidratar ao longo do dia.', status: 'upcoming' },
  { id: 'ps3', type: 'appointment', title: 'Consulta com Nutricionista', date: format(new Date(new Date().setDate(new Date().getDate() + 2)), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'), time: '14:00', description: 'Consulta de retorno online.', status: 'upcoming' },
  { id: 'ps4', type: 'praise', title: 'Conquista da Semana!', date: format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'), description: 'Parabéns por atingir sua meta de passos diários!', status: 'completed' },
  { id: 'ps5', type: 'flow', title: 'Questionário de Hábitos de Sono', date: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'), time: '11:00', description: 'Avalie seus hábitos de sono recentes.', status: 'pending', flowStepsCount: 5 },
  { id: 'ps6', type: 'task_completed', title: 'Responder formulário "Check-in Semanal - Semana 4"', date: format(new Date(new Date().setDate(new Date().getDate() - 3)), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'), status: 'completed'},
];


const AgendaIcon = ({ type }: { type: PatientScheduledItem['type'] }) => {
  switch (type) {
    case 'flow': return <Workflow className="h-5 w-5 text-blue-500" />;
    case 'reminder': return <MessageSquare className="h-5 w-5 text-orange-500" />;
    case 'appointment': return <Clock className="h-5 w-5 text-purple-500" />;
    case 'praise': return <Award className="h-5 w-5 text-yellow-500" />;
    case 'task_completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
    default: return <List className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadgeVariant = (status?: PatientScheduledItem['status']) => {
  switch (status) {
    case 'pending': return 'destructive';
    case 'completed': return 'default'; // Default is usually primary color, let's make it green like
    case 'upcoming': return 'secondary';
    default: return 'outline';
  }
};
const getStatusText = (status?: PatientScheduledItem['status']) => {
    switch (status) {
        case 'pending': return 'Pendente';
        case 'completed': return 'Concluído';
        case 'upcoming': return 'Próximo';
        default: return 'Agendado';
    }
}


export default function MinhaAgendaPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const scheduledItemsForSelectedDate = selectedDate
    ? mockPatientAgenda.filter(item => isSameDay(parseISO(item.date), selectedDate))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Agenda</h1>
        <p className="text-muted-foreground">Acompanhe seus fluxos, lembretes e compromissos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
              modifiers={{
                scheduled: mockPatientAgenda.map(item => parseISO(item.date))
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
                    <AgendaIcon type={item.type} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.status && (
                             <Badge 
                                variant={getStatusBadgeVariant(item.status)} 
                                className={item.status === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                            >
                                {getStatusText(item.status)}
                            </Badge>
                        )}
                    </div>
                    {item.time && <p className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{item.time}</p>}
                    {item.description && <p className="text-sm text-foreground mt-1">{item.description}</p>}
                    {item.type === 'flow' && item.flowStepsCount && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.flowStepsCount} etapa(s)</p>
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
