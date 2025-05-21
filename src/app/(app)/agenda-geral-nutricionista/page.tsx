
// src/app/(app)/agenda-geral-nutricionista/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function AgendaGeralNutricionistaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda Geral do Nutricionista</h1>
        <p className="text-muted-foreground">Visão consolidada dos seus compromissos e agendamentos de pacientes.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-primary" />
            Visão Geral da Agenda
          </CardTitle>
          <CardDescription>
            Esta seção está em desenvolvimento. Em breve, você poderá visualizar uma agenda consolidada
            com os compromissos de todos os seus pacientes, além dos seus próprios eventos e lembretes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidades planejadas:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Calendário unificado com eventos de múltiplos pacientes.</li>
            <li>Filtros por paciente, tipo de evento (fluxo, consulta, lembrete).</li>
            <li>Criação rápida de seus próprios compromissos e bloqueios de tempo.</li>
            <li>Sincronização com agendas externas (em estudo).</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Volte em breve para conferir as novidades!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
