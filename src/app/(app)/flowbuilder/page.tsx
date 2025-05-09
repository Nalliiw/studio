// src/app/(app)/flowbuilder/page.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Workflow, Save, PlusCircle, Trash2, Eye, PlayCircle, ListChecks, TextCursorInput,
  CircleDot, ImageUp, Smile, Mic, Video as VideoIcon, FileText, Image as ImageIcon, FileAudio, Film, AlignLeft, HelpCircle, GripVertical
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { FlowStep, FlowStepType } from '@/types';
import { cn } from '@/lib/utils';

interface Tool {
  type: FlowStepType;
  label: string;
  icon: React.ElementType;
  defaultConfig: FlowStep['config'];
  defaultTitle: string;
}

const toolPalette: Tool[] = [
  { type: 'information_text', label: 'Bloco de Texto', icon: AlignLeft, defaultConfig: { text: 'Texto informativo...' }, defaultTitle: 'Informação' },
  { type: 'text_input', label: 'Campo de Texto', icon: TextCursorInput, defaultConfig: { text: 'Qual sua pergunta?', placeholder: 'Digite aqui...' }, defaultTitle: 'Pergunta Texto' },
  { type: 'multiple_choice', label: 'Múltipla Escolha', icon: ListChecks, defaultConfig: { text: 'Escolha várias:', options: ['Opção 1', 'Opção 2'] }, defaultTitle: 'Múltipla Escolha' },
  { type: 'single_choice', label: 'Escolha Única', icon: CircleDot, defaultConfig: { text: 'Escolha uma:', options: ['Opção A', 'Opção B'] }, defaultTitle: 'Escolha Única' },
  { type: 'image_upload', label: 'Envio de Imagem', icon: ImageUp, defaultConfig: { text: 'Envie uma imagem' }, defaultTitle: 'Upload Imagem' },
  { type: 'emoji_rating', label: 'Avaliação Emoji', icon: Smile, defaultConfig: { text: 'Como você se sente?', maxEmojis: 5 }, defaultTitle: 'Avaliação Emoji' },
  { type: 'audio_record', label: 'Gravar Áudio', icon: Mic, defaultConfig: { text: 'Grave um áudio' }, defaultTitle: 'Gravar Áudio' },
  { type: 'video_record', label: 'Gravar Vídeo', icon: VideoIcon, defaultConfig: { text: 'Grave um vídeo' }, defaultTitle: 'Gravar Vídeo' },
  { type: 'display_pdf', label: 'Exibir PDF/eBook', icon: FileText, defaultConfig: { url: '', text: 'Título do PDF' }, defaultTitle: 'Visualizar PDF' },
  { type: 'display_image', label: 'Exibir Imagem', icon: ImageIcon, defaultConfig: { url: '', text: 'Legenda da Imagem' }, defaultTitle: 'Visualizar Imagem' },
  { type: 'display_audio', label: 'Tocar Áudio', icon: FileAudio, defaultConfig: { url: '', text: 'Título do Áudio' }, defaultTitle: 'Ouvir Áudio' },
  { type: 'display_video', label: 'Exibir Vídeo', icon: Film, defaultConfig: { url: '', text: 'Título do Vídeo' }, defaultTitle: 'Assistir Vídeo' },
];

