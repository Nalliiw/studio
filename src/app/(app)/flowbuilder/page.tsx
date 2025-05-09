'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Workflow, Save, PlusCircle, Trash2, Eye, PlayCircle, ListChecks, TextCursorInput } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { FormQuestion } from '@/types';

export default function FlowBuilderPage() {
  const [flowName, setFlowName] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);

  // State for the question currently being built
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentQuestionType, setCurrentQuestionType] = useState<FormQuestion['type']>('text');
  const [currentQuestionOptions, setCurrentQuestionOptions] = useState<string[]>([]);
  const [newOptionText, setNewOptionText] = useState('');

  const addOptionToCurrentQuestion = () => {
    if (newOptionText.trim() === '') {
      toast({ title: "Erro", description: "O texto da opção não pode estar vazio.", variant: "destructive" });
      return;
    }
    setCurrentQuestionOptions([...currentQuestionOptions, newOptionText.trim()]);
    setNewOptionText('');
  };

  const removeOptionFromCurrentQuestion = (indexToRemove: number) => {
    setCurrentQuestionOptions(currentQuestionOptions.filter((_, index) => index !== indexToRemove));
  };

  const addCurrentQuestionToFlow = () => {
    if (currentQuestionText.trim() === '') {
      toast({ title: "Erro", description: "O texto da pergunta não pode estar vazio.", variant: "destructive" });
      return;
    }
    if (currentQuestionType === 'multiple_choice' && currentQuestionOptions.length < 2) {
      toast({ title: "Erro", description: "Perguntas de múltipla escolha devem ter pelo menos duas opções.", variant: "destructive" });
      return;
    }

    const newQuestion: FormQuestion = {
      id: Date.now().toString(),
      text: currentQuestionText.trim(),
      type: currentQuestionType,
      options: currentQuestionType === 'multiple_choice' ? currentQuestionOptions : undefined,
    };

    setQuestions([...questions, newQuestion]);

    // Reset form for new question
    setCurrentQuestionText('');
    setCurrentQuestionType('text');
    setCurrentQuestionOptions([]);
    setNewOptionText('');
    toast({ title: "Sucesso", description: "Pergunta adicionada ao fluxo." });
  };

  const removeQuestionFromFlow = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({ title: "Sucesso", description: "Pergunta removida do fluxo." });
  };

  const handleSaveFlow = async () => {
    if (flowName.trim() === '') {
      toast({ title: "Erro", description: "O nome do fluxo é obrigatório.", variant: "destructive" });
      return;
    }
    if (questions.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos uma pergunta ao fluxo.", variant: "destructive" });
      return;
    }

    console.log('Saving flow:', { flowName, questions });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Fluxo Salvo!",
      description: `O fluxo "${flowName}" foi salvo com sucesso.`,
    });
    // Optionally reset the flow builder page or redirect
    // setFlowName('');
    // setQuestions([]);
  };

  const getQuestionTypeIcon = (type: FormQuestion['type']) => {
    switch(type) {
      case 'text': return <TextCursorInput className="h-4 w-4 text-muted-foreground mr-2" />;
      case 'multiple_choice': return <ListChecks className="h-4 w-4 text-muted-foreground mr-2" />;
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criador de Fluxos</h1>
          <p className="text-muted-foreground">Crie formulários e fluxos personalizados para seus pacientes.</p>
        </div>
        <Link href="/flowbuilder" passHref> {/* Assuming /flowbuilder is the list of flows, or /flowbuilder/novo is the same page */}
            <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Novo Fluxo</Button>
        </Link>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="mr-2 h-6 w-6 text-primary" />
            Definir Nome do Fluxo
          </CardTitle>
        </CardHeader>
        <CardContent>
            <Label htmlFor="flowName" className="text-base font-medium">Nome do Fluxo</Label>
            <Input
              id="flowName"
              placeholder="Ex: Questionário Inicial de Hábitos"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="mt-1"
            />
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Editor de Nova Pergunta</CardTitle>
            <CardDescription>Adicione perguntas de texto ou múltipla escolha ao seu fluxo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="currentQuestionText">Texto da Pergunta</Label>
                <Textarea
                    id="currentQuestionText"
                    placeholder="Digite o texto da sua pergunta aqui..."
                    value={currentQuestionText}
                    onChange={(e) => setCurrentQuestionText(e.target.value)}
                    className="mt-1 min-h-[60px]"
                />
            </div>
            <div>
                <Label htmlFor="currentQuestionType">Tipo da Pergunta</Label>
                <Select value={currentQuestionType} onValueChange={(value: FormQuestion['type']) => setCurrentQuestionType(value)}>
                    <SelectTrigger id="currentQuestionType" className="mt-1">
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {currentQuestionType === 'multiple_choice' && (
                <div className="space-y-3 rounded-md border p-4">
                    <Label className="text-base font-medium">Opções da Pergunta</Label>
                    {currentQuestionOptions.length > 0 && (
                        <ul className="space-y-1">
                            {currentQuestionOptions.map((opt, index) => (
                                <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                                    <span>{opt}</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeOptionFromCurrentQuestion(index)} aria-label="Remover opção">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                     {currentQuestionOptions.length < 2 && (
                         <p className="text-xs text-muted-foreground">Adicione pelo menos duas opções.</p>
                     )}
                    <div className="flex items-center gap-2">
                        <Input
                            id="newOptionText"
                            placeholder="Texto da nova opção"
                            value={newOptionText}
                            onChange={(e) => setNewOptionText(e.target.value)}
                        />
                        <Button type="button" variant="outline" onClick={addOptionToCurrentQuestion}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Opção
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Button onClick={addCurrentQuestionToFlow}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pergunta ao Fluxo
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Perguntas do Fluxo</CardTitle>
            <CardDescription>Visualize e gerencie as perguntas adicionadas ao fluxo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {questions.length > 0 ? (
              <ul className="space-y-2 rounded-md border p-4">
                {questions.map((q, index) => (
                  <li key={q.id} className="p-3 bg-muted/50 rounded-md">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center text-sm font-medium">
                                {getQuestionTypeIcon(q.type)}
                                <span>{index + 1}. {q.text}</span>
                            </div>
                            {q.type === 'multiple_choice' && q.options && (
                                <ul className="list-disc list-inside pl-5 mt-1 text-xs text-muted-foreground">
                                    {q.options.map((opt, optIndex) => <li key={optIndex}>{opt}</li>)}
                                </ul>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeQuestionFromFlow(q.id)} aria-label="Remover pergunta do fluxo">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
                <p className="text-sm text-muted-foreground p-4 border rounded-md text-center">Nenhuma pergunta adicionada ao fluxo ainda.</p>
            )}
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end gap-2">
          <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> Simular</Button>
          <Button variant="outline"><PlayCircle className="mr-2 h-4 w-4" /> Ativar Fluxo</Button>
          <Button onClick={handleSaveFlow}>
            <Save className="mr-2 h-4 w-4" /> Salvar Fluxo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
