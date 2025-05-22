
// src/app/(app)/equipe/[memberId]/editar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UserCog, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { TeamMember, ClinicAccessType, UpdateTeamMemberData } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const clinicAccessTypesForForm = ['administrador_clinica', 'especialista_padrao'] as const;
const memberStatusesForForm = ['active', 'pending_invitation', 'inactive'] as const;


const editTeamMemberSchema = z.object({
  name: z.string().min(3, { message: 'Nome do membro deve ter no mínimo 3 caracteres.' }),
  // Email é geralmente não editável ou requer processo de verificação, omitindo por simplicidade
  // email: z.string().email({ message: 'Email inválido.' }),
  accessType: z.enum(clinicAccessTypesForForm, { errorMap: () => ({ message: "Selecione um tipo de acesso."}) }),
  specialtiesRaw: z.string().optional(),
  status: z.enum(memberStatusesForForm, { errorMap: () => ({ message: "Selecione um status."}) }),
});

type EditTeamMemberFormValues = z.infer<typeof editTeamMemberSchema>;

export default function EditarMembroEquipePage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.memberId as string;
  const { user } = useAuth();

  const [isLoadingMember, setIsLoadingMember] = useState(true);
  const [memberData, setMemberData] = useState<TeamMember | null>(null);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);

  const form = useForm<EditTeamMemberFormValues>({
    resolver: zodResolver(editTeamMemberSchema),
    defaultValues: {
      name: '',
      accessType: undefined, // Será preenchido com dados do membro
      specialtiesRaw: '',
      status: undefined, // Será preenchido com dados do membro
    },
  });

  useEffect(() => {
    if (!memberId || !user?.companyId) { // Check for user.companyId to ensure admin is from a clinic
        setErrorLoading("ID do membro ou da clínica inválido.");
        setIsLoadingMember(false);
        return;
    }

    const fetchMemberData = async () => {
      setIsLoadingMember(true);
      setErrorLoading(null);
      try {
        const response = await fetch(`/api/team/${memberId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao buscar dados do membro.');
        }
        const data: TeamMember = await response.json();
        
        // Security check: ensure the member belongs to the admin's clinic
        if (data.clinicId !== user.companyId) {
            throw new Error("Você não tem permissão para editar este membro.");
        }

        setMemberData(data);
        form.reset({
          name: data.name,
          accessType: data.accessType,
          specialtiesRaw: data.specialties?.join(', ') || '',
          status: data.status,
        });
      } catch (err) {
        console.error('Erro ao buscar dados do membro:', err);
        setErrorLoading(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
        toast({
            title: "Erro ao Carregar Membro",
            description: err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
            variant: "destructive"
        });
      } finally {
        setIsLoadingMember(false);
      }
    };

    fetchMemberData();
  }, [memberId, form, user?.companyId]);

  const onSubmit: SubmitHandler<EditTeamMemberFormValues> = async (data) => {
    const updatePayload: UpdateTeamMemberData = {
      name: data.name,
      accessType: data.accessType,
      specialties: data.specialtiesRaw ? data.specialtiesRaw.split(',').map(s => s.trim()).filter(s => s) : [],
      status: data.status,
    };
    
    // Add specialtiesRaw to payload if it's being sent to API that expects it
    (updatePayload as any).specialtiesRaw = data.specialtiesRaw;


    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error("Erro da API ao atualizar membro:", responseData);
        const errorMessage = responseData.error || responseData.details?.message || responseData.message || 'Falha ao atualizar membro da equipe.';
        throw new Error(errorMessage);
      }

      toast({
        title: "Membro Atualizado!",
        description: `Os dados de ${data.name} foram atualizados.`,
      });
      router.push('/equipe');
    } catch (error) {
      console.error('Erro ao submeter atualização do membro:', error);
      toast({
        title: "Erro ao Atualizar Membro",
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
        variant: "destructive",
      });
    }
  };

  if (isLoadingMember) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Carregando dados do membro...</p>
      </div>
    );
  }

  if (errorLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive text-center">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">Erro ao Carregar Dados</p>
        <p>{errorLoading}</p>
        <Link href="/equipe" passHref className="mt-4">
          <Button variant="outline">Voltar para Equipe</Button>
        </Link>
      </div>
    );
  }
  
  if (!memberData) { // Should be covered by errorLoading, but as a fallback
    return <div className="text-center">Membro não encontrado.</div>;
  }

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
            <UserCog className="mr-3 h-8 w-8 text-primary"/>
            Editar Membro da Equipe
          </h1>
          <p className="text-muted-foreground">Altere os dados e permissões do membro.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
              <CardTitle>Dados de: {memberData.name}</CardTitle>
              <CardDescription>Email: {memberData.email} (não editável aqui)</CardDescription>
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
                name="accessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Acesso na Clínica</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Membro</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="pending_invitation">Convite Pendente</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
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
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
