
// src/app/(app)/clinica/configuracoes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

// Mock data para fallback caso a empresa não exista NO Firestore.
// Não será usado se houver erro de permissão, mas sim se a busca for bem sucedida e não encontrar o doc.
const placeholderCompanyData: Company = {
  id: 'new_clinic_placeholder',
  name: 'Nova Clínica (Preencha o Nome)',
  cnpj: '00.000.000/0000-00',
  nutritionistCount: 0,
  status: 'active',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
};

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
          let errorMessage = `Falha ao buscar dados da clínica. Status: ${response.status}`;
          try {
            const errorText = await response.text();
            console.error("Raw error response from API (fetchCompanyData):", errorText);
            if (errorText) {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorData.message || (typeof errorData.details === 'string' ? errorData.details : errorData.details?.message) || errorText;
            }
          } catch (e) {
            console.error("Failed to parse error response or read text (fetchCompanyData):", e);
          }
          // Se for 404, a empresa não existe, usamos o placeholder para o usuário criar/definir o nome
          if (response.status === 404) {
            console.warn("Empresa não encontrada no Firestore. Usando dados de placeholder para novo cadastro.");
            setCompanyData(placeholderCompanyData);
            form.reset({ name: placeholderCompanyData.name });
            setError("Clínica não encontrada. Preencha o nome para cadastrá-la."); // Informative error
          } else {
            throw new Error(errorMessage);
          }
        } else {
            const data: Company = await response.json();
            setCompanyData(data);
            form.reset({ name: data.name });
        }
      } catch (err) {
        console.error("Erro ao buscar dados da clínica:", err);
        const displayError = err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao buscar dados da clínica.';
        setError(displayError);
        // Não preenche com mock em caso de erro genérico, para o usuário ver o erro.
        // Apenas para 404 preenchemos para permitir a "criação" pelo nome.
        toast({
            title: "Erro ao Carregar Dados da Clínica",
            description: displayError,
            variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCompanyData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // form.reset intencionalmente removido das dependências para evitar loops

  const onSubmit: SubmitHandler<ClinicConfigFormValues> = async (data) => {
    if (!user?.companyId) {
      toast({ title: "Erro", description: "ID da clínica não encontrado.", variant: "destructive" });
      return;
    }
    
    // Se companyData for o placeholder, significa que estamos "criando" ou definindo o nome pela primeira vez
    // A API PUT em /api/companies/[companyId] pode precisar lidar com a criação se o doc não existir (upsert)
    // ou você pode ter uma rota POST separada para criação e PUT apenas para atualização.
    // Por simplicidade, vamos assumir que a API PUT pode criar se não existir ou que você criará o doc manualmente no Firestore por agora.

    try {
      const response = await fetch(`/api/companies/${user.companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name }), // Enviando apenas o nome para atualização
      });
      
      if (!response.ok) {
        let errorMessage = 'Falha ao atualizar dados da clínica.';
        try {
            const errorText = await response.text();
            console.error("Raw error response from API (onSubmit):", errorText);
            if (errorText) {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || (typeof errorData.details === 'string' ? errorData.details : errorData.details?.message) || errorText;
            }
        } catch (e) {
            console.error("Failed to parse error response or read text (onSubmit):", e);
        }
        throw new Error(errorMessage);
      }
      const updatedCompany = await response.json(); // A API deve retornar a empresa atualizada ou uma msg de sucesso
      toast({ title: "Sucesso!", description: "Nome da clínica atualizado." });
      setCompanyData(prev => prev ? { ...prev, name: data.name, id: user.companyId! } : { ...placeholderCompanyData, id: user.companyId!, name: data.name });
      setError(null); // Limpa erro de "não encontrado" após salvar com sucesso
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
  
  const displayCompany = companyData || (error && !isLoading ? placeholderCompanyData : null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings2 className="mr-3 h-8 w-8 text-primary" />
            Configurações da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie as informações e preferências da sua clínica.</p>
      </div>

      {error && !companyData?.id.startsWith('new_clinic') && ( // Mostra erro geral, a menos que seja o erro de "clínica não encontrada" (tratado pelo placeholder)
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erro ao Carregar Dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
       {companyData?.id === 'new_clinic_placeholder' && error && (
         <Alert variant="default" className="border-primary/50 text-primary bg-primary/10">
          <AlertTriangle className="h-5 w-5 !text-primary" />
          <AlertTitle>Nova Clínica</AlertTitle>
          <AlertDescription>{error} Salve as alterações para registrar.</AlertDescription>
        </Alert>
      )}


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
              {displayCompany?.cnpj && (
                <div className="space-y-2">
                  <Label htmlFor="clinicCnpj">CNPJ</Label>
                  <Input id="clinicCnpj" value={displayCompany.cnpj} disabled />
                  <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado aqui.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
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
