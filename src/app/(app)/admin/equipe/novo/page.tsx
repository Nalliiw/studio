
// src/app/(app)/admin/equipe/novo/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UserPlus2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Exemplo de papéis para a equipe administrativa
const adminTeamRoles = [
    { value: 'suporte_tecnico', label: 'Suporte Técnico' },
    { value: 'gerente_contas', label: 'Gerente de Contas' },
    { value: 'operacoes', label: 'Operações' },
    { value: 'desenvolvimento', label: 'Desenvolvimento' },
    { value: 'marketing', label: 'Marketing' },
];

const newAdminTeamMemberSchema = z.object({
  name: z.string().min(3, { message: 'Nome do membro deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  roleAdminTeam: z.string().min(1, { message: "Selecione um papel para o membro." }),
});

type NewAdminTeamMemberFormValues = z.infer<typeof newAdminTeamMemberSchema>;

export default function NovoMembroEquipeAdminPage() {
  const router = useRouter();
  const { user } = useAuth(); // Admin Supremo logado

  const form = useForm<NewAdminTeamMemberFormValues>({
    resolver: zodResolver(newAdminTeamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      roleAdminTeam: '',
    },
  });

  const onSubmit: SubmitHandler<NewAdminTeamMemberFormValues> = async (data) => {
    if (!user || user.role !== 'administrador_supremo') {
      toast({
        title: "Acesso Negado",
        description: "Apenas o Administrador Supremo pode adicionar membros à equipe administrativa.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...data,
      addedBy: user.id,
    };
    
    console.log('Dados Novo Membro Admin (Simulação):', payload);
    // Simulação de chamada de API
    form.formState.isSubmitting = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    form.formState.isSubmitting = false;

    toast({
      title: "Membro Admin Adicionado (Simulação)!",
      description: `O membro ${data.name} foi adicionado à equipe administrativa (simulação).`,
    });
    router.push('/admin/equipe');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/equipe" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para equipe administrativa">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserPlus2 className="mr-3 h-8 w-8 text-primary"/>
            Adicionar Membro à Equipe Administrativa
          </h1>
          <p className="text-muted-foreground">Preencha os dados do novo membro da equipe interna.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
              <CardTitle>Dados do Membro</CardTitle>
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
                      <Input type="email" placeholder="joao.silva@nutritrack.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roleAdminTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel na Equipe</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o papel do membro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {adminTeamRoles.map(role => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Membro
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
