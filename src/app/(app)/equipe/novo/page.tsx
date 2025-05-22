
// src/app/(app)/equipe/novo/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Não usado diretamente, mas bom manter para consistência com FormLabel
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UserPlus2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Para obter clinicId e addedBy
import type { ClinicAccessType } from '@/types';

const clinicAccessTypesForForm = ['administrador_clinica', 'especialista_padrao'] as const;

const newTeamMemberSchema = z.object({
  name: z.string().min(3, { message: 'Nome do membro deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  accessType: z.enum(clinicAccessTypesForForm, { errorMap: () => ({ message: "Selecione um tipo de acesso."}) }),
  specialtiesRaw: z.string().optional(), // String de especialidades separadas por vírgula
});

type NewTeamMemberFormValues = z.infer<typeof newTeamMemberSchema>;

export default function NovoMembroEquipePage() {
  const router = useRouter();
  const { user } = useAuth(); // Usuário logado (admin da clínica)

  const form = useForm<NewTeamMemberFormValues>({
    resolver: zodResolver(newTeamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      specialtiesRaw: '',
      // accessType não é definido por padrão, o usuário deve selecionar.
    },
  });

  const onSubmit: SubmitHandler<NewTeamMemberFormValues> = async (data) => {
    if (!user || !user.companyId) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado como administrador de uma clínica para adicionar membros.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...data,
      clinicId: user.companyId,
      addedBy: user.id,
    };
    
    console.log('Enviando dados para API /api/team:', payload);

    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Erro da API ao adicionar membro:", responseData);
        throw new Error(responseData.error || responseData.details?.message || 'Falha ao adicionar membro da equipe.');
      }

      toast({
        title: "Membro Adicionado!",
        description: `O membro ${responseData.name} foi adicionado à equipe.`,
      });
      router.push('/equipe');
    } catch (error) {
      console.error('Erro ao submeter novo membro:', error);
      toast({
        title: "Erro ao Adicionar Membro",
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/equipe" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para equipe">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserPlus2 className="mr-3 h-8 w-8 text-primary"/>
            Adicionar Novo Membro à Equipe
          </h1>
          <p className="text-muted-foreground">Preencha os dados para cadastrar um novo membro.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
              <CardTitle>Dados do Membro</CardTitle>
              <CardDescription>Informações básicas e tipo de acesso do novo membro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dra. Ana Carolina" {...field} />
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
                      <Input type="email" placeholder="ana.carolina@clinica.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Acesso na Clínica</FormLabel>
                    <Select onValueChange={field.onChange as (value: ClinicAccessType) => void} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de acesso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="administrador_clinica">Administrador da Clínica</SelectItem>
                        <SelectItem value="especialista_padrao">Especialista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialtiesRaw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidades (separadas por vírgula)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nutrição Esportiva, Pediatria" {...field} />
                    </FormControl>
                    <FormDescription>
                      Informe as especialidades do membro, separadas por vírgula.
                    </FormDescription>
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
