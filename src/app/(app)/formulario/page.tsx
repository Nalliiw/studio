'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Edit3, FileText, Clock } from 'lucide-react';
import type { FormResponse, Flow } from '@/types'; // Assuming Flow is the structure for form templates

// Mock Data
const mockPendingForms: (Flow & { assignedAt: string })[] = [
  { id: 'flow1', name: 'Check-in Semanal - Semana 4', questions: [{id: 'q1', type: 'text', text:'Como se sentiu esta semana?'}, {id: 'q2', type: 'text', text:'Alguma dificuldade?'}], nutritionistId: 'n1', assignedAt: '2024-05-20T09:00:00Z' },
  { id: 'flow2', name: 'Avaliação de Sono', questions: [{id: 'q1', type: 'text', text:'Quantas horas dormiu em média?'}], nutritionistId: 'n1', assignedAt: '2024-05-22T15:00:00Z' },
];

const mockCompletedForms: (FormResponse & { flowName: string })[] = [
  { id: 'resp1', formId: 'flow0', flowName: 'Questionário Inicial', patientId: 'p1', answers: [], status: 'completed', submittedAt: '2024-05-15T10:30:00Z' },
  { id: 'resp2', formId: 'flow1_old', flowName: 'Check-in Semanal - Semana 3', patientId: 'p1', answers: [], status: 'completed', submittedAt: '2024-05-13T11:00:00Z' },
];


export default function FormularioPacientePage() {
  const [activeTab, setActiveTab] = useState("pendentes");

  // Placeholder for form interaction
  const handleRespondForm = (formId: string) => {
    alert(`Redirecionar para responder formulário: ${formId}`);
    // router.push(`/formulario/${formId}`);
  };

  const handleViewForm = (formId: string) => {
    alert(`Visualizar formulário respondido: ${formId}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Formulários</h1>
        <p className="text-muted-foreground">Responda aos formulários pendentes e revise os já finalizados.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="pendentes">Pendentes ({mockPendingForms.length})</TabsTrigger>
          <TabsTrigger value="finalizados">Finalizados ({mockCompletedForms.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes" className="mt-6">
          {mockPendingForms.length > 0 ? (
            <div className="space-y-4">
              {mockPendingForms.map((form) => (
                <Card key={form.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        {form.name}
                    </CardTitle>
                    <CardDescription>
                        Enviado em: {new Date(form.assignedAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Este formulário contém {form.questions.length} pergunta(s). Reserve um momento para respondê-lo.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button onClick={() => handleRespondForm(form.id)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Responder Agora
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
                <CardContent className="h-40 flex flex-col items-center justify-center text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Nenhum formulário pendente!</p>
                    <p className="text-sm text-muted-foreground">Você está em dia com suas tarefas.</p>
                </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="finalizados" className="mt-6">
          {mockCompletedForms.length > 0 ? (
            <div className="space-y-4">
              {mockCompletedForms.map((form) => (
                <Card key={form.id} className="shadow-md">
                  <CardHeader>
                     <CardTitle className="flex items-center text-green-600">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        {form.flowName}
                    </CardTitle>
                    <CardDescription>
                        Respondido em: {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                   <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Você completou este formulário.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button variant="outline" onClick={() => handleViewForm(form.id)}>
                        Visualizar Respostas
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <Card className="shadow-md">
                <CardContent className="h-40 flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Nenhum formulário finalizado ainda.</p>
                    <p className="text-sm text-muted-foreground">Suas respostas aparecerão aqui.</p>
                </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
