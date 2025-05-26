
// src/app/(app)/central-ajuda/novo/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, PlusCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { HelpMaterialType, HelpMaterialAudience } from '@/types';

const helpMaterialTypes: { value: HelpMaterialType; label: string }[] = [
  { value: 'faq', label: 'FAQ (Pergunta Frequente)' },
  { value: 'video', label: 'Vídeo' },
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'Documento (Texto Geral)' },
  { value: 'external_link', label: 'Link Externo' },
];

const audienceOptions: { id: HelpMaterialAudience; label: string }[] = [
  { id: 'support', label: 'Suporte Interno' },
  { id: 'clinic', label: 'Clínicas / Especialistas' },
  { id: 'patient', label: 'Pacientes' },
];

const newHelpMaterialSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter no mínimo 5 caracteres.' }),
  type: z.enum(['faq', 'video', 'pdf', 'document', 'external_link'], {
    errorMap: () => ({ message: "Selecione um tipo de material válido." }),
  }),
  content: z.string().min(10, { message: 'O conteúdo/URL deve ter no mínimo 10 caracteres.' }),
  audience: z.array(z.enum(['support', 'clinic', 'patient'])).min(1, { message: "Selecione pelo menos um público-alvo." }),
  category: z.string().optional(),
});

type NewHelpMaterialFormValues = z.infer<typeof newHelpMaterialSchema>;

export default function NovoMaterialAjudaPage() {
  const router = useRouter();
  const [selectedFileType, setSelectedFileType] = useState<HelpMaterialType | ''>('');

  const form = useForm<NewHelpMaterialFormValues>({
    resolver: zodResolver(newHelpMaterialSchema),
    defaultValues: {
      title: '',
      type: undefined,
      content: '',
      audience: [],
      category: '',
    },
  });

  const onSubmit: SubmitHandler<NewHelpMaterialFormValues> = (data) => {
    console.log('Novo Material de Ajuda (Simulação):', data);
    // Simulação de chamada de API
    toast({
      title: "Material Salvo (Simulação)!",
      description: `O material "${data.title}" foi salvo com sucesso (simulação).`,
    });
    router.push('/central-ajuda');
  };

  const currentType = form.watch('type');

  const getContentLabel = () => {
    switch (currentType) {
      case 'video':
      case 'external_link':
        return 'URL do Conteúdo';
      case 'faq':
        return 'Resposta da Pergunta';
      case 'pdf':
      case 'document':
        return 'Conteúdo do Documento / Descrição'; // Será um upload no futuro
      default:
        return 'Conteúdo / URL';
    }
  };
  
  const getContentPlaceholder = () => {
    switch (currentType) {
      case 'video': return 'https://youtube.com/watch?v=exemplo';
      case 'external_link': return 'https://site.com/artigo';
      case 'faq': return 'Explique detalhadamente a resposta aqui...';
      case 'pdf':
      case 'document':
        return 'Descreva o documento. O upload será implementado.';
      default:
        return 'Insira o texto ou URL aqui...';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/central-ajuda" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para Central de Ajuda">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <PlusCircle className="mr-3 h-8 w-8 text-primary"/>
            Adicionar Novo Material de Ajuda
          </h1>
          <p className="text-muted-foreground">Preencha os detalhes do novo material para a central de suporte.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
              <CardTitle>Detalhes do Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Material</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Como configurar seu perfil inicial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Material</FormLabel>
                    <Select onValueChange={(value: HelpMaterialType) => {field.onChange(value); setSelectedFileType(value);}} value={field.value as HelpMaterialType | undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {helpMaterialTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Campo de Conteúdo Condicional */}
              {currentType && (currentType === 'pdf' || currentType === 'document') && (
                 <FormItem>
                    <FormLabel>Arquivo do {currentType === 'pdf' ? 'PDF' : 'Documento'}</FormLabel>
                    <Input type="file" disabled accept={currentType === 'pdf' ? '.pdf' : '.doc,.docx,.txt'} />
                    <FormDescription>A funcionalidade de upload de arquivo será implementada futuramente.</FormDescription>
                 </FormItem>
              )}

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getContentLabel()}</FormLabel>
                    <FormControl>
                      {(currentType === 'faq' || currentType === 'document' && !(currentType === 'pdf')) ? ( // 'document' aqui seria um texto geral se não for upload
                        <Textarea placeholder={getContentPlaceholder()} {...field} rows={5} />
                      ) : (
                        <Input placeholder={getContentPlaceholder()} {...field} type={currentType === 'video' || currentType === 'external_link' ? 'url' : 'text'} />
                      )}
                    </FormControl>
                     {currentType === 'pdf' && <FormDescription className="text-xs">Cole aqui a URL do PDF já hospedado, ou aguarde a função de upload.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audience"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                        <FormLabel className="text-base">Público-Alvo</FormLabel>
                        <FormDescription>Selecione para quem este material será visível.</FormDescription>
                    </div>
                    <div className="space-y-2 rounded-md border p-3">
                        {audienceOptions.map((option) => (
                        <FormField
                            key={option.id}
                            control={form.control}
                            name="audience"
                            render={({ field }) => {
                            return (
                                <FormItem
                                key={option.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), option.id])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== option.id
                                            )
                                        );
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    {option.label}
                                </FormLabel>
                                </FormItem>
                            );
                            }}
                        />
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Primeiros Passos, Faturamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Material
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
