
// src/app/(app)/agenda-admin/page.tsx
'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Clock, Users, MessageSquare, CalendarClock, Building, CalendarDays } from 'lucide-react'; // Added CalendarDays
import { format, isSameDay, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils'; 
import type { AdminAgendaItem } from '@/types';

const mockAdminAgenda: AdminAgendaItem[] = [
  { id: 'adm_sch1', type: 'meeting_clinic', title: 'Reunião Onboarding - Clínica Nova Vida', clinicName: 'Clínica Nova Vida', clinicId: 'c1', date: new Date().toISOString(), time: '10:00', description: 'Apresentação da plataforma e próximos passos.', status: 'scheduled' },
  { id: 'adm_sch2', type: 'task_admin', title: 'Revisar Contratos Pendentes', date: new Date().toISOString(), time: '14:00', description: 'Finalizar revisão dos contratos de novas clínicas.', status: 'scheduled' },
  { id: 'adm_sch3', type: 'reminder_admin', title: 'Lembrete: Follow-up Clínica BemEstar', date: addDays(new Date(), 1).toISOString(), time: '11:00', description: 'Entrar em contato para verificar a adaptação.', status: 'scheduled' },
  { id: 'adm_sch4', type: 'meeting_clinic', title: 'Chamada de Suporte - Clínica Saúde Plena', clinicName: 'Clínica Saúde Plena', clinicId: 'c2',date: addDays(new Date(), 2).toISOString(), time: '15:00', description: 'Sessão de suporte técnico agendada.', status: 'scheduled' },
  { id: 'adm_sch5', type: 'task_admin', title: 'Preparar Relatório Mensal de Uso', date: addDays(new Date(), -1).toISOString(), time: '09:00', description: 'Consolidar dados para o relatório de uso da plataforma.', status: 'completed' },
];

const AgendaItemIcon = ({ type }: { type: AdminAgendaItem['type'] }) => {
  switch (type) {
    case 'meeting_clinic': return <Users className="h-5 w-5 text-purple-500" />;
    case 'task_admin': return <List className="h-5 w-5 text-green-500" />;
    case 'reminder_admin': return <MessageSquare className="h-5 w-5 text-orange-500" />;
    default: return <CalendarClock className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadgeVariant = (status?: AdminAgendaItem['status']) => {
  switch (status) {
    case 'scheduled': return 'default';
    case 'completed': return 'secondary'; 
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

const getStatusText = (status?: AdminAgendaItem['status']) => {
    switch (status) {
        case 'scheduled': return 'Agendado';
        case 'completed': return 'Concluído';
        case 'cancelled': return 'Cancelado';
        default: return 'Status Desconhecido';
    }
};

export default function AgendaAdminPage() { 
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const scheduledItemsForSelectedDate = selectedDate
    ? mockAdminAgenda.filter(item => isSameDay(parseISO(item.date), selectedDate))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda do Administrador</h1>
            <p className="text-muted-foreground">Gerencie seus compromissos e eventos com as clínicas.</p>
        </div>
        {/* Futuramente, botão para adicionar novo evento */}
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
                scheduled: mockAdminAgenda.map(item => parseISO(item.date))
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
                    {item.clinicName && <p className="text-sm text-foreground mt-0.5 flex items-center"><Building className="h-4 w-4 mr-1.5 text-muted-foreground"/>Clínica: {item.clinicName}</p>}
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

