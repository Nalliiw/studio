
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

// Placeholder data for a new clinic if fetched data is 404
const placeholderCompanyData: Company = {
  id: 'new_clinic_placeholder', // This will be replaced by user.companyId if creating
  name: 'Nova Clínica (Preencha o Nome)',
  cnpj: '00.000.000/0000-00', // Default CNPJ, assuming it's a new registration
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
        setError("ID da clínica não encontrado no perfil do usuário. Não é possível carregar configurações.");
        setIsLoading(false);
        toast({
            title: "Erro de Usuário",
            description: "ID da clínica não encontrado no seu perfil.",
            variant: "destructive",
        });
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching company data for companyId: ${user.companyId}`);
        const response = await fetch(`/api/companies/${user.companyId}`);
        
        if (!response.ok) {
          let errorMessage = `Falha ao buscar dados da clínica. Status: ${response.status}`;
          let errorForState: string | null = errorMessage; // For the error state variable
          let toastMessage = errorMessage; // For the toast notification

          try {
            const errorText = await response.text();
            if (response.status === 404) {
                console.warn("Raw error response from API (fetchCompanyData - 404):", errorText);
            } else {
                console.error("Raw error response from API (fetchCompanyData):", errorText);
            }

            if (errorText) {
              const errorData = JSON.parse(errorText);
              const detailMessage = errorData.details?.message || (typeof errorData.details === 'string' ? errorData.details : null) || errorData.error || errorData.message;
              errorMessage = detailMessage || errorText;
              toastMessage = `Detalhes: ${errorMessage}`; // More specific toast
            }
          } catch (e) {
            console.error("Failed to parse error response or read text (fetchCompanyData):", e);
          }

          if (response.status === 404) {
            console.warn("Empresa não encontrada no Firestore. Usando dados de placeholder para novo cadastro.");
            // Use placeholder data, but ensure ID is the user's companyId
            setCompanyData({ ...placeholderCompanyData, id: user.companyId }); 
            form.reset({ name: placeholderCompanyData.name });
            errorForState = "Clínica não encontrada. Preencha o nome para cadastrá-la.";
            // No toast for 404 as UI handles it with a specific message.
          } else {
            // For other errors (500, 403, etc.), show a toast.
            toast({
                title: "Erro ao Carregar Dados da Clínica",
                description: toastMessage,
                variant: "destructive"
            });
          }
          setError(errorForState);
        } else {
            const data: Company = await response.json();
            setCompanyData(data);
            form.reset({ name: data.name });
            setError(null); // Clear previous errors
        }
      } catch (err) {
        console.error("Erro ao buscar dados da clínica:", err);
        const displayError = err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao buscar dados da clínica.';
        setError(displayError);
        // Avoid toasting again if it's a 404 handled by UI, or if already toasted
        if (!displayError.includes("Clínica não encontrada") && !displayError.includes("Falha ao buscar dados da clínica")) {
            toast({
                title: "Erro de Rede ou Inesperado",
                description: displayError,
                variant: "destructive"
            });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) { // Only fetch if user is loaded
      fetchCompanyData();
    } else {
      setIsLoading(false); // If no user, stop loading
    }
  }, [user, form]); // form added to dependency array as form.reset is used

  const onSubmit: SubmitHandler<ClinicConfigFormValues> = async (data) => {
    if (!user?.companyId) {
      toast({ title: "Erro", description: "ID da clínica não encontrado.", variant: "destructive" });
      return;
    }
    
    const payload = {
      name: data.name,
      cnpj: companyData?.cnpj || placeholderCompanyData.cnpj, // Pass current CNPJ (from placeholder or fetched data)
    };

    console.log("Submitting company update/create with payload:", payload, "for companyId:", user.companyId);

    try {
      const response = await fetch(`/api/companies/${user.companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        let errorMessage = `Falha ao atualizar dados da clínica. Status: ${response.status}`;
        try {
            const errorText = await response.text();
            console.error("Raw error response from API (onSubmit):", errorText);
            if (errorText) {
                try {
                    const errorData = JSON.parse(errorText);
                    const specificDetail = (typeof errorData.details === 'string' ? errorData.details : errorData.details?.message);
                    errorMessage = specificDetail || errorData.error || errorData.message || (errorText.length < 200 && !errorText.trim().startsWith('<') ? errorText : `Erro ${response.status}`);
                } catch (jsonParseError) {
                     if (errorText.length < 200 && !errorText.trim().startsWith('<')) { // Avoid showing HTML error pages as messages
                        errorMessage = errorText;
                    } else {
                         errorMessage = `Erro ${response.status}: Falha ao processar resposta do servidor.`;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to read/parse error response (onSubmit):", e);
            errorMessage = `Erro ${response.status}: Falha ao ler resposta do servidor.`;
        }
        throw new Error(errorMessage);
      }
      
      const updatedCompany: Company = await response.json();
      toast({ title: "Sucesso!", description: "Nome da clínica atualizado." });
      setCompanyData(updatedCompany); // Update local state with the full data from API
      form.reset({ name: updatedCompany.name }); // Reset form with new name
      setError(null); // Clear any previous errors (like 'not found')
    } catch (error) {
      console.error("Erro ao atualizar clínica:", error);
      toast({
        title: "Erro ao Atualizar",
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
        variant: "destructive",
      });
    }
  };

  if (isLoading && !companyData) { // Show loading only if no data (initial load)
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Carregando configurações da clínica...</p>
      </div>
    );
  }
  
  // Use companyData for display. This could be fetched data, or placeholder if fetch resulted in 404.
  const displayCompany = companyData || (error && error.includes("Clínica não encontrada") ? { ...placeholderCompanyData, id: user?.companyId || 'new_clinic_placeholder' } : null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings2 className="mr-3 h-8 w-8 text-primary" />
            Configurações da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie as informações e preferências da sua clínica.</p>
      </div>

      {error && error.includes("Clínica não encontrada") && (
         <Alert variant="default" className="border-primary/50 text-primary bg-primary/10">
          <AlertTriangle className="h-5 w-5 !text-primary" />
          <AlertTitle>Nova Clínica</AlertTitle>
          <AlertDescription>{error} Salve as alterações para registrar.</AlertDescription>
        </Alert>
      )}
      {error && !error.includes("Clínica não encontrada") && (
         <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erro ao Carregar Dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
              <Button type="submit" disabled={form.formState.isSubmitting || (isLoading && !!companyData) /* Disable if loading update */}>
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
