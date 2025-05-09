'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow, Save, PlusCircle, Trash2, Eye, PlayCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface FlowQuestion {
  id: string;
  text: string;
}

export default function FlowBuilderPage() {
  const [flowName, setFlowName] = useState('');
  const [questions, setQuestions] = useState<FlowQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const addQuestion = () => {
    if (newQuestionText.trim() === '') {
      toast({ title: "Erro", description: "A pergunta não pode estar vazia.", variant: "destructive" });
      return;
    }
    setQuestions([...questions, { id: Date.now().toString(), text: newQuestionText.trim() }]);
    setNewQuestionText('');
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criador de Fluxos</h1>
          <p className="text-muted-foreground">Crie formulários e fluxos personalizados para seus pacientes.</p>
        </div>
        <Link href="/flowbuilder/novo" passHref>
            <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Novo Fluxo</Button>
        </Link>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="mr-2 h-6 w-6 text-primary" />
            Editor de Fluxo Simplificado
          </CardTitle>
          <CardDescription>
            Defina o nome do fluxo e adicione as perguntas. Por enquanto, apenas perguntas de texto são suportadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="flowName" className="text-base font-medium">Nome do Fluxo</Label>
            <Input
              id="flowName"
              placeholder="Ex: Questionário Inicial de Hábitos"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Perguntas do Fluxo</Label>
            {questions.length > 0 && (
              <ul className="space-y-2 rounded-md border p-4">
                {questions.map((q, index) => (
                  <li key={q.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="text-sm">{index + 1}. {q.text}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} aria-label="Remover pergunta">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
             {questions.length === 0 && (
                <p className="text-sm text-muted-foreground p-4 border rounded-md text-center">Nenhuma pergunta adicionada ainda.</p>
             )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newQuestion" className="text-base font-medium">Nova Pergunta</Label>
            <div className="flex gap-2">
              <Textarea
                id="newQuestion"
                placeholder="Digite o texto da sua pergunta aqui..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="min-h-[60px]"
              />
              <Button type="button" onClick={addQuestion} variant="outline" className="self-end">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>
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
