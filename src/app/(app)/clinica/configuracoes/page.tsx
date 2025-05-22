
// src/app/(app)/clinica/configuracoes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Save, Loader2, AlertTriangle, ImageUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import type { Company } from '@/types';

const clinicConfigSchema = z.object({
  name: z.string().min(3, { message: 'Nome da clínica deve ter no mínimo 3 caracteres.' }),
});

type ClinicConfigFormValues = z.infer<typeof clinicConfigSchema>;

export default function ConfiguracoesClinicaPage() {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClinicConfigFormValues>({
    resolver: zodResolver(clinicConfigSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.companyId) {
        setError("ID da clínica não encontrado no perfil do usuário.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/companies/${user.companyId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao buscar dados da clínica.');
        }
        const data: Company = await response.json();
        setCompanyData(data);
        form.reset({ name: data.name });
      } catch (err) {
        console.error("Erro ao buscar dados da clínica:", err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
        toast({
          title: "Erro ao Carregar Dados da Clínica",
          description: err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCompanyData();
    }
  }, [user, form]);

  const onSubmit: SubmitHandler<ClinicConfigFormValues> = async (data) => {
    if (!user?.companyId) {
      toast({ title: "Erro", description: "ID da clínica não encontrado.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/companies/${user.companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Falha ao atualizar dados da clínica.');
      }
      toast({ title: "Sucesso!", description: "Nome da clínica atualizado." });
      setCompanyData(prev => prev ? { ...prev, name: data.name } : null);
    } catch (error) {
      console.error("Erro ao atualizar clínica:", error);
      toast({
        title: "Erro ao Atualizar",
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Carregando configurações da clínica...</p>
      </div>
    );
  }

  if (error && !companyData) { // Only show critical error if no data could be loaded at all
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive text-center">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">Erro ao Carregar Configurações</p>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings2 className="mr-3 h-8 w-8 text-primary" />
            Configurações da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie as informações e preferências da sua clínica.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="clinicName">Nome da Clínica</FormLabel>
                    <FormControl>
                      <Input id="clinicName" placeholder="Nome da sua clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {companyData?.cnpj && (
                <div className="space-y-2">
                  <Label htmlFor="clinicCnpj">CNPJ</Label>
                  <Input id="clinicCnpj" value={companyData.cnpj} disabled />
                  <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado aqui.</p>
                </div>
              )}
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

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageUp className="mr-2 h-5 w-5 text-primary" />
            Logo da Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-md text-muted-foreground">
            <p>Funcionalidade de upload de logo em breve!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
