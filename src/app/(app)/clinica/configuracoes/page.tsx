// src/app/(app)/clinica/configuracoes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings2, Save, Loader2, AlertTriangle, ImageUp, Upload, ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import type { Company, User } from '@/types'; // Added User
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, type FirebaseStorageError } from "firebase/storage";
import Image from 'next/image';

const clinicConfigSchema = z.object({
  name: z.string().min(3, { message: 'Nome da clínica deve ter no mínimo 3 caracteres.' }),
  // CNPJ não é editável diretamente no formulário, mas é necessário para criação
});

type ClinicConfigFormValues = z.infer<typeof clinicConfigSchema>;

const placeholderCompanyData: Company = {
  id: 'new_clinic_placeholder',
  name: 'Nova Clínica (Preencha o Nome)',
  cnpj: '00.000.000/0000-00', // Default CNPJ placeholder
  logoUrl: undefined,
  nutritionistCount: 0,
  status: 'active',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
};

export default function ConfiguracoesClinicaPage() {
  const { user } = useAuth() as { user: User | null }; // Ensure user type for companyId & companyCnpj
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isPermissionError, setIsPermissionError] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ClinicConfigFormValues>({
    resolver: zodResolver(clinicConfigSchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchCompanyData = useCallback(async () => {
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
    setIsNotFound(false);
    setIsPermissionError(false);

    try {
      const response = await fetch(`/api/companies/${user.companyId}`);
      let errorMessage = `Falha ao buscar dados da clínica. Status: ${response.status}`;
      let errorForState: string | null = null;

      if (!response.ok) {
        let isPermError = false;
        let toastMessage = errorMessage;

        try {
          const errorText = await response.text();
          if (response.status === 404) {
              console.warn("Raw error response from API (fetchCompanyData - 404):", errorText);
          } else {
              console.error("Raw error response from API (fetchCompanyData - other error):", errorText);
          }

          if (errorText) {
            const errorData = JSON.parse(errorText);
            const detailMsg = errorData.details?.message || (typeof errorData.details === 'string' ? errorData.details : null) || errorData.error || errorData.message;
            errorMessage = detailMsg || errorText;

            toastMessage = `Detalhes: ${errorMessage}`;
            if (typeof errorMessage === 'string' && (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('permissões insuficientes') || errorMessage.toLowerCase().includes('insufficient permissions'))) {
                isPermError = true;
            }
          }
        } catch (e) {
          console.error("Failed to parse error response or read text (fetchCompanyData):", e);
        }

        if (response.status === 404) {
          const placeholderForNew = {
            ...placeholderCompanyData,
            id: user.companyId,
            cnpj: user.companyCnpj || placeholderCompanyData.cnpj
          };
          setCompanyData(placeholderForNew);
          form.reset({ name: placeholderForNew.name });
          setImagePreviewUrl(null);
          setIsNotFound(true);
          errorForState = "Clínica não encontrada. Preencha o nome para cadastrá-la.";
        } else if (isPermError) {
            setIsPermissionError(true);
            const specificPermError = errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('permissões insuficientes') ? errorMessage : "Permissões insuficientes no Firestore. Verifique as regras de segurança.";
            errorForState = specificPermError;
            toast({
                title: "Erro de Permissão no Firestore!",
                description: "Não foi possível carregar os dados da sua clínica. POR FAVOR, VERIFIQUE AS REGRAS DE SEGURANÇA do seu Firestore no Console do Firebase. Para teste, use 'allow read, write: if true;' na coleção 'companies'. Os dados exibidos podem ser placeholders.",
                variant: "destructive",
                duration: 15000,
            });
            const placeholderForPermError = {
              ...placeholderCompanyData,
              id: user.companyId,
              name: "CLÍNICA (ERRO DE PERMISSÃO)", // Nome indicativo do problema
              cnpj: user.companyCnpj || placeholderCompanyData.cnpj
            };
            setCompanyData(placeholderForPermError);
            form.reset({ name: placeholderForPermError.name });
            setImagePreviewUrl(null);
        } else {
          toast({
              title: "Erro ao Carregar Dados da Clínica",
              description: toastMessage,
              variant: "destructive"
          });
          errorForState = errorMessage;
        }
        setError(errorForState);
      } else {
          const data: Company = await response.json();
          setCompanyData(data);
          form.reset({ name: data.name });
          if (data.logoUrl) {
            setImagePreviewUrl(data.logoUrl);
          } else {
            setImagePreviewUrl(null);
          }
          setIsNotFound(false);
          setError(null);
      }
    } catch (err) {
      console.error("Erro ao buscar dados da clínica:", err);
      const displayError = err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao buscar dados da clínica.';
      setError(displayError);
      toast({
          title: "Erro de Rede ou Inesperado",
          description: displayError,
          variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, form]);

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchCompanyData]);

  const onSubmit: SubmitHandler<ClinicConfigFormValues> = async (data) => {
    if (!user?.companyId) {
      toast({ title: "Erro", description: "ID da clínica do usuário não encontrado.", variant: "destructive" });
      return;
    }

    if (isPermissionError) {
        toast({
            title: "Ação Bloqueada",
            description: "Não é possível salvar devido a erro de permissão. Verifique as regras do Firestore.",
            variant: "destructive",
        });
        return;
    }

    const currentCnpj = companyData?.cnpj || user?.companyCnpj || placeholderCompanyData.cnpj;

    const payload: { name: string; cnpj?: string } = {
      name: data.name,
    };

    // Only include CNPJ if creating or if it's explicitly part of the update
    if (isNotFound || (companyData && !companyData.cnpj && currentCnpj !== placeholderCompanyData.cnpj) || (companyData && companyData.cnpj) ) {
        payload.cnpj = currentCnpj;
    }

    try {
      const response = await fetch(`/api/companies/${user.companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let errorMessage = `Falha ao atualizar dados da clínica. Status: ${response.status}`;
      if (!response.ok) {
        try {
            const errorText = await response.text();
            console.error("Raw error response from API (onSubmit):", errorText);
            if (errorText) {
                try {
                    const errorData = JSON.parse(errorText);
                    // Prioritize 'details' if it's a string or has a message, then 'error', then 'message'
                    const detailMsg = (typeof errorData.details === 'string' ? errorData.details : errorData.details?.message);
                    errorMessage = detailMsg || errorData.error || errorData.message || (errorText.length < 200 && !errorText.trim().startsWith('<') ? errorText : `Erro ${response.status}`);
                } catch (jsonParseError) {
                     if (errorText.length < 200 && !errorText.trim().startsWith('<')) {
                        errorMessage = errorText; // Use raw text if not too long and not HTML
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
      toast({ title: "Sucesso!", description: `Clínica "${updatedCompany.name}" ${isNotFound ? 'registrada' : 'atualizada'} com sucesso.` });
      setCompanyData(updatedCompany);
      form.reset({ name: updatedCompany.name });
      if (updatedCompany.logoUrl) setImagePreviewUrl(updatedCompany.logoUrl);
      setIsNotFound(false);
      setError(null);
      setIsPermissionError(false); // Reset permission error on successful save
    } catch (error) {
      console.error("Erro ao atualizar clínica:", error);
      toast({
        title: "Erro ao Atualizar",
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Arquivo Muito Grande", description: "Por favor, selecione um arquivo menor que 5MB.", variant: "destructive"});
        setSelectedFile(null);
        setImagePreviewUrl(companyData?.logoUrl || null);
        if (event.target) event.target.value = "";
        return;
      }
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(companyData?.logoUrl || null);
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedFile || !user?.companyId) {
      toast({ title: "Erro", description: "Selecione um arquivo e certifique-se de estar logado e com uma clínica associada.", variant: "destructive" });
      return;
    }
    if (!storage) {
      toast({ title: "Erro de Configuração", description: "Serviço de armazenamento não está disponível. Contate o suporte.", variant: "destructive" });
      console.error("Firebase Storage instance is not available in handleSaveLogo.");
      return;
    }
     if (isPermissionError) {
        toast({
            title: "Ação Bloqueada",
            description: "Não é possível salvar o logo devido a erro de permissão. Verifique as regras do Firestore/Storage.",
            variant: "destructive",
        });
        return;
    }

    setIsUploading(true);
    const storageRef = ref(storage, `clinic_logos/${user.companyId}/${Date.now()}_${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
      },
      (error: FirebaseStorageError) => {
        console.error("Erro no upload do logo:", error);
        let description = `Falha ao enviar logo: ${error.message}`;
        if (error.code === 'storage/unauthorized') {
          description = "Falha ao enviar logo: Permissão negada. Verifique as regras de segurança do Firebase Storage.";
        } else if (error.code === 'storage/retry-limit-exceeded') {
          description = "Falha ao enviar logo: Limite de tentativas excedido. Verifique sua conexão ou tente um arquivo menor.";
        }
        toast({ title: "Erro no Upload", description, variant: "destructive" });
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const apiResponse = await fetch(`/api/companies/${user.companyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoUrl: downloadURL }), // Only send logoUrl
          });

          if (!apiResponse.ok) {
            let errorDetail = 'Falha ao salvar URL do logo no banco de dados.';
            try {
                const errorData = await apiResponse.json();
                const detailMsg = errorData.details?.message || (typeof errorData.details === 'string' ? errorData.details : null) || errorData.error || errorData.message;
                errorDetail = detailMsg || errorDetail;
            } catch (e) { /* ignore parsing error */ }
            throw new Error(errorDetail);
          }

          const updatedCompanyData: Company = await apiResponse.json();
          setCompanyData(prev => ({ ...prev, ...updatedCompanyData } as Company));
          setImagePreviewUrl(downloadURL);
          setSelectedFile(null);
          const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

          toast({ title: "Sucesso!", description: "Logo da clínica atualizado." });
        } catch (apiError) {
          console.error("Erro ao salvar URL do logo:", apiError);
          toast({ title: "Erro ao Salvar Logo", description: apiError instanceof Error ? apiError.message : 'Ocorreu um erro ao atualizar o perfil da clínica.', variant: "destructive" });
        } finally {
          setIsUploading(false);
        }
      }
    );
  };


  if (isLoading && !companyData && !isPermissionError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Carregando configurações da clínica...</p>
      </div>
    );
  }

  const displayCompanyForForm = companyData || (isNotFound ? { ...placeholderCompanyData, id: user?.companyId || 'new_clinic_placeholder', cnpj: user?.companyCnpj || placeholderCompanyData.cnpj } : null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings2 className="mr-3 h-8 w-8 text-primary" />
            Configurações da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie as informações e preferências da sua clínica.</p>
      </div>

      {isPermissionError && (
         <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erro de Permissão no Firestore!</AlertTitle>
          <AlertDescription>Não foi possível carregar ou salvar os dados da sua clínica. **VERIFIQUE SUAS REGRAS DE SEGURANÇA DO FIRESTORE NO CONSOLE DO FIREBASE.** Para teste inicial, você pode usar `allow read, write: if true;` na coleção `companies`. Os dados exibidos são placeholders e as alterações não serão salvas.</AlertDescription>
        </Alert>
      )}
      {isNotFound && !isPermissionError && (
         <Alert variant="default" className="border-primary/50 text-primary bg-primary/10">
          <AlertTriangle className="h-5 w-5 !text-primary" />
          <AlertTitle>Nova Clínica</AlertTitle>
          <AlertDescription>Clínica não encontrada. Preencha o nome abaixo para registrá-la. O CNPJ será o associado ao seu usuário (se houver) ou um valor padrão, e não pode ser alterado aqui inicialmente.</AlertDescription>
        </Alert>
      )}
      {error && !isNotFound && !isPermissionError && (
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
                      <Input id="clinicName" placeholder="Nome da sua clínica" {...field} disabled={isLoading || isPermissionError} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {displayCompanyForForm?.cnpj && (
                <div className="space-y-2">
                  <Label htmlFor="clinicCnpj">CNPJ</Label>
                  <Input id="clinicCnpj" value={displayCompanyForForm.cnpj} disabled />
                  <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado aqui.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={form.formState.isSubmitting || isLoading || isPermissionError}>
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
          <CardDescription>Faça o upload ou atualize o logo da sua clínica (máx 5MB).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {imagePreviewUrl ? (
              <Image
                src={imagePreviewUrl}
                alt="Prévia do Logo"
                width={128}
                height={128}
                className="rounded-md object-contain border"
                data-ai-hint="company logo"
              />
            ) : (
              <div className="h-32 w-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 opacity-50" />
              </div>
            )}
            <div>
              <Label htmlFor="logoUpload" className="sr-only">Escolher arquivo de logo</Label>
              <Input
                id="logoUpload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                disabled={isPermissionError || isLoading}
              />
              {selectedFile && <p className="text-xs text-muted-foreground mt-1">Arquivo selecionado: {selectedFile.name}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSaveLogo} disabled={!selectedFile || isUploading || !user?.companyId || !storage || isPermissionError || isLoading}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? 'Enviando...' : 'Enviar Novo Logo'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
