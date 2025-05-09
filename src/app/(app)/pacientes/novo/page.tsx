'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const newPatientSchema = z.object({
  name: z.string().min(3, { message: 'Nome do paciente deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  initialGoal: z.string().optional(),
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
    },
  });

  const onSubmit: SubmitHandler<NewPatientFormValues> = async (data) => {
    console.log('Novo Paciente Data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Paciente Criado!",
      description: `O paciente ${data.name} foi criado com sucesso.`,
    });
    router.push('/pacientes');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pacientes" passHref>
          <Button variant="outline" size="icon">
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
