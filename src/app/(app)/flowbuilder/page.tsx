// src/app/(app)/flowbuilder/page.tsx
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Workflow, Save, PlusCircle, Trash2, Eye, PlayCircle, ListChecks, TextCursorInput,
  CircleDot, ImageUp, Smile, Mic, Video as VideoIcon, FileText, Image as ImageIcon, FileAudio, Film, AlignLeft, HelpCircle, Link2, Variable, ZoomIn, ZoomOut, Move, Unlink, List
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { FlowStep, FlowStepType, FlowStepOption, FlowStepConfig } from '@/types';
import { cn } from '@/lib/utils';
import FlowPreviewModal from '@/components/flow/flow-preview-modal';


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
const CARD_WIDTH = 240; 
const CARD_HEIGHT_ESTIMATE = 240; 

interface ConnectingState {
  sourceStepId: string;
  sourceType: 'default' | 'option';
  sourceOptionValue?: string; 
}

interface ConnectionLine {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'default' | 'option';
  sourceStepId: string;
  targetStepId: string;
  sourceOptionValue?: string;
}

const stepHasTextOrOutput = (step: FlowStep): boolean => {
  // Check if the step is defined and has a config object
  if (!step || !step.config) {
    return false;
  }
  return !!step.config.text || !!step.config.setOutputVariable;
};


