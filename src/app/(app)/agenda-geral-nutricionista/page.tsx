
// src/app/(app)/agenda-geral-nutricionista/page.tsx
'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Clock, Workflow, MessageSquare, User, CalendarDays, Users } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils'; // Added missing import

// Definindo o tipo para os itens da agenda do nutricionista
interface NutricionistaScheduledItem {
  id: string;
  type: 'appointment' | 'patient_flow' | 'personal_reminder' | 'meeting';
  title: string;
  date: string; // ISO String
  time?: string; // HH:mm
  description?: string;
  patientName?: string; // Para consultas e fluxos de pacientes
  patientId?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

// Mock data para a agenda geral do nutricionista
const mockNutricionistaAgenda: NutricionistaScheduledItem[] = [
  { id: 'n_sch1', type: 'appointment', title: 'Consulta - Ana Silva', date: new Date().toISOString(), time: '10:00', patientName: 'Ana Silva', patientId: 'p1', description: 'Consulta de acompanhamento.', status: 'scheduled' },
  { id: 'n_sch2', type: 'patient_flow', title: 'Fluxo: Check-in Semanal', date: new Date().toISOString(), time: '11:00', patientName: 'Bruno Costa', patientId: 'p2', description: 'Verificar respostas do fluxo semanal.', status: 'scheduled' },
  { id: 'n_sch3', type: 'personal_reminder', title: 'Preparar material para workshop', date: new Date().toISOString(), time: '14:00', description: 'Revisar slides e anotações.', status: 'scheduled' },
  { id: 'n_sch4', type: 'appointment', title: 'Consulta - Carlos Lima', date: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'), time: '09:00', patientName: 'Carlos Lima', patientId: 'p3', description: 'Primeira consulta.', status: 'scheduled' },
  { id: 'n_sch5', type: 'meeting', title: 'Reunião de equipe', date: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'), time: '16:00', description: 'Alinhamento semanal da clínica.', status: 'scheduled' },
  { id: 'n_sch6', type: 'patient_flow', title: 'Fluxo: Diário Alimentar', date: format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'), time: '00:00', patientName: 'Daniela Souza', patientId: 'p4', description: 'Fluxo atribuído para preenchimento.', status: 'completed' },
];

const AgendaItemIcon = ({ type }: { type: NutricionistaScheduledItem['type'] }) => {
  switch (type) {
    case 'appointment': return <User className="h-5 w-5 text-purple-500" />;
    case 'patient_flow': return <Workflow className="h-5 w-5 text-blue-500" />;
    case 'personal_reminder': return <MessageSquare className="h-5 w-5 text-orange-500" />;
    case 'meeting': return <Users className="h-5 w-5 text-green-500" />;
    default: return <List className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadgeVariant = (status?: NutricionistaScheduledItem['status']) => {
  switch (status) {
    case 'scheduled': return 'default';
    case 'completed': return 'secondary'; // Using secondary for completed, adjust if needed
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

const getStatusText = (status?: NutricionistaScheduledItem['status']) => {
    switch (status) {
        case 'scheduled': return 'Agendado';
        case 'completed': return 'Concluído';
        case 'cancelled': return 'Cancelado';
        default: return 'Status Desconhecido';
    }
};

export default function AgendaGeralNutricionistaPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const scheduledItemsForSelectedDate = selectedDate
    ? mockNutricionistaAgenda.filter(item => isSameDay(parseISO(item.date), selectedDate))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda Geral</h1>
            <p className="text-muted-foreground">Visão consolidada dos seus compromissos e agendamentos.</p>
        </div>
        {/* Futuramente: Botão para adicionar novo evento/compromisso pessoal */}
        {/* <Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Evento Pessoal</Button> */}
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
                scheduled: mockNutricionistaAgenda.map(item => parseISO(item.date))
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
                                )}
                            >
                                {getStatusText(item.status)}
                            </Badge>
                        )}
                    </div>
                    {item.time && <p className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{item.time}</p>}
                    {item.patientName && <p className="text-sm text-foreground mt-0.5">Paciente: {item.patientName}</p>}
                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
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

