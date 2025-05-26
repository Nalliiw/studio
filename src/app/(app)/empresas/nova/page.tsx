
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Não usado diretamente, mas FormLabel sim
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const newCompanySchema = z.object({
  name: z.string().min(3, { message: 'Nome da empresa deve ter no mínimo 3 caracteres.' }),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX' }),
  responsibleName: z.string().min(3, { message: 'Nome do responsável é obrigatório.' }),
  responsibleEmail: z.string().email({ message: 'Email do responsável inválido.' }),
  responsiblePhone: z.string().optional(),
});

type NewCompanyFormValues = z.infer<typeof newCompanySchema>;

export default function NovaEmpresaPage() {
  const router = useRouter();
  const form = useForm<NewCompanyFormValues>({
    resolver: zodResolver(newCompanySchema),
    defaultValues: {
      name: '',
      cnpj: '',
      responsibleName: '',
      responsibleEmail: '',
      responsiblePhone: '',
    },
  });

  const onSubmit: SubmitHandler<NewCompanyFormValues> = async (data) => {
    const companyId = `comp_${Date.now().toString()}`; // Simula geração de ID
    const companyDataWithId = { ...data, id: companyId };

    console.log("Dados da Nova Empresa (Simulação):", companyDataWithId);
    // Simulação de chamada de API
    // No futuro, aqui iria:
    // const response = await fetch('/api/companies', { method: 'POST', body: JSON.stringify(companyDataWithId) });
    // if (!response.ok) { throw new Error('Falha ao criar empresa'); }
    // const newCompany = await response.json();
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay da API
    
    toast({
      title: "Empresa Criada (Simulação)!",
      description: `A empresa ${data.name} (ID: ${companyId}) foi registrada com sucesso (simulação).`,
    });
    router.push('/empresas');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/empresas" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para empresas">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Nova Empresa</h1>
          <p className="text-muted-foreground">Preencha os dados para cadastrar uma nova empresa.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>Informações básicas e de contato da nova empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Clínica Saúde Total" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use o formato XX.XXX.XXX/XXXX-XX.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsibleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dr. Carlos Alberto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsibleEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Responsável</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="responsavel@clinica.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsiblePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do Responsável (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
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
                Salvar Empresa
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
