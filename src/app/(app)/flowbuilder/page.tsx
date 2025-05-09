// src/app/(app)/flowbuilder/page.tsx
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Workflow, Save, PlusCircle, Trash2, Eye, PlayCircle, ListChecks, TextCursorInput,
  CircleDot, ImageUp, Smile, Mic, Video as VideoIcon, FileText, Image as ImageIcon, FileAudio, Film, AlignLeft, HelpCircle, Link2, Variable, ZoomIn, ZoomOut, Move
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { FlowStep, FlowStepType, FlowStepOption, FlowStepConfig } from '@/types';
import { cn } from '@/lib/utils';

interface Tool {
  type: FlowStepType;
  label: string;
  icon: React.ElementType;
  defaultConfig: FlowStepConfig;
  defaultTitle: string;
}

const toolPalette: Tool[] = [
  { type: 'information_text', label: 'Bloco de Texto', icon: AlignLeft, defaultConfig: { text: 'Texto informativo...' }, defaultTitle: 'Informação' },
  { type: 'text_input', label: 'Campo de Texto', icon: TextCursorInput, defaultConfig: { text: 'Qual sua pergunta?', placeholder: 'Digite aqui...' }, defaultTitle: 'Pergunta Texto' },
  { type: 'multiple_choice', label: 'Múltipla Escolha', icon: ListChecks, defaultConfig: { text: 'Escolha várias:', options: [{value: 'opt1', label:'Opção 1'}, {value: 'opt2', label:'Opção 2'}] }, defaultTitle: 'Múltipla Escolha' },
  { type: 'single_choice', label: 'Escolha Única', icon: CircleDot, defaultConfig: { text: 'Escolha uma:', options: [{value: 'optA', label:'Opção A'}, {value: 'optB', label:'Opção B'}] }, defaultTitle: 'Escolha Única' },
  { type: 'image_upload', label: 'Envio de Imagem', icon: ImageUp, defaultConfig: { text: 'Envie uma imagem' }, defaultTitle: 'Upload Imagem' },
  { type: 'emoji_rating', label: 'Avaliação Emoji', icon: Smile, defaultConfig: { text: 'Como você se sente?', maxEmojis: 5 }, defaultTitle: 'Avaliação Emoji' },
  { type: 'audio_record', label: 'Gravar Áudio', icon: Mic, defaultConfig: { text: 'Grave um áudio' }, defaultTitle: 'Gravar Áudio' },
  { type: 'video_record', label: 'Gravar Vídeo', icon: VideoIcon, defaultConfig: { text: 'Grave um vídeo' }, defaultTitle: 'Gravar Vídeo' },
  { type: 'display_pdf', label: 'Exibir PDF/eBook', icon: FileText, defaultConfig: { url: '', text: 'Título do PDF' }, defaultTitle: 'Visualizar PDF' },
  { type: 'display_image', label: 'Exibir Imagem', icon: ImageIcon, defaultConfig: { url: '', text: 'Legenda da Imagem' }, defaultTitle: 'Visualizar Imagem' },
  { type: 'display_audio', label: 'Tocar Áudio', icon: FileAudio, defaultConfig: { url: '', text: 'Título do Áudio' }, defaultTitle: 'Ouvir Áudio' },
  { type: 'display_video', label: 'Exibir Vídeo', icon: Film, defaultConfig: { url: '', text: 'Título do Vídeo' }, defaultTitle: 'Assistir Vídeo' },
];

const NO_NEXT_STEP_VALUE = "__NO_NEXT_STEP__"; // Ensure this value doesn't cause issues with SelectItem

