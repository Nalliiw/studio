'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Workflow } from 'lucide-react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Flow } from '@/types'; // Assuming Flow type is available
import { useState, useEffect } from 'react';

// Mock flows - in a real app, these would be fetched
const mockAvailableFlows: Pick<Flow, 'id' | 'name'>[] = [
  { id: 'flow1', name: 'Questionário Inicial Completo' },
  { id: 'flow2', name: 'Check-in Semanal Rápido' },
  { id: 'flow3', name: 'Avaliação de Hábitos Alimentares' },
  { id: 'flow4', name: 'Registro Fotográfico de Refeições (7 dias)' },
];


const newPatientSchema = z.object({
  name: z.string().min(3, { message: 'Nome do paciente deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  initialGoal: z.string().optional(),
  assignedFlowIds: z.array(z.string()).optional(), // Array of flow IDs
});

type NewPatientFormValues = z.infer<typeof newPatientSchema>;

export default function NovoPacientePage() {
  const router = useRouter();
  const form = useForm<NewPatientFormValues>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      name: '',
      email: '',
      initialGoal: '',
      assignedFlowIds: [],
    },
  });

  const onSubmit: SubmitHandler<NewPatientFormValues> = async (data) => {
    console.log('Novo Paciente Data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Paciente Criado!",
      description: `O paciente ${data.name} foi criado com sucesso. ${data.assignedFlowIds && data.assignedFlowIds.length > 0 ? `${data.assignedFlowIds.length} fluxo(s) atribuído(s).` : ''}`,
    });
    router.push('/pacientes');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pacientes" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Paciente</h1>
          <p className="text-muted-foreground">Preencha os dados para cadastrar um novo paciente.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
              <CardTitle>Dados do Paciente</CardTitle>
              <CardDescription>Informações básicas do novo paciente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="joao.silva@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo Inicial (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Perder 5kg, melhorar alimentação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedFlowIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base flex items-center">
                        <Workflow className="mr-2 h-5 w-5 text-primary" />
                        Atribuir Fluxos Iniciais (Opcional)
                      </FormLabel>
                      <FormDescription>
                        Selecione os fluxos que este paciente deverá responder inicialmente.
                      </FormDescription>
                    </div>
                    <div className="space-y-2 p-3 border rounded-md bg-muted/50 max-h-48 overflow-y-auto">
                      {mockAvailableFlows.map((flow) => (
                        <FormField
                          key={flow.id}
                          control={form.control}
                          name="assignedFlowIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={flow.id}
                                className="flex flex-row items-center space-x-3 space-y-0 p-2 hover:bg-background rounded-md transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(flow.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), flow.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== flow.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-grow">
                                  {flow.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <span className="animate-spin mr-2">◌</span>
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Paciente
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