const FlowStepCardComponent = ({ step, onDragStart, onClick, isDraggingOver, onRemove }: {
  step: FlowStep;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onClick: () => void;
  isDraggingOver: boolean;
  onRemove: (id: string) => void;
}) => {
  const ToolIcon = toolPalette.find(t => t.type === step.type)?.icon || HelpCircle;
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, step.id)}
      onClick={onClick}
      className={cn(
        "p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-150 ease-in-out cursor-pointer relative group/flowstepcard",
        isDraggingOver && "ring-2 ring-primary scale-[1.02] shadow-xl z-10"
      )}
      id={`step-card-${step.id}`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0 opacity-30 group-hover/flowstepcard:opacity-100 cursor-grab transition-opacity" />
        <ToolIcon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">{step.title || "Etapa Sem Título"}</p>
          <p className="text-xs text-muted-foreground">Tipo: {toolPalette.find(t => t.type === step.type)?.label || step.type}</p>
          {step.type === 'information_text' && <p className="text-sm mt-1 truncate">{step.config.text}</p>}
          {(step.type === 'multiple_choice' || step.type === 'single_choice') && (
            <div className="text-xs mt-1">
              <p className="truncate">{step.config.text}</p>
              <p className="text-muted-foreground">Opções: {step.config.options?.join(', ') || 'N/A'}</p>
            </div>
          )}
           {(step.type.startsWith('display_') || step.type.endsWith('_upload') || step.type.endsWith('_record')) && step.config.text && (
            <p className="text-sm mt-1 truncate">{step.config.text}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={(e) => { e.stopPropagation(); onRemove(step.id); }}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
};

const PropertiesEditor = ({ step, onUpdateStep, onRemoveOption, onAddOption, onOptionChange }: {
  step: FlowStep;
  onUpdateStep: (updatedStep: FlowStep) => void;
  onRemoveOption: (stepId: string, optionIndex: number) => void;
  onAddOption: (stepId: string, newOption: string) => void;
  onOptionChange: (stepId: string, optionIndex: number, newValue: string) => void;
}) => {
  const [newOptionText, setNewOptionText] = useState('');

  const handleConfigChange = (field: keyof FlowStep['config'], value: any) => {
    onUpdateStep({ ...step, config: { ...step.config, [field]: value } });
  };
  
  const handleTitleChange = (newTitle: string) => {
     onUpdateStep({ ...step, title: newTitle });
  }

  const addOption = () => {
    if (newOptionText.trim()) {
      onAddOption(step.id, newOptionText.trim());
      setNewOptionText('');
    }
  };

  return (
    <ScrollArea className="h-[calc(70vh-100px)] pr-3"> {/* Adjusted height for dialog context */}
      <div className="space-y-4">
        <div>
          <Label htmlFor={`step-title-${step.id}`}>Título da Etapa</Label>
          <Input
            id={`step-title-${step.id}`}
            value={step.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Título da etapa no fluxo"
          />
        </div>

        { (step.type.startsWith('display_') || step.type.endsWith('_input') || step.type.endsWith('_upload') || step.type.endsWith('_record') || step.type.endsWith('_choice') || step.type === 'information_text' || step.type === 'emoji_rating') && (
          <div>
            <Label htmlFor={`step-text-${step.id}`}>
              {step.type.includes('choice') || step.type.endsWith('_input') ? 'Texto da Pergunta/Instrução' : 
              step.type.startsWith('display_') ? 'Descrição/Título do Conteúdo' : 
              step.type === 'information_text' ? 'Conteúdo do Texto' :
              'Instrução'}
            </Label>
            <Textarea
              id={`step-text-${step.id}`}
              value={step.config.text || ''}
              onChange={(e) => handleConfigChange('text', e.target.value)}
              placeholder={
                  step.type.includes('choice') || step.type.endsWith('_input') ? 'Digite a pergunta ou instrução...' :
                  step.type.startsWith('display_') ? 'Ex: Vídeo sobre hidratação' :
                  step.type === 'information_text' ? 'Digite o texto informativo...' :
                  'Instruções para esta etapa...'
              }
            />
          </div>
        )}

        {step.type === 'text_input' && (
          <div>
            <Label htmlFor={`step-placeholder-${step.id}`}>Texto de Exemplo (Placeholder)</Label>
            <Input
              id={`step-placeholder-${step.id}`}
              value={step.config.placeholder || ''}
              onChange={(e) => handleConfigChange('placeholder', e.target.value)}
              placeholder="Ex: Como você se sentiu hoje?"
            />
          </div>
        )}

        {(step.type.startsWith('display_') && (step.type !== 'display_pdf')) && (
          <div>
            <Label htmlFor={`step-url-${step.id}`}>URL do Conteúdo ({step.type.replace('display_','')})</Label>
            <Input
              id={`step-url-${step.id}`}
              value={step.config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="https://exemplo.com/recurso"
            />
          </div>
        )}
        {step.type === 'display_pdf' && (
          <div>
            <Label htmlFor={`step-url-${step.id}`}>Arquivo PDF/eBook</Label>
            <Input
              id={`step-url-${step.id}`}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      handleConfigChange('url', URL.createObjectURL(file)); 
                      if (!step.config.text) handleConfigChange('text', file.name);
                  }
              }}
            />
            {step.config.url && <p className="text-xs text-muted-foreground mt-1">Arquivo selecionado: {step.config.text || step.config.url}</p>}
          </div>
        )}


        {(step.type === 'multiple_choice' || step.type === 'single_choice') && (
          <div className="space-y-2 border p-3 rounded-md">
            <Label>Opções de Resposta</Label>
            {step.config.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => onOptionChange(step.id, index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                />
                <Button variant="ghost" size="icon" onClick={() => onRemoveOption(step.id, index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                placeholder="Nova opção"
              />
              <Button variant="outline" size="sm" onClick={addOption}>Adicionar</Button>
            </div>
          </div>
        )}
        {step.type === 'emoji_rating' && (
          <div>
            <Label htmlFor={`step-max-emojis-${step.id}`}>Número de Emojis (1-5)</Label>
            <Input
              id={`step-max-emojis-${step.id}`}
              type="number"
              min="1" max="5"
              value={step.config.maxEmojis || 5}
              onChange={(e) => handleConfigChange('maxEmojis', parseInt(e.target.value,10))}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};


export default function FlowBuilderPage() {
  const [flowName, setFlowName] = useState('');
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const [isAddToolPopupOpen, setIsAddToolPopupOpen] = useState(false);
  const [isEditPropertiesPopupOpen, setIsEditPropertiesPopupOpen] = useState(false);


  const handleStepDragStart = (e: React.DragEvent<HTMLDivElement>, stepId: string) => {
    dragItem.current = stepId;
    e.dataTransfer.setData('application/flow-step-id', stepId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverCanvas = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const targetCard = (e.target as HTMLElement).closest('[draggable="true"]');
    if (targetCard && dragItem.current && targetCard.id !== `step-card-${dragItem.current}`) {
        dragOverItem.current = targetCard.id.replace('step-card-','');
    } else {
        dragOverItem.current = null;
    }
    // Force re-render to update visual feedback on dragOverItem
    setFlowSteps(prev => [...prev]); 
  };

  const handleDropOnCanvas = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedStepId = e.dataTransfer.getData('application/flow-step-id');

    if (draggedStepId && dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
      const activeStepIndex = flowSteps.findIndex(step => step.id === dragItem.current);
      const overStepIndex = flowSteps.findIndex(step => step.id === dragOverItem.current);

      if (activeStepIndex !== -1 && overStepIndex !== -1) {
        const newSteps = [...flowSteps];
        const [draggedItemElement] = newSteps.splice(activeStepIndex, 1);
        newSteps.splice(overStepIndex, 0, draggedItemElement);
        setFlowSteps(newSteps);
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
    // Force re-render to clear visual feedback after drop
    setFlowSteps(prev => [...prev]); 
  };


  const handleAddToolFromPopup = useCallback((toolType: FlowStepType) => {
    const tool = toolPalette.find(t => t.type === toolType);
    if (!tool) return;

    const newStep: FlowStep = {
      id: Date.now().toString(),
      type: tool.type,
      title: tool.defaultTitle,
      config: { ...tool.defaultConfig },
    };
    setFlowSteps(prev => [...prev, newStep]);
    toast({ title: "Elemento Adicionado", description: `${tool.label} foi adicionado ao fluxo.` });
    setIsAddToolPopupOpen(false);
  }, [setFlowSteps, setIsAddToolPopupOpen]);


  const handleOpenEditProperties = (stepId: string) => {
    setSelectedStepId(stepId);
    setIsEditPropertiesPopupOpen(true);
  };

  const handleUpdateStep = (updatedStep: FlowStep) => {
    setFlowSteps(prev => prev.map(s => s.id === updatedStep.id ? updatedStep : s));
  };

  const removeStep = (idToRemove: string) => {
    setFlowSteps(prev => prev.filter(s => s.id !== idToRemove));
    if (selectedStepId === idToRemove) {
      setSelectedStepId(null);
      setIsEditPropertiesPopupOpen(false);
    }
    toast({ title: "Elemento Removido", description: "A etapa foi removida do fluxo." });
  };
  
  const handleAddOptionToStep = (stepId: string, newOption: string) => {
    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId && (step.type === 'multiple_choice' || step.type === 'single_choice')) {
          const options = step.config.options ? [...step.config.options, newOption] : [newOption];
          return { ...step, config: { ...step.config, options } };
        }
        return step;
      })
    );
  };

  const handleRemoveOptionFromStep = (stepId: string, optionIndex: number) => {
    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId && (step.type === 'multiple_choice' || step.type === 'single_choice')) {
          const options = step.config.options?.filter((_, idx) => idx !== optionIndex);
          return { ...step, config: { ...step.config, options } };
        }
        return step;
      })
    );
  };
  
  const handleOptionChange = (stepId: string, optionIndex: number, newValue: string) => {
    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId && step.config.options) {
          const newOptions = [...step.config.options];
          newOptions[optionIndex] = newValue;
          return { ...step, config: { ...step.config, options: newOptions } };
        }
        return step;
      })
    );
  };

  const handleSaveFlow = async () => {
    if (flowName.trim() === '') {
      toast({ title: "Erro", description: "O nome do fluxo é obrigatório.", variant: "destructive" });
      return;
    }
    if (flowSteps.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos uma etapa ao fluxo.", variant: "destructive" });
      return;
    }
    console.log('Saving flow:', { flowName, steps: flowSteps });
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    toast({ title: "Fluxo Salvo!", description: `O fluxo "${flowName}" foi salvo com sucesso.` });
  };

  const currentStepToEdit = flowSteps.find(s => s.id === selectedStepId);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]"> {/* Adjusted for better screen fit with footer */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criador de Fluxos</h1>
          <p className="text-muted-foreground">Crie formulários e fluxos personalizados para seus pacientes.</p>
        </div>
         <Link href="/flowbuilder" passHref> 
            <Button variant="outline"><ListChecks className="mr-2 h-4 w-4" /> Meus Fluxos</Button>
        </Link>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="mr-2 h-5 w-5 text-primary" />
            Nome do Fluxo
          </CardTitle>
        </CardHeader>
        <CardContent>
            <Input
              id="flowName"
              placeholder="Ex: Questionário Inicial de Hábitos"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
            />
        </CardContent>
      </Card>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 p-4 bg-background rounded-lg shadow-md overflow-y-auto border border-dashed border-muted relative"
          onDrop={handleDropOnCanvas}
          onDragOver={handleDragOverCanvas}
        >
          <Dialog open={isAddToolPopupOpen} onOpenChange={setIsAddToolPopupOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default" 
                size="lg"
                className="absolute top-4 left-4 z-10 rounded-full shadow-lg"
                aria-label="Adicionar Etapa ao Fluxo"
                title="Adicionar Etapa ao Fluxo"
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Etapa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh]"> {/* Wider dialog */}
              <DialogHeader>
                <DialogTitle>Adicionar Nova Etapa ao Fluxo</DialogTitle>
                <DialogDescription>
                  Selecione um tipo de etapa para adicionar ao seu fluxo.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[65vh] p-1 -m-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
                  {toolPalette.map(tool => (
                    <Card
                      key={tool.type}
                      onClick={() => handleAddToolFromPopup(tool.type)}
                      className="p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:shadow-xl hover:border-primary transition-all duration-150 ease-in-out transform hover:scale-105"
                    >
                      <tool.icon className="h-10 w-10 text-primary mb-2" />
                      <span className="text-sm font-medium">{tool.label}</span>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddToolPopupOpen(false)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {flowSteps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Workflow className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Clique no botão <PlusCircle className="inline h-5 w-5 align-text-bottom" /> <span className="font-semibold">Adicionar Etapa</span> no canto superior para começar.</p>
                <p className="text-sm">Você pode adicionar perguntas, informações, mídias e outras interações.</p>
            </div>
          ) : (
            <div className="pt-20"> {/* Increased padding top */}
                {flowSteps.map(step => (
                <FlowStepCardComponent
                    key={step.id}
                    step={step}
                    onDragStart={handleStepDragStart}
                    onClick={() => handleOpenEditProperties(step.id)}
                    isDraggingOver={dragOverItem.current === step.id && !!dragItem.current && dragItem.current !== step.id}
                    onRemove={removeStep}
                />
                ))}
            </div>
          )}
        </div>
      </div>

      {currentStepToEdit && (
        <Dialog open={isEditPropertiesPopupOpen} onOpenChange={setIsEditPropertiesPopupOpen}>
          <DialogContent className="sm:max-w-xl max-h-[85vh]"> {/* Wider dialog for properties */}
            <DialogHeader>
              <DialogTitle>Editar Etapa: <span className="font-semibold">{currentStepToEdit.title}</span></DialogTitle>
              <DialogDescription>
                Modifique as configurações da etapa <span className="italic">{toolPalette.find(t => t.type === currentStepToEdit.type)?.label || currentStepToEdit.type}</span> selecionada.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <PropertiesEditor
                step={currentStepToEdit}
                onUpdateStep={handleUpdateStep}
                onAddOption={handleAddOptionToStep}
                onRemoveOption={handleRemoveOptionFromStep}
                onOptionChange={handleOptionChange}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEditPropertiesPopupOpen(false)}>Concluído</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <CardFooter className="border-t pt-6 mt-auto flex justify-end gap-2 bg-card shadow-inner">
        <Button variant="outline" onClick={() => alert("Simulação de fluxo ainda não implementada.")}><Eye className="mr-2 h-4 w-4" /> Simular</Button>
        <Button variant="outline" onClick={() => alert("Ativação de fluxo ainda não implementada.")}><PlayCircle className="mr-2 h-4 w-4" /> Ativar Fluxo</Button>
        <Button onClick={handleSaveFlow}>
          <Save className="mr-2 h-4 w-4" /> Salvar Fluxo
        </Button>
      </CardFooter>
    </div>
  );
}