const FlowStepCardComponent = ({ step, onClick, onRemove, allSteps, onMouseDownCard }: {
  step: FlowStep;
  onClick: () => void;
  onRemove: (id: string) => void;
  allSteps: FlowStep[];
  onMouseDownCard: (e: React.MouseEvent<HTMLDivElement>, stepId: string) => void;
}) => {
  const ToolIcon = toolPalette.find(t => t.type === step.type)?.icon || HelpCircle;
  const getStepTitleById = (id?: string) => allSteps.find(s => s.id === id)?.title || 'Próxima Etapa';

  return (
    <Card
      onMouseDown={(e) => onMouseDownCard(e, step.id)}
      onClick={onClick}
      className={cn(
        "p-3 mb-3 shadow-md hover:shadow-lg transition-all duration-150 ease-in-out cursor-grab absolute w-64",
        // Removed isDraggingOver logic as drag-and-drop is now for positioning
      )}
      id={`step-card-${step.id}`}
      style={{ left: step.position.x, top: step.position.y }}
    >
      <div className="flex items-start gap-2">
        <ToolIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0"> {/* Added min-w-0 for truncation */}
          <p className="font-semibold truncate">{step.title || "Etapa Sem Título"}</p>
          <p className="text-xs text-muted-foreground">Tipo: {toolPalette.find(t => t.type === step.type)?.label || step.type}</p>
          
          {step.config.setOutputVariable && (
            <p className="text-xs text-blue-600 mt-0.5 flex items-center truncate">
              <Variable className="inline h-3 w-3 mr-1 flex-shrink-0" /> Salva em: <span className="font-mono ml-1 truncate">{step.config.setOutputVariable}</span>
            </p>
          )}

          {step.type === 'information_text' && step.config.text && (
             <p className="text-xs mt-1 text-muted-foreground truncate">{step.config.text}</p>
          )}
          
          {(step.type === 'multiple_choice' || step.type === 'single_choice') && step.config.options && (
            <div className="text-xs mt-1 space-y-0.5">
              <p className="truncate font-medium text-muted-foreground">{step.config.text}</p>
              {step.config.options.slice(0, 2).map(opt => ( // Show max 2 options
                <div key={opt.value} className="flex items-center truncate">
                  <span className="text-muted-foreground mr-1">- {opt.label}</span>
                  {opt.nextStepId && (
                    <span className="text-primary text-xs flex items-center">
                      <Link2 className="inline h-3 w-3 mr-0.5 flex-shrink-0" /> {getStepTitleById(opt.nextStepId)}
                    </span>
                  )}
                </div>
              ))}
              {step.config.options.length > 2 && <p className="text-muted-foreground text-xs">...</p>}
            </div>
          )}

           {(step.type.startsWith('display_') || step.type.endsWith('_upload') || step.type.endsWith('_record')) && step.config.text && (
            <p className="text-xs mt-1 text-muted-foreground truncate">{step.config.text}</p>
          )}

          {step.config.defaultNextStepId && !step.type.includes('choice') && (
             <p className="text-xs text-primary mt-1 flex items-center truncate">
                <Link2 className="inline h-3 w-3 mr-1 flex-shrink-0" /> Próximo: {getStepTitleById(step.config.defaultNextStepId)}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={(e) => { e.stopPropagation(); onRemove(step.id); }}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
};

const PropertiesEditor = ({ step, onUpdateStep, onRemoveOption, onAddOption, onOptionChange, allSteps }: {
  step: FlowStep;
  onUpdateStep: (updatedStep: FlowStep) => void;
  onRemoveOption: (stepId: string, optionValue: string) => void;
  onAddOption: (stepId: string, newOptionLabel: string) => void;
  onOptionChange: (stepId: string, optionValue: string, newLabel: string, newNextStepId?: string) => void;
  allSteps: FlowStep[];
}) => {
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const availableNextSteps = allSteps.filter(s => s.id !== step.id);

  const handleConfigChange = (field: keyof FlowStepConfig, value: any) => {
    onUpdateStep({ ...step, config: { ...step.config, [field]: value } });
  };
  
  const handleTitleChange = (newTitle: string) => {
     onUpdateStep({ ...step, title: newTitle });
  }

  const addOption = () => {
    if (newOptionLabel.trim()) {
      onAddOption(step.id, newOptionLabel.trim());
      setNewOptionLabel('');
    }
  };
  
  const safeSelectValue = (value: string | undefined) => value || NO_NEXT_STEP_VALUE;


  return (
    <ScrollArea className="h-[calc(70vh-100px)] pr-3">
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

        <div>
            <Label htmlFor={`step-setoutputvariable-${step.id}`}>Nome da Variável de Saída (Opcional)</Label>
            <Input
                id={`step-setoutputvariable-${step.id}`}
                value={step.config.setOutputVariable || ''}
                onChange={(e) => handleConfigChange('setOutputVariable', e.target.value)}
                placeholder="Ex: sentimento_usuario, foto_refeicao"
            />
            <p className="text-xs text-muted-foreground mt-1">Se preenchido, a resposta desta etapa será salva nesta variável.</p>
        </div>


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
          <div className="space-y-3 border p-3 rounded-md">
            <Label>Opções de Resposta e Ramificações</Label>
            {step.config.options?.map((option) => (
              <div key={option.value} className="space-y-2 border-b pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2">
                    <Input
                    value={option.label}
                    onChange={(e) => onOptionChange(step.id, option.value, e.target.value, option.nextStepId)}
                    placeholder={`Rótulo da Opção`}
                    />
                    <Button variant="ghost" size="icon" onClick={() => onRemoveOption(step.id, option.value)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                <Select
                  value={safeSelectValue(option.nextStepId)}
                  onValueChange={(newNextStepId) => onOptionChange(step.id, option.value, option.label, newNextStepId === NO_NEXT_STEP_VALUE ? undefined : newNextStepId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Próxima etapa para esta opção..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_NEXT_STEP_VALUE}>Nenhuma (Fim do fluxo ou padrão)</SelectItem>
                    {availableNextSteps.map(nextStep => (
                      <SelectItem key={nextStep.id} value={nextStep.id}>{nextStep.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <Input
                value={newOptionLabel}
                onChange={(e) => setNewOptionLabel(e.target.value)}
                placeholder="Novo rótulo de opção"
              />
              <Button variant="outline" size="sm" onClick={addOption}>Adicionar Opção</Button>
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

        {(!step.type.includes('choice') || (step.type.includes('choice') && step.config.options && step.config.options.some(opt => !opt.nextStepId))) && (
            <div>
                <Label htmlFor={`step-defaultnextstep-${step.id}`}>Próxima Etapa Padrão</Label>
                 <Select
                    value={safeSelectValue(step.config.defaultNextStepId)}
                    onValueChange={(newDefaultNextStepId) => handleConfigChange('defaultNextStepId', newDefaultNextStepId === NO_NEXT_STEP_VALUE ? undefined : newDefaultNextStepId)}
                >
                  <SelectTrigger id={`step-defaultnextstep-${step.id}`}>
                    <SelectValue placeholder="Selecione a próxima etapa padrão..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_NEXT_STEP_VALUE}>Nenhuma (Fim do fluxo)</SelectItem>
                    {availableNextSteps.map(nextStep => (
                      <SelectItem key={nextStep.id} value={nextStep.id}>{nextStep.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                    {step.type.includes('choice') 
                    ? "Usado se uma opção não tiver ramificação específica."
                    : "Próxima etapa após esta."}
                </p>
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
  
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isAddToolPopupOpen, setIsAddToolPopupOpen] = useState(false);
  const [isEditPropertiesPopupOpen, setIsEditPropertiesPopupOpen] = useState(false);
  
  const [zoomLevel, setZoomLevel] = useState(1);


  const handleAddToolFromPopup = useCallback((toolType: FlowStepType) => {
    const tool = toolPalette.find(t => t.type === toolType);
    if (!tool) return;

    const newStep: FlowStep = {
      id: Date.now().toString(),
      type: tool.type,
      title: tool.defaultTitle,
      config: JSON.parse(JSON.stringify(tool.defaultConfig)), // Deep copy
      position: { x: 50 + Math.random() * 50, y: 80 + flowSteps.length * 20 }, // Initial position
    };
    setFlowSteps(prev => [...prev, newStep]);
    toast({ title: "Elemento Adicionado", description: `${tool.label} foi adicionado ao fluxo.` });
    setIsAddToolPopupOpen(false);
  }, [flowSteps.length, setFlowSteps, setIsAddToolPopupOpen]);


  const handleStepMouseDown = (e: React.MouseEvent<HTMLDivElement>, stepId: string) => {
    e.preventDefault(); // Prevent text selection, etc.
    const step = flowSteps.find(s => s.id === stepId);
    if (!step || !canvasRef.current) return;

    setDraggingStepId(stepId);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: (e.clientX / zoomLevel) - step.position.x - (canvasRect.left / zoomLevel),
      y: (e.clientY / zoomLevel) - step.position.y - (canvasRect.top / zoomLevel),
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingStepId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    let newX = (e.clientX / zoomLevel) - dragOffset.current.x - (canvasRect.left / zoomLevel);
    let newY = (e.clientY / zoomLevel) - dragOffset.current.y - (canvasRect.top / zoomLevel);

    // Basic boundary collision (optional, can be improved)
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);
    // newX = Math.min(newX, canvasRef.current.offsetWidth - 256); // 256 is approx card width
    // newY = Math.min(newY, canvasRef.current.offsetHeight - 100); // 100 is approx card height

    setFlowSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === draggingStepId ? { ...step, position: { x: newX, y: newY } } : step
      )
    );
  }, [draggingStepId, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setDraggingStepId(null);
  }, []);

  useEffect(() => {
    if (draggingStepId) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingStepId, handleMouseMove, handleMouseUp]);


  const handleOpenEditProperties = (stepId: string) => {
    if (draggingStepId) return; // Don't open edit if it was a drag
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
  
  const handleAddOptionToStep = (stepId: string, newOptionLabel: string) => {
    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId && (step.type === 'multiple_choice' || step.type === 'single_choice')) {
          const newOptionValue = `opt_${Date.now()}`;
          const newOption: FlowStepOption = { value: newOptionValue, label: newOptionLabel };
          const options = step.config.options ? [...step.config.options, newOption] : [newOption];
          return { ...step, config: { ...step.config, options } };
        }
        return step;
      })
    );
  };

  const handleRemoveOptionFromStep = (stepId: string, optionValue: string) => {
    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId && (step.type === 'multiple_choice' || step.type === 'single_choice')) {
          const options = step.config.options?.filter(opt => opt.value !== optionValue);
          return { ...step, config: { ...step.config, options } };
        }
        return step;
      })
    );
  };
  
  const handleOptionChange = (stepId: string, optionValue: string, newLabel: string, newNextStepId?: string) => {
    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId && step.config.options) {
          const newOptions = step.config.options.map(opt =>
            opt.value === optionValue ? { ...opt, label: newLabel, nextStepId: newNextStepId } : opt
          );
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
  
  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prevZoom => direction === 'in' ? Math.min(prevZoom * 1.2, 2) : Math.max(prevZoom / 1.2, 0.5));
  };

  const currentStepToEdit = flowSteps.find(s => s.id === selectedStepId);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-muted/30">
      <div className="flex justify-between items-center p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" />
          <Input
            id="flowName"
            placeholder="Nome do Fluxo (Ex: Questionário Inicial)"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 w-auto max-w-md"
          />
        </div>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleZoom('in')} title="Aumentar Zoom"><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => handleZoom('out')} title="Diminuir Zoom"><ZoomOut className="h-4 w-4" /></Button>
            <Link href="/flowbuilder" passHref> 
                <Button variant="outline"><ListChecks className="mr-2 h-4 w-4" /> Meus Fluxos</Button>
            </Link>
         </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden relative"> {/* Canvas container */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto dot-grid-background cursor-grab active:cursor-grabbing"
          // Add pan handlers here if needed with a pan mode
        >
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100/zoomLevel}%`, height: `${100/zoomLevel}%`}} className="relative h-full w-full">
            {/* Add Step Button */}
            <Dialog open={isAddToolPopupOpen} onOpenChange={setIsAddToolPopupOpen}>
                <DialogTrigger asChild>
                <Button
                    variant="default" 
                    size="icon"
                    className="absolute top-4 left-4 z-20 rounded-full shadow-lg h-12 w-12"
                    aria-label="Adicionar Etapa ao Fluxo"
                    title="Adicionar Etapa ao Fluxo"
                >
                    <PlusCircle className="h-6 w-6" />
                </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh]">
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

            {/* Render Steps */}
            {flowSteps.length === 0 && !isAddToolPopupOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground z-10 pointer-events-none">
                    <Move className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">Clique em <PlusCircle className="inline h-5 w-5 align-text-bottom" /> para adicionar a primeira etapa.</p>
                    <p className="text-sm">Arraste as etapas para organizar seu fluxo.</p>
                </div>
            )}

            {flowSteps.map(step => (
            <FlowStepCardComponent
                key={step.id}
                step={step}
                onClick={() => handleOpenEditProperties(step.id)}
                onRemove={removeStep}
                allSteps={flowSteps}
                onMouseDownCard={handleStepMouseDown}
            />
            ))}
          </div>
        </div>
      </div>

      {currentStepToEdit && (
        <Dialog open={isEditPropertiesPopupOpen} onOpenChange={setIsEditPropertiesPopupOpen}>
          <DialogContent className="sm:max-w-xl max-h-[85vh]">
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
                allSteps={flowSteps}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEditPropertiesPopupOpen(false)}>Concluído</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <CardFooter className="border-t pt-4 pb-4 flex justify-end gap-2 bg-card shadow-inner">
        <Button variant="outline" onClick={() => alert("Simulação de fluxo ainda não implementada.")}><Eye className="mr-2 h-4 w-4" /> Simular</Button>
        <Button variant="outline" onClick={() => alert("Ativação de fluxo ainda não implementada.")}><PlayCircle className="mr-2 h-4 w-4" /> Ativar Fluxo</Button>
        <Button onClick={handleSaveFlow}>
          <Save className="mr-2 h-4 w-4" /> Salvar Fluxo
        </Button>
      </CardFooter>
    </div>
  );
}
