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
import { Separator } from '@/components/ui/separator';
import {
  Workflow, Save, PlusCircle, Trash2, Eye, PlayCircle, ListChecks, TextCursorInput,
  CircleDot, ImageUp, Smile, Mic, Video as VideoIcon, FileText, Image as ImageIcon, FileAudio, Film, AlignLeft, HelpCircle, Link2, Variable, ZoomIn, ZoomOut, Move, Unlink
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

const NO_NEXT_STEP_VALUE = "__NO_NEXT_STEP__";
const CARD_WIDTH = 240; // 15rem, w-60
const CARD_HEIGHT_ESTIMATE = 180; // Estimate, real height varies. Increased slightly for more content.

interface ConnectingState {
  sourceStepId: string;
  sourceType: 'default' | 'option';
  sourceOptionValue?: string; // Only if sourceType is 'option'
}

const FlowStepCardComponent = ({ step, onClick, onRemove, allSteps, onMouseDownCard, isConnectingSource, isPotentialTarget, onInitiateConnection }: {
  step: FlowStep;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRemove: (id: string) => void;
  allSteps: FlowStep[];
  onMouseDownCard: (e: React.MouseEvent<HTMLDivElement>, stepId: string) => void;
  isConnectingSource: boolean;
  isPotentialTarget: boolean;
  onInitiateConnection: (sourceStepId: string, sourceType: 'default' | 'option', sourceOptionValue?: string) => void;
}) => {
  const ToolIcon = toolPalette.find(t => t.type === step.type)?.icon || HelpCircle;
  const getStepTitleById = (id?: string) => allSteps.find(s => s.id === id)?.title || 'Próxima Etapa';

  const handleConnectClick = (e: React.MouseEvent, sourceType: 'default' | 'option', optionValue?: string) => {
    e.stopPropagation(); 
    onInitiateConnection(step.id, sourceType, optionValue);
  };

  const handleDisconnectClick = (e: React.MouseEvent, disconnectType: 'default' | 'option', optionValue?: string) => {
    e.stopPropagation();
    // This function needs to be passed down or implemented here to update the flowSteps state
    // For now, it's a placeholder until the parent component implements it.
    // Example: onDisconnect(step.id, disconnectType, optionValue);
    toast({ title: "Desconectar", description: `Ação de desconectar para ${disconnectType} (opção: ${optionValue}) não implementada.`});
  };


  return (
    <Card
      onMouseDown={(e) => onMouseDownCard(e, step.id)}
      onClick={onClick}
      className={cn(
        "p-3 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-150 ease-in-out cursor-grab absolute w-60 bg-card flex flex-col space-y-2 border",
        isConnectingSource && "ring-2 ring-primary ring-offset-2 shadow-primary/50",
        isPotentialTarget && "ring-2 ring-accent ring-offset-1 animate-pulse shadow-accent/50",
      )}
      id={`step-card-${step.id}`}
      style={{ left: step.position.x, top: step.position.y }}
    >
      {/* Header: Icon, Title, Remove Button */}
      <div className="flex justify-between items-center pb-2 border-b border-border/50">
        <div className="flex items-center gap-2 truncate">
          <ToolIcon className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="font-semibold text-sm truncate text-card-foreground" title={step.title}>{step.title || "Etapa Sem Título"}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 flex-shrink-0 group/trash" onClick={(e) => { e.stopPropagation(); onRemove(step.id); }}>
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/trash:text-destructive transition-colors" />
        </Button>
      </div>

      {/* Output Variable (if any) */}
      {step.config.setOutputVariable && (
        <div className="flex items-center text-xs text-primary truncate pt-1">
          <Variable className="inline h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">Salva em: <span className="font-mono ml-0.5 bg-primary/10 px-1 py-0.5 rounded-sm">{step.config.setOutputVariable}</span></span>
        </div>
      )}

      {/* Question/Instruction Text (if relevant) */}
      {(step.type === 'information_text' || step.type.includes('input') || step.type.includes('choice') || step.type.startsWith('display_') || step.type.endsWith('_upload') || step.type.endsWith('_record') || step.type === 'emoji_rating') && step.config.text && (
         <p className="text-xs text-muted-foreground truncate pt-1" title={step.config.text}>{step.config.text}</p>
      )}

      {/* Options (for choice types) */}
      {(step.type === 'multiple_choice' || step.type === 'single_choice') && step.config.options && step.config.options.length > 0 && (
        <div className="space-y-1.5 pt-2 mt-1 border-t border-border/30">
          <p className="text-xxs font-medium text-muted-foreground mb-1">RAMIFICAÇÕES:</p>
          {step.config.options.map(opt => (
            <div key={opt.value} className="flex items-center justify-between text-xs group/option bg-muted/50 p-1.5 rounded-md">
              <span className="truncate text-card-foreground mr-1 flex-grow" title={opt.label}>{opt.label}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {opt.nextStepId && (
                  <span 
                    className="text-primary/80 text-xxs truncate max-w-[60px] italic cursor-pointer hover:underline" 
                    title={`Próximo: ${getStepTitleById(opt.nextStepId)}. Clique para desconectar.`}
                    onClick={(e) => handleDisconnectClick(e, 'option', opt.value)}
                  >
                    &rarr; {getStepTitleById(opt.nextStepId)}
                  </span>
                )}
                 <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0.5 opacity-60 group-hover/option:opacity-100 hover:bg-primary/10"
                  onClick={(e) => handleConnectClick(e, 'option', opt.value)}
                  title={`Conectar "${opt.label}"`}
                >
                  <Link2 className="h-3.5 w-3.5 text-primary" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Default Next Step (always visible) */}
      <div className="text-xs flex items-center justify-between pt-2 mt-auto border-t border-border/30 group/default-next">
        <div className="flex items-center truncate">
          <span className="text-muted-foreground mr-1">SAÍDA PADRÃO:</span>
          {step.config.defaultNextStepId ? (
            <span 
              className="text-primary truncate max-w-[80px] italic cursor-pointer hover:underline" 
              title={`Próximo: ${getStepTitleById(step.config.defaultNextStepId)}. Clique para desconectar.`}
              onClick={(e) => handleDisconnectClick(e, 'default')}
            >
              {getStepTitleById(step.config.defaultNextStepId)}
            </span>
          ) : (
            <span className="text-muted-foreground italic">
              {step.type.includes('choice') ? "(Fim do Fluxo)" : "(Fim do Fluxo)"}
            </span>
          )}
        </div>
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0.5 opacity-60 group-hover/default-next:opacity-100 hover:bg-primary/10"
            onClick={(e) => handleConnectClick(e, 'default')}
            title="Conectar saída padrão / Alterar conexão"
          >
            <Link2 className="h-3.5 w-3.5 text-primary" />
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
                      // For simplicity in this example, we'll store the file name.
                      // In a real app, you'd upload this file and store its URL.
                      // For display purposes, if it's an object URL, it might work temporarily
                      // but it's better to handle file uploads properly.
                      handleConfigChange('url', URL.createObjectURL(file)); // TEMPORARY, NOT FOR PRODUCTION STORAGE
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
                <div className="flex items-center gap-1">
                  <Select
                    value={safeSelectValue(option.nextStepId)}
                    onValueChange={(newNextStepId) => onOptionChange(step.id, option.value, option.label, newNextStepId === NO_NEXT_STEP_VALUE ? undefined : newNextStepId)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Próxima etapa para esta opção..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_NEXT_STEP_VALUE}>Nenhuma (Usar padrão/Fim)</SelectItem>
                      {availableNextSteps.map(nextStep => (
                        <SelectItem key={nextStep.id} value={nextStep.id}>{nextStep.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <Button variant="ghost" size="icon" onClick={() => onOptionChange(step.id, option.value, option.label, undefined)} title="Desconectar esta ramificação">
                      <Unlink className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                   </Button>
                </div>
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

        <div> {/* Default Next Step configuration is always available */}
            <Label htmlFor={`step-defaultnextstep-${step.id}`}>Próxima Etapa Padrão</Label>
            <div className="flex items-center gap-1">
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
              <Button variant="ghost" size="icon" onClick={() => handleConfigChange('defaultNextStepId', undefined)} title="Desconectar etapa padrão">
                <Unlink className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                {step.type.includes('choice') 
                ? "Usado se uma opção não tiver ramificação específica ou como fallback."
                : "Próxima etapa após esta."}
            </p>
        </div>

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
  const [connectingState, setConnectingState] = useState<ConnectingState | null>(null);


  const handleAddToolFromPopup = useCallback((toolType: FlowStepType) => {
    const tool = toolPalette.find(t => t.type === toolType);
    if (!tool) return;

    const newStep: FlowStep = {
      id: Date.now().toString(),
      type: tool.type,
      title: tool.defaultTitle,
      config: JSON.parse(JSON.stringify(tool.defaultConfig)), // Deep copy default config
      position: { x: 50 + Math.random() * 50, y: 80 + flowSteps.length * 20 }, // Basic positioning
    };
    setFlowSteps(prev => [...prev, newStep]);
    toast({ title: "Elemento Adicionado", description: `${tool.label} foi adicionado ao fluxo.` });
    setIsAddToolPopupOpen(false);
  }, [flowSteps.length]);


  const handleStepMouseDown = (e: React.MouseEvent<HTMLDivElement>, stepId: string) => {
    if (connectingState) return; // Don't drag if in connecting mode
    const step = flowSteps.find(s => s.id === stepId);
    if (!step || !canvasRef.current) return;

    // Prevent dragging if clicking on a button within the card (like connect or delete)
    if ((e.target as HTMLElement).closest('button')) {
        // console.log("Clicked a button inside card, not dragging.");
        return;
    }

    setDraggingStepId(stepId);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: (e.clientX / zoomLevel) - step.position.x - (canvasRect.left / zoomLevel),
      y: (e.clientY / zoomLevel) - step.position.y - (canvasRect.top / zoomLevel),
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingStepId || !canvasRef.current) return;
    e.preventDefault(); 
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    let newX = (e.clientX / zoomLevel) - dragOffset.current.x - (canvasRect.left / zoomLevel);
    let newY = (e.clientY / zoomLevel) - dragOffset.current.y - (canvasRect.top / zoomLevel);

    // Basic boundary checks (can be improved)
    newX = Math.max(0, newX); // Prevent dragging off top-left
    newY = Math.max(0, newY);

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

  const handleInitiateConnection = (sourceStepId: string, sourceType: 'default' | 'option', sourceOptionValue?: string) => {
    setConnectingState({ sourceStepId, sourceType, sourceOptionValue });
    setIsEditPropertiesPopupOpen(false); // Close properties editor if open
    toast({ title: "Conectando Etapa", description: "Clique na etapa de destino para criar a ligação." });
  };

  const completeConnection = (targetStepId: string) => {
    if (!connectingState) return;

    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === connectingState.sourceStepId) {
          const newConfig = { ...step.config };
          if (connectingState.sourceType === 'default') {
            newConfig.defaultNextStepId = targetStepId;
          } else if (connectingState.sourceType === 'option' && connectingState.sourceOptionValue) {
            newConfig.options = newConfig.options?.map(opt =>
              opt.value === connectingState.sourceOptionValue
                ? { ...opt, nextStepId: targetStepId }
                : opt
            );
          }
          return { ...step, config: newConfig };
        }
        return step;
      })
    );
    const sourceStepName = flowSteps.find(s => s.id === connectingState.sourceStepId)?.title || "Etapa Anterior";
    const targetStepName = flowSteps.find(s => s.id === targetStepId)?.title || "Próxima Etapa";
    toast({ title: "Ligação Criada!", description: `Etapa "${sourceStepName}" ligada a "${targetStepName}".` });
    setConnectingState(null);
  };


  const handleStepCardClick = (e: React.MouseEvent<HTMLDivElement>, stepId: string) => {
    if (draggingStepId) return; // Don't do anything if we just finished dragging this card

    if (connectingState) { // If in connecting mode
      if (connectingState.sourceStepId === stepId) { // Trying to connect to self
        toast({ title: "Ação Inválida", description: "Não é possível conectar uma etapa a ela mesma desta forma.", variant: "destructive" });
        // Optionally, cancel connecting state: setConnectingState(null); 
        return;
      }
      completeConnection(stepId);
    } else {
      // Only open properties editor if not clicking a button (like connect or delete)
      // This check might need to be more robust depending on card structure
      if (!(e.target as HTMLElement).closest('button[title^="Conectar"], button[title^="Remover"]')) {
        setSelectedStepId(stepId);
        setIsEditPropertiesPopupOpen(true);
      }
    }
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
    // Also remove connections pointing to this step
    setFlowSteps(prev => prev.map(s => {
        const newConfig = {...s.config};
        if (newConfig.defaultNextStepId === idToRemove) {
            newConfig.defaultNextStepId = undefined;
        }
        if (newConfig.options) {
            newConfig.options = newConfig.options.map(opt => 
                opt.nextStepId === idToRemove ? {...opt, nextStepId: undefined} : opt
            );
        }
        return {...s, config: newConfig};
    }));
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
    // Here you would typically make an API call to save the flow
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
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
            <Link href="/flowbuilder" passHref> {/* Assuming this links to a list of flows */}
                <Button variant="outline"><ListChecks className="mr-2 h-4 w-4" /> Meus Fluxos</Button>
            </Link>
         </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas for Flow Steps */}
        <div
          ref={canvasRef}
          className={cn(
            "flex-1 relative overflow-auto dot-grid-background", // Added dot-grid pattern
            connectingState ? "cursor-crosshair" : (draggingStepId ? "cursor-grabbing" : "cursor-grab")
          )}
           onClick={(e) => {
            // If in connecting state and click on canvas (not a step card), cancel connection
            if (connectingState && e.target === canvasRef.current) {
              setConnectingState(null);
              toast({ title: "Conexão Cancelada", description: "A tentativa de conexão foi cancelada." });
            }
          }}
        >
          {/* Scalable container for zoom */}
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100/zoomLevel}%`, height: `${100/zoomLevel}%`}} className="relative h-full w-full">
            {/* SVG Layer for Connections */}
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" // Ensure SVG is behind cards
              style={{ overflow: 'visible' }} // Allow paths to draw outside SVG initial bounds if needed
            >
              <defs>
                <marker
                  id="arrowhead-default"
                  markerWidth="10" // Arrowhead size
                  markerHeight="7"
                  refX="8" // Offset to not overlap line end
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                </marker>
                 <marker
                  id="arrowhead-option"
                  markerWidth="8" // Slightly smaller for option lines
                  markerHeight="5.6" 
                  refX="6.4" 
                  refY="2.8" 
                  orient="auto"
                >
                  <polygon points="0 0, 8 2.8, 0 5.6" fill="hsl(var(--muted-foreground))" />
                </marker>
              </defs>
              {flowSteps.map(sourceStep => {
                // Get position and dimensions of source card
                // For simplicity, using fixed width/height. Real scenarios might get dynamic rects.
                const sourceCardRect = {
                    x: sourceStep.position.x,
                    y: sourceStep.position.y,
                    width: CARD_WIDTH, // Defined constant
                    height: CARD_HEIGHT_ESTIMATE, // Defined constant (estimate)
                };
                const paths: JSX.Element[] = [];

                const getPathDefinition = (startX: number, startY: number, endX: number, endY: number) => {
                    const dx = endX - startX;
                    // const dy = endY - startY; // Not used in this curve type
                    const controlOffset = Math.max(20, Math.min(Math.abs(dx) * 0.3, 75)); // Adjusted controlOffset
                    const c1x = startX + controlOffset;
                    const c1y = startY;
                    const c2x = endX - controlOffset;
                    const c2y = endY;
                    return `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
                };

                // Draw default next step connection
                if (sourceStep.config.defaultNextStepId) {
                  const targetStep = flowSteps.find(s => s.id === sourceStep.config.defaultNextStepId);
                  if (targetStep) {
                    const targetCardRect = { x: targetStep.position.x, y: targetStep.position.y, width: CARD_WIDTH, height: CARD_HEIGHT_ESTIMATE };
                    const startX = sourceCardRect.x + sourceCardRect.width; // Exit from right-middle
                    const startY = sourceCardRect.y + sourceCardRect.height - 20; // Adjusted Y for default to be lower part of card
                    const endX = targetCardRect.x; // Enter from left-middle
                    const endY = targetCardRect.y + targetCardRect.height / 2;
                    paths.push(
                      <path
                        key={`${sourceStep.id}-default-${targetStep.id}`}
                        d={getPathDefinition(startX, startY, endX, endY)}
                        stroke="hsl(var(--primary))" strokeWidth="2" fill="none"
                        markerEnd="url(#arrowhead-default)"
                        style={{ animation: 'flow 1s linear infinite alternate' }}
                      />);
                  }
                }
                // Draw option next step connections
                sourceStep.config.options?.forEach((option, index) => {
                  if (option.nextStepId) {
                    const targetStep = flowSteps.find(s => s.id === option.nextStepId);
                    if (targetStep) {
                      const targetCardRect = { x: targetStep.position.x, y: targetStep.position.y, width: CARD_WIDTH, height: CARD_HEIGHT_ESTIMATE };
                      const numOptions = sourceStep.config.options?.length || 1;
                      const optionBaseY = sourceStep.config.setOutputVariable || sourceStep.config.text ? 90 : 60; // Estimate Y based on card content
                      const verticalOffsetFactor = (index - (numOptions -1) / 2); 
                      const startX = sourceCardRect.x + sourceCardRect.width;
                      const startY = sourceCardRect.y + optionBaseY + (index * 30) + 10; // Stagger option lines
                      const endX = targetCardRect.x;
                      const endY = targetCardRect.y + targetCardRect.height / 2; 
                       paths.push(
                        <path
                          key={`${sourceStep.id}-option-${option.value}-${targetStep.id}`}
                          d={getPathDefinition(startX, startY, endX, endY)}
                          stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" strokeDasharray="4 3" // Dashed for options
                          markerEnd="url(#arrowhead-option)"
                          style={{ animation: 'flow 1s linear infinite alternate-reverse' }}
                        />);
                    }
                  }
                });
                return paths;
              })}
            </svg>
            <style jsx global>{`
                @keyframes flow {
                    from { stroke-dashoffset: 8; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
            
            {/* Add Tool Button and Popup */}
            <Dialog open={isAddToolPopupOpen} onOpenChange={setIsAddToolPopupOpen}>
                <DialogTrigger asChild>
                <Button
                    variant="default" // Changed to default for better visibility
                    size="icon"
                    className="absolute top-4 left-4 z-20 rounded-full shadow-lg h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground" // z-20 to be above SVG but below dialog
                    aria-label="Adicionar Etapa ao Fluxo"
                    title="Adicionar Etapa ao Fluxo"
                >
                    <PlusCircle className="h-6 w-6" />
                </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh]"> {/* z-50 is default for DialogContent */}
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Etapa ao Fluxo</DialogTitle>
                    <DialogDescription>
                    Selecione um tipo de etapa para adicionar ao seu fluxo.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[65vh] p-1 -m-1"> {/* Adjust max height as needed */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
                    {toolPalette.map(tool => (
                        <Card
                        key={tool.type}
                        onClick={() => handleAddToolFromPopup(tool.type)}
                        className="p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:shadow-xl hover:border-primary transition-all duration-150 ease-in-out transform hover:scale-105 border-2 border-transparent"
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

            {/* Placeholder text if no steps */}
            {flowSteps.length === 0 && !isAddToolPopupOpen && ( // Hide if add tool popup is open
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground z-10 pointer-events-none">
                    <Move className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">Clique em <PlusCircle className="inline h-5 w-5 align-text-bottom text-primary" /> para adicionar a primeira etapa.</p>
                    <p className="text-sm">Arraste as etapas para organizar seu fluxo.</p>
                </div>
            )}

            {/* Render Flow Step Cards */}
            {flowSteps.map(step => (
            <FlowStepCardComponent
                key={step.id}
                step={step}
                onClick={(e) => handleStepCardClick(e, step.id)}
                onRemove={removeStep}
                allSteps={flowSteps}
                onMouseDownCard={handleStepMouseDown}
                isConnectingSource={connectingState?.sourceStepId === step.id}
                isPotentialTarget={!!connectingState && connectingState.sourceStepId !== step.id}
                onInitiateConnection={handleInitiateConnection}
            />
            ))}
          </div>
        </div>
      </div>

      {/* Properties Editor Dialog */}
      {currentStepToEdit && (
        <Dialog open={isEditPropertiesPopupOpen} onOpenChange={setIsEditPropertiesPopupOpen}>
          <DialogContent className="sm:max-w-xl max-h-[85vh]"> {/* Ensure this dialog is also above canvas items, z-50 by default */}
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
