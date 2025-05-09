'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const newCompanySchema = z.object({
  name: z.string().min(3, { message: 'Nome da empresa deve ter no mínimo 3 caracteres.' }),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX' }),
});

type NewCompanyFormValues = z.infer<typeof newCompanySchema>;

export default function NovaEmpresaPage() {
  const router = useRouter();
  const form = useForm<NewCompanyFormValues>({
    resolver: zodResolver(newCompanySchema),
    defaultValues: {
      name: '',
      cnpj: '',
    },
  });

  const onSubmit: SubmitHandler<NewCompanyFormValues> = async (data) => {
    console.log('Nova Empresa Data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Empresa Criada!",
      description: `A empresa ${data.name} foi criada com sucesso.`,
      variant: "default", // Using default, accent green is for achievements.
    });
    router.push('/empresas');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/empresas" passHref>
          <Button variant="outline" size="icon">
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
              <CardDescription>Informações básicas da nova empresa.</CardDescription>
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
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <span className="animate-spin mr-2">◌</span>
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