const FlowStepCardComponent = ({ step, onClick, onRemove, allSteps, onMouseDownCard, isConnectingSource, isPotentialTarget, onInitiateConnection, onDisconnect, onHoverConnectionLine, onLeaveConnectionLine, hoveredConnectionId }: {
  step: FlowStep;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRemove: (id: string) => void;
  allSteps: FlowStep[];
  onMouseDownCard: (e: React.MouseEvent<HTMLDivElement>, stepId: string) => void;
  isConnectingSource: boolean;
  isPotentialTarget: boolean;
  onInitiateConnection: (sourceStepId: string, sourceType: 'default' | 'option', sourceOptionValue?: string) => void;
  onDisconnect: (sourceStepId: string, disconnectType: 'default' | 'option', optionValue?: string) => void;
  onHoverConnectionLine: (lineId: string | null) => void;
  onLeaveConnectionLine: () => void;
  hoveredConnectionId: string | null;
}) => {
  const ToolIcon = toolPalette.find(t => t.type === step.type)?.icon || HelpCircle;
  const getStepTitleById = (id?: string) => allSteps.find(s => s.id === id)?.title || 'Próxima Etapa';

  const handleConnectClick = (e: React.MouseEvent, sourceType: 'default' | 'option', optionValue?: string) => {
    e.stopPropagation(); 
    onInitiateConnection(step.id, sourceType, optionValue);
  };

  const handleDisconnectClick = (e: React.MouseEvent, disconnectType: 'default' | 'option', optionValue?: string) => {
    e.stopPropagation();
    onDisconnect(step.id, disconnectType, optionValue);
  };


  return (
    <Card
      onMouseDown={(e) => onMouseDownCard(e, step.id)}
      onClick={onClick}
      className={cn(
        "p-3 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-150 ease-in-out cursor-grab absolute w-60 bg-card flex flex-col space-y-2 border-2",
        isConnectingSource && "ring-2 ring-primary ring-offset-2 shadow-primary/50 border-primary",
        isPotentialTarget && "ring-2 ring-accent ring-offset-1 animate-pulse shadow-accent/50 border-accent",
         !isConnectingSource && !isPotentialTarget && "border-card"
      )}
      id={`step-card-${step.id}`}
      style={{ left: step.position.x, top: step.position.y }}
    >
      <div className="flex justify-between items-center pb-2 border-b border-border/50">
        <div className="flex items-center gap-2 truncate">
          <ToolIcon className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="font-semibold text-sm truncate text-card-foreground" title={step.title}>{step.title || "Etapa Sem Título"}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 flex-shrink-0 group/trash" onClick={(e) => { e.stopPropagation(); onRemove(step.id); }}>
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/trash:text-destructive transition-colors" />
        </Button>
      </div>

      {step.config.setOutputVariable && (
        <div className="flex items-center text-xs text-primary truncate pt-1">
          <Variable className="inline h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">Salva em: <span className="font-mono ml-0.5 bg-primary/10 px-1 py-0.5 rounded-sm">{step.config.setOutputVariable}</span></span>
        </div>
      )}

      {(step.type === 'information_text' || step.type.includes('input') || step.type.includes('choice') || step.type.startsWith('display_') || step.type.endsWith('_upload') || step.type.endsWith('_record') || step.type === 'emoji_rating') && step.config.text && (
         <p className="text-xs text-muted-foreground truncate pt-1 line-clamp-2" title={step.config.text}>{step.config.text}</p>
      )}

      {(step.type === 'multiple_choice' || step.type === 'single_choice') && step.config.options && step.config.options.length > 0 && (
        <div className="space-y-1.5 pt-2 mt-1 border-t border-border/30">
          <p className="text-xxs font-medium text-muted-foreground mb-1">RAMIFICAÇÕES:</p>
          {step.config.options.map(opt => (
            <div key={opt.value} className="flex items-center justify-between text-xs group/option bg-muted/50 p-1.5 rounded-md">
              <span className="truncate text-card-foreground mr-1 flex-grow" title={opt.label}>{opt.label}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {opt.nextStepId ? (
                    <>
                        <span className="text-primary/80 text-xxs truncate max-w-[60px] italic" title={`Próximo: ${getStepTitleById(opt.nextStepId)}`}>
                        &rarr; {getStepTitleById(opt.nextStepId)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5 text-muted-foreground hover:text-destructive" onClick={(e) => handleDisconnectClick(e, 'option', opt.value)} title={`Desconectar "${opt.label}"`}>
                            <Unlink className="h-3.5 w-3.5" />
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0.5 opacity-60 group-hover/option:opacity-100 hover:bg-primary/10"
                        onClick={(e) => handleConnectClick(e, 'option', opt.value)}
                        title={`Conectar "${opt.label}"`}
                    >
                        <Link2 className="h-3.5 w-3.5 text-primary" />
                    </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={cn("text-xs flex items-center justify-between pt-2 mt-auto group/default-next", (step.type === 'multiple_choice' || step.type === 'single_choice') && step.config.options && step.config.options.length > 0 ? "border-t border-border/30" : "border-t-0")}>
        <div className="flex items-center truncate">
          <span className="text-muted-foreground mr-1">{ (step.type === 'multiple_choice' || step.type === 'single_choice') ? "SAÍDA PADRÃO:" : "PRÓXIMA ETAPA:"}</span>
          {step.config.defaultNextStepId ? (
             <>
                <span className="text-primary truncate max-w-[80px] italic" title={`Próximo: ${getStepTitleById(step.config.defaultNextStepId)}`}>
                    {getStepTitleById(step.config.defaultNextStepId)}
                </span>
                 <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5 text-muted-foreground hover:text-destructive ml-1" onClick={(e) => handleDisconnectClick(e, 'default')} title="Desconectar saída padrão">
                    <Unlink className="h-3.5 w-3.5" />
                </Button>
            </>
          ) : (
            <span className="text-muted-foreground italic">
              (Fim do Fluxo)
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

        { (step.type.startsWith('display_') || step.type.endsWith('_input') || step.type.endsWith('_upload') || step.type.endsWith('_record') || step.type === 'information_text' || step.type === 'emoji_rating') && (
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
                      // For preview, we might need to create a blob URL. 
                      // For actual saving, you'd handle file upload differently.
                      handleConfigChange('url', URL.createObjectURL(file)); 
                      // Set text to file name if not already set.
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

        <div> 
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
  
  const [isEditPropertiesPopupOpen, setIsEditPropertiesPopupOpen] = useState(false);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [connectingState, setConnectingState] = useState<ConnectingState | null>(null);
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [initialPreviewStepId, setInitialPreviewStepId] = useState<string | null>(null);


  const addStep = useCallback((toolType: FlowStepType, position: { x: number; y: number }) => {
    const tool = toolPalette.find(t => t.type === toolType);
    if (!tool) return;

    const newStep: FlowStep = {
      id: Date.now().toString(),
      type: tool.type,
      title: tool.defaultTitle,
      config: JSON.parse(JSON.stringify(tool.defaultConfig)), // Deep copy default config
      position: position,
    };
    setFlowSteps(prev => [...prev, newStep]);
    toast({ title: "Elemento Adicionado", description: `${tool.label} foi adicionado ao fluxo.` });
  }, []);


  const handleDragStartTool = (event: React.DragEvent<HTMLButtonElement>, toolType: FlowStepType) => {
    event.dataTransfer.setData("application/nutritrack-flow-tool", toolType);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOverCanvas = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDropOnCanvas = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const toolType = event.dataTransfer.getData("application/nutritrack-flow-tool") as FlowStepType;
    if (toolType && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      // Adjust for canvas scroll and zoom
      const x = (event.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel;
      const y = (event.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel;
      addStep(toolType, { x: x - CARD_WIDTH / 2, y: y - CARD_HEIGHT_ESTIMATE / 2 }); // Adjust to center the card
    }
  };


  const handleStepMouseDown = (e: React.MouseEvent<HTMLDivElement>, stepId: string) => {
    if (connectingState) return; 
    const step = flowSteps.find(s => s.id === stepId);
    if (!step || !canvasRef.current) return;

    // Prevent drag if clicking on a button inside the card (e.g., connect, remove)
    if ((e.target as HTMLElement).closest('button')) {
        // Allow propagation for connect/disconnect buttons specifically
        if (!(e.target as HTMLElement).closest('button[title^="Conectar"], button[title^="Desconectar"]')) {
             return; // But not for others like remove
        }
    }

    setDraggingStepId(stepId);
    const canvasRect = canvasRef.current.getBoundingClientRect(); // Get rect of the scrollable canvas div
    // Calculate offset relative to the canvas content (considering zoom and scroll)
    dragOffset.current = {
      x: (e.clientX / zoomLevel) - step.position.x - (canvasRect.left / zoomLevel) + (canvasRef.current.scrollLeft / zoomLevel) ,
      y: (e.clientY / zoomLevel) - step.position.y - (canvasRect.top / zoomLevel) + (canvasRef.current.scrollTop / zoomLevel),
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingStepId || !canvasRef.current) return;
    e.preventDefault(); 
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate new position relative to the canvas content
    let newX = (e.clientX / zoomLevel) - dragOffset.current.x - (canvasRect.left / zoomLevel) + (canvasRef.current.scrollLeft / zoomLevel);
    let newY = (e.clientY / zoomLevel) - dragOffset.current.y - (canvasRect.top / zoomLevel) + (canvasRef.current.scrollTop / zoomLevel);

    // Constrain to canvas boundaries (optional, but good for usability)
    newX = Math.max(0, newX); 
    newY = Math.max(0, newY);
    // Could add max constraints if canvas has fixed size:
    // newX = Math.min(newX, (canvasRef.current.scrollWidth / zoomLevel) - CARD_WIDTH);
    // newY = Math.min(newY, (canvasRef.current.scrollHeight / zoomLevel) - CARD_HEIGHT_ESTIMATE);


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
    };
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingStepId, handleMouseMove, handleMouseUp]);

  const handleInitiateConnection = (sourceStepId: string, sourceType: 'default' | 'option', sourceOptionValue?: string) => {
    setConnectingState({ sourceStepId, sourceType, sourceOptionValue });
    setIsEditPropertiesPopupOpen(false); // Close edit popup if open
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

  const handleDisconnect = useCallback((sourceStepId: string, disconnectType: 'default' | 'option', optionValue?: string) => {
    setFlowSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === sourceStepId) {
          const newConfig = { ...step.config };
          if (disconnectType === 'default') {
            newConfig.defaultNextStepId = undefined;
          } else if (disconnectType === 'option' && optionValue) {
            newConfig.options = newConfig.options?.map(opt =>
              opt.value === optionValue ? { ...opt, nextStepId: undefined } : opt
            );
          }
          return { ...step, config: newConfig };
        }
        return step;
      })
    );
    toast({ title: "Ligação Removida", description: "A conexão entre as etapas foi removida." });
    // If the currently active connection attempt was for this specific disconnect, cancel it.
    if (connectingState?.sourceStepId === sourceStepId) {
        if (connectingState.sourceType === 'default' && disconnectType === 'default') {
            setConnectingState(null);
        } else if (connectingState.sourceType === 'option' && disconnectType === 'option' && connectingState.sourceOptionValue === optionValue) {
            setConnectingState(null);
        }
    }
  }, [connectingState]);


  const handleStepCardClick = (e: React.MouseEvent<HTMLDivElement>, stepId: string) => {
    // If a drag operation just finished on this card, ignore the first click to prevent immediate popup
    if (draggingStepId && draggingStepId === stepId) { 
        // setDraggingStepId(null); // Reset immediately, might be redundant with mouseUp
        return;
    }

    if (connectingState) { // If in connecting mode
      if (connectingState.sourceStepId === stepId) { // Prevent self-connection
        toast({ title: "Ação Inválida", description: "Não é possível conectar uma etapa a ela mesma desta forma.", variant: "destructive" });
        return;
      }
      completeConnection(stepId);
    } else {
      // Open properties editor only if not clicking on a button meant for connecting/disconnecting or removing
      if (!(e.target as HTMLElement).closest('button[title^="Conectar"], button[title^="Remover"], button[title^="Desconectar"]')) {
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
    // Clean up connections pointing to the removed step
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
          const newOptionValue = `opt_${Date.now()}`; // Ensure unique value
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
            // Ensure that newNextStepId is handled correctly when it's NO_NEXT_STEP_VALUE
            opt.value === optionValue ? { ...opt, label: newLabel, nextStepId: newNextStepId === NO_NEXT_STEP_VALUE ? undefined : newNextStepId } : opt
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    toast({ title: "Fluxo Salvo!", description: `O fluxo "${flowName}" foi salvo com sucesso.` });
  };
  
  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prevZoom => direction === 'in' ? Math.min(prevZoom * 1.2, 2) : Math.max(prevZoom / 1.2, 0.5));
  };

  const findFirstStepId = (steps: FlowStep[]): string | null => {
    if (steps.length === 0) return null;
    // Logic to find a step that is not a target of any other step
    const targettedStepIds = new Set<string>();
    steps.forEach(step => {
      if (step.config.defaultNextStepId) targettedStepIds.add(step.config.defaultNextStepId);
      step.config.options?.forEach(opt => {
        if (opt.nextStepId) targettedStepIds.add(opt.nextStepId);
      });
    });
    // Find the first step not in targettedStepIds
    for (const step of steps) {
      if (!targettedStepIds.has(step.id)) return step.id;
    }
    // Fallback to the first step if all are targetted (e.g. circular flow)
    return steps[0].id;
  };

  const handleOpenPreview = () => {
    if (flowSteps.length === 0) {
      toast({ title: "Fluxo Vazio", description: "Adicione etapas ao fluxo para visualizar.", variant: "destructive" });
      return;
    }
    const firstStepId = findFirstStepId(flowSteps);
    if (!firstStepId) {
        toast({ title: "Erro ao Iniciar Visualização", description: "Não foi possível determinar a primeira etapa do fluxo.", variant: "destructive" });
        return;
    }
    setInitialPreviewStepId(firstStepId);
    setIsPreviewing(true);
  };
  
  const handleClosePreview = () => {
    setIsPreviewing(false);
    setInitialPreviewStepId(null);
  };

  const currentStepToEdit = flowSteps.find(s => s.id === selectedStepId);


  const connectionLines = React.useMemo(() => {
    const lines: ConnectionLine[] = [];
    flowSteps.forEach(sourceStep => {
      // Ensure the DOM element for the source card exists and has dimensions
      const sourceCardEl = document.getElementById(`step-card-${sourceStep.id}`);
      if (!sourceCardEl) return; // Skip if card not rendered yet
      
      const sourceCardRect = {
        x: sourceStep.position.x,
        y: sourceStep.position.y,
        width: sourceCardEl.offsetWidth, // Use actual rendered width
        height: sourceCardEl.offsetHeight, // Use actual rendered height
      };

      // Default next step connection
      if (sourceStep.config.defaultNextStepId) {
        const targetStep = flowSteps.find(s => s.id === sourceStep.config.defaultNextStepId);
        const targetCardEl = targetStep ? document.getElementById(`step-card-${targetStep.id}`) : null;
        if (targetStep && targetCardEl) {
          const targetCardRect = { x: targetStep.position.x, y: targetStep.position.y, width: targetCardEl.offsetWidth, height: targetCardEl.offsetHeight };
          lines.push({
            id: `${sourceStep.id}-default-${targetStep.id}`,
            startX: sourceCardRect.x + sourceCardRect.width, // Right edge of source
            startY: sourceCardRect.y + sourceCardRect.height - 20, // Lower part of the card for default
            endX: targetCardRect.x, // Left edge of target
            endY: targetCardRect.y + targetCardRect.height / 2, // Middle of target
            type: 'default',
            sourceStepId: sourceStep.id,
            targetStepId: targetStep.id,
          });
        }
      }

      // Option-based connections
      sourceStep.config.options?.forEach((option, index) => {
        if (option.nextStepId) {
          const targetStep = flowSteps.find(s => s.id === option.nextStepId);
          const targetCardEl = targetStep ? document.getElementById(`step-card-${targetStep.id}`) : null;

          if (targetStep && targetCardEl) {
            const targetCardRect = { x: targetStep.position.x, y: targetStep.position.y, width: targetCardEl.offsetWidth, height: targetCardEl.offsetHeight };
            // More dynamic Y positioning for options
            const headerHeight = 40; // Approx height of card header
            const variableHeight = stepHasTextOrOutput(sourceStep) && sourceStep.config.setOutputVariable ? 25 : 0;
            const textHeight = stepHasTextOrOutput(sourceStep) && sourceStep.config.text ? 30 : 0;
            const optionsSectionStartOffset = headerHeight + variableHeight + textHeight + 10; // Initial offset from top of card to start of options list
            const optionItemApproxHeight = 30; // Approximate height of each option item
            const optionVerticalPosition = optionsSectionStartOffset + (index * optionItemApproxHeight) + (optionItemApproxHeight / 2);

            lines.push({
              id: `${sourceStep.id}-option-${option.value}-${targetStep.id}`,
              startX: sourceCardRect.x + sourceCardRect.width, // Right edge of source
              startY: sourceCardRect.y + Math.min(optionVerticalPosition, sourceCardRect.height - 20), // Clamp to not go below bottom of card
              endX: targetCardRect.x, // Left edge of target
              endY: targetCardRect.y + targetCardRect.height / 2, // Middle of target
              type: 'option',
              sourceStepId: sourceStep.id,
              targetStepId: targetStep.id,
              sourceOptionValue: option.value,
            });
          }
        }
      });
    });
    return lines;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowSteps, zoomLevel]); 


  const getPathDefinition = (startX: number, startY: number, endX: number, endY: number) => {
      // Simple bezier curve for now
      const dx = endX - startX;
      // const dy = endY - startY;
      const controlOffset = Math.max(20, Math.min(Math.abs(dx) * 0.3, 75)); // Make control point further for longer lines
      const c1x = startX + controlOffset;
      const c1y = startY;
      const c2x = endX - controlOffset;
      const c2y = endY;
      return `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
  };

  const handleLineClick = (line: ConnectionLine) => {
    if (line.type === 'default') {
        handleDisconnect(line.sourceStepId, 'default');
    } else if (line.type === 'option' && line.sourceOptionValue) {
        handleDisconnect(line.sourceStepId, 'option', line.sourceOptionValue);
    }
  };


  return (
    <div className="flex flex-col h-full bg-muted/30"> {/* Changed to h-full */}
      {/* Top Bar: Flow Name and Controls */}
      <div className="flex justify-between items-center p-3 border-b bg-card shadow-sm sticky top-0 z-40">
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
            <Link href="/flowbuilder/meus-fluxos" passHref>
                <Button variant="outline"><List className="mr-2 h-4 w-4" /> Meus Fluxos</Button>
            </Link>
         </div>
      </div>

      {/* Draggable Tools Toolbar */}
      <div className="p-2 border-b bg-card shadow-sm flex space-x-2 overflow-x-auto sticky top-[61px] z-30"> {/* Adjusted sticky position */}
        {toolPalette.map(tool => (
          <Button
            key={tool.type}
            draggable
            onDragStart={(e) => handleDragStartTool(e, tool.type)}
            variant="outline"
            size="icon"
            className="flex-shrink-0 cursor-grab touch-action-none"
            title={tool.label}
          >
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative"> {/* This will take remaining height */}
        {/* Canvas for dropping tools and displaying steps */}
        <div
          ref={canvasRef}
          onDragOver={handleDragOverCanvas}
          onDrop={handleDropOnCanvas}
          className={cn(
            "flex-1 relative overflow-auto dot-grid-background", 
            connectingState ? "cursor-crosshair" : (draggingStepId ? "cursor-grabbing" : "cursor-grab")
          )}
           onClick={(e) => {
            // If clicked on the canvas itself while connecting, cancel connection
            if (connectingState && e.target === canvasRef.current) {
              setConnectingState(null);
              toast({ title: "Conexão Cancelada", description: "A tentativa de conexão foi cancelada." });
            }
          }}
        >
          {/* Scalable and Pannable Content Wrapper */}
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100/zoomLevel}%`, height: `${100/zoomLevel}%`}} className="relative h-full w-full">
            {/* SVG Layer for Connection Lines */}
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" // pointer-events-none allows clicks to pass through to cards
              style={{ overflow: 'visible' }} // Ensures markers outside the path are visible
            >
              <defs>
                <marker id="arrowhead-default" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                </marker>
                 <marker id="arrowhead-option" markerWidth="8" markerHeight="5.6" refX="6.4" refY="2.8" orient="auto">
                  <polygon points="0 0, 8 2.8, 0 5.6" fill="hsl(var(--muted-foreground))" />
                </marker>
                {/* Optional: Glow effect for hovered lines, might be performance intensive */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
              </defs>
              {connectionLines.map(line => (
                <g key={line.id}
                   onMouseEnter={() => setHoveredConnectionId(line.id)}
                   onMouseLeave={() => setHoveredConnectionId(null)}
                   onClick={() => handleLineClick(line)}
                   className="cursor-pointer"
                   style={{ pointerEvents: 'all' }} // Make the g element interactive for clicks
                >
                    <path
                        d={getPathDefinition(line.startX, line.startY, line.endX, line.endY)}
                        stroke={line.type === 'default' ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        strokeWidth={hoveredConnectionId === line.id ? 4 : (line.type === 'default' ? 2 : 1.5)}
                        fill="none"
                        strokeDasharray={line.type === 'option' ? "4 3" : undefined}
                        markerEnd={line.type === 'default' ? "url(#arrowhead-default)" : "url(#arrowhead-option)"}
                        // filter={hoveredConnectionId === line.id ? "url(#glow)" : undefined} // Optional glow
                        style={{ animation: line.type === 'default' ? 'flow 1s linear infinite alternate' : 'flow 1s linear infinite alternate-reverse', transition: 'stroke-width 0.2s' }}
                    />
                    {/* Larger invisible path for easier clicking */}
                    <path
                        d={getPathDefinition(line.startX, line.startY, line.endX, line.endY)}
                        stroke="transparent"
                        strokeWidth="15" // Make it wider for easier hover/click
                        fill="none"
                    />
                    {/* Disconnect Icon on Hover */}
                    {hoveredConnectionId === line.id && (
                        <circle
                            cx={(line.startX + line.endX) / 2 + (line.endY - line.startY > 0 ? -15 : 15) * Math.sin(Math.atan2(line.endY - line.startY, line.endX - line.startX))} // Offset perpendicular to line
                            cy={(line.startY + line.endY) / 2 + (line.endX - line.startX > 0 ? 15 : -15) * Math.cos(Math.atan2(line.endY - line.startY, line.endX - line.startX))}
                            r="10"
                            fill="hsl(var(--destructive))"
                            className="pointer-events-auto" // Ensure circle is clickable
                        >
                           <title>Desconectar</title> {/* Tooltip for the disconnect icon */}
                        </circle>
                    )}
                     {hoveredConnectionId === line.id && ( // Render X icon inside the circle
                         <text
                            x={(line.startX + line.endX) / 2 + (line.endY - line.startY > 0 ? -15 : 15) * Math.sin(Math.atan2(line.endY - line.startY, line.endX - line.startX))} 
                            y={(line.startY + line.endY) / 2 + (line.endX - line.startX > 0 ? 15 : -15) * Math.cos(Math.atan2(line.endY - line.startY, line.endX - line.startX))}
                            fill="white"
                            fontSize="12"
                            textAnchor="middle"
                            dy=".3em" // Vertical alignment
                            className="pointer-events-none" // Text itself should not capture events
                         >
                            &#x2715; {/* HTML entity for 'X' */}
                         </text>
                     )}
                </g>
              ))}
            </svg>
            <style jsx global>{`
                /* Optional: Define an animation for the lines if desired */
                @keyframes flow {
                    from { stroke-dashoffset: 8; } /* Adjust for desired speed/look */
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
            
            {/* Render Flow Steps (Cards) */}
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
                onDisconnect={handleDisconnect} // Pass disconnect handler
                onHoverConnectionLine={setHoveredConnectionId}
                onLeaveConnectionLine={() => setHoveredConnectionId(null)}
                hoveredConnectionId={hoveredConnectionId}
            />
            ))}
            
            {/* Placeholder for empty canvas */}
            {flowSteps.length === 0 && ( 
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground z-10 pointer-events-none">
                    <Move className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">Arraste uma ferramenta da barra superior para adicionar a primeira etapa.</p>
                    <p className="text-sm">Arraste as etapas para organizar seu fluxo.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Editor Popup/Dialog */}
      {currentStepToEdit && (
        <Dialog open={isEditPropertiesPopupOpen} onOpenChange={setIsEditPropertiesPopupOpen}>
          <DialogContent className="sm:max-w-xl max-h-[85vh]"> {/* Adjust size as needed */}
            <DialogHeader>
              <DialogTitle>Editar Etapa: <span className="font-semibold">{currentStepToEdit.title}</span></DialogTitle>
              <DialogDescription>
                Modifique as configurações da etapa <span className="italic">{toolPalette.find(t => t.type === currentStepToEdit.type)?.label || currentStepToEdit.type}</span> selecionada.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4"> {/* Content area for the editor */}
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

      {/* Bottom Bar: Save, Preview, Activate */}
      <CardFooter className="border-t p-3 flex justify-end gap-2 bg-card shadow-inner sticky bottom-0 z-40">
        <Button variant="outline" onClick={handleOpenPreview}><Eye className="mr-2 h-4 w-4" /> Visualizar</Button>
        <Button variant="outline" onClick={() => alert("Ativação de fluxo ainda não implementada.")}><PlayCircle className="mr-2 h-4 w-4" /> Ativar Fluxo</Button>
        <Button onClick={handleSaveFlow}>
          <Save className="mr-2 h-4 w-4" /> Salvar Fluxo
        </Button>
      </CardFooter>

      {/* Flow Preview Modal */}
      {isPreviewing && initialPreviewStepId && (
        <FlowPreviewModal
          isOpen={isPreviewing}
          onClose={handleClosePreview}
          flowSteps={flowSteps}
          initialStepId={initialPreviewStepId}
        />
      )}
    </div>
  );
}

