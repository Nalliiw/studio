
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
          let errorForState: string | null = errorMessage;
          
          try {
            const errorText = await response.text();
            if (response.status === 404) {
                console.warn("Raw error response from API (fetchCompanyData - 404):", errorText);
            } else {
                console.error("Raw error response from API (fetchCompanyData):", errorText);
            }

            if (errorText) {
              const errorData = JSON.parse(errorText);
              const detailMessage = errorData.details?.message || (typeof errorData.details === 'string' ? errorData.details : null);
              errorMessage = detailMessage || errorData.error || errorData.message || errorText;
            }
          } catch (e) {
            console.error("Failed to parse error response or read text (fetchCompanyData):", e);
          }

          if (response.status === 404) {
            console.warn("Empresa não encontrada no Firestore. Usando dados de placeholder para novo cadastro.");
            setCompanyData(placeholderCompanyData);
            form.reset({ name: placeholderCompanyData.name });
            errorForState = "Clínica não encontrada. Preencha o nome para cadastrá-la.";
          } else {
            // For other errors, throw to be caught by the outer catch which sets the toast
            throw new Error(errorMessage);
          }
          setError(errorForState); // Set error for UI display, but don't throw for 404
        } else {
            const data: Company = await response.json();
            setCompanyData(data);
            form.reset({ name: data.name });
            setError(null); // Clear any previous "not found" error if data is successfully fetched
        }
      } catch (err) {
        console.error("Erro ao buscar dados da clínica:", err);
        const displayError = err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao buscar dados da clínica.';
        setError(displayError);
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
  }, [user]); 

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
      
      if (!response.ok) {
        let errorMessage = `Falha ao atualizar dados da clínica. Status: ${response.status}`; // Default
        try {
            const errorText = await response.text();
            console.error("Raw error response from API (onSubmit):", errorText);
            if (errorText) {
                try {
                    const errorData = JSON.parse(errorText);
                    const specificDetail = errorData.details?.message || (typeof errorData.details === 'string' ? errorData.details : null);
                    const generalError = errorData.error || errorData.message;

                    if (specificDetail) {
                        errorMessage = specificDetail; 
                    } else if (generalError) {
                        errorMessage = generalError;
                    } else if (errorText.length < 200 && !errorText.trim().startsWith('<')) { 
                        errorMessage = errorText; // Use raw text if it's short and not HTML
                    }
                    // If still the default, it means no useful message was extracted, status already included
                } catch (jsonParseError) {
                    // JSON parsing failed. errorMessage remains the default with status or short raw text
                     if (errorText.length < 200 && !errorText.trim().startsWith('<')) {
                        errorMessage = errorText;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to read/parse error response (onSubmit):", e);
        }
        throw new Error(errorMessage);
      }
      // Assuming API returns the updated company or a success message
      // For simplicity, we're just showing a success toast and updating local state
      toast({ title: "Sucesso!", description: "Nome da clínica atualizado." });
      setCompanyData(prev => prev ? { ...prev, name: data.name, id: user.companyId! } : { ...placeholderCompanyData, id: user.companyId!, name: data.name });
      setError(null); // Clear "not found" error after successful save
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
  
  const displayCompany = companyData || (error && !isLoading && error.includes("Clínica não encontrada") ? placeholderCompanyData : null);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings2 className="mr-3 h-8 w-8 text-primary" />
            Configurações da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie as informações e preferências da sua clínica.</p>
      </div>

      {error && !error.includes("Clínica não encontrada") && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erro ao Carregar Dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
       {error && error.includes("Clínica não encontrada") && (
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

