
// src/app/(app)/equipe/novo/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UserPlus2 } from 'lucide-react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Definindo os tipos de acesso possíveis dentro da clínica
const clinicAccessTypes = ['administrador_clinica', 'especialista_padrao'] as const;
type ClinicAccessType = typeof clinicAccessTypes[number];

const newTeamMemberSchema = z.object({
  name: z.string().min(3, { message: 'Nome do membro deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  accessType: z.enum(clinicAccessTypes, { errorMap: () => ({ message: "Selecione um tipo de acesso."}) }),
});

type NewTeamMemberFormValues = z.infer<typeof newTeamMemberSchema>;

export default function NovoMembroEquipePage() {
  const router = useRouter();
  const form = useForm<NewTeamMemberFormValues>({
    resolver: zodResolver(newTeamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit: SubmitHandler<NewTeamMemberFormValues> = async (data) => {
    console.log('Novo Membro da Equipe Data:', data);
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Membro Adicionado!",
      description: `O membro ${data.name} foi adicionado à equipe com acesso de ${data.accessType === 'administrador_clinica' ? 'Administrador da Clínica' : 'Especialista'}.`,
    });
    router.push('/equipe');
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormDescription>
                      Administradores podem gerenciar outros membros. Especialistas têm acesso padrão.
                    </FormDescription>
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
                Salvar Membro
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
