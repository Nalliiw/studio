
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
  CircleDot, ImageUp, Smile, Mic, Video as VideoIcon, FileText, Image as ImageIcon, FileAudio, Film, AlignLeft, HelpCircle, Link2, Variable, ZoomIn, ZoomOut, Move, Unlink, List, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Flow, FlowStep, FlowStepType, FlowStepOption, FlowStepConfig } from '@/types';
import { cn } from '@/lib/utils';
import FlowPreviewModal from '@/components/flow/flow-preview-modal';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';


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
const CARD_HEIGHT_ESTIMATE = 260;

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
  if (!step || !step.config) {
    return false;
  }
  const hasText = typeof step.config.text === 'string' && step.config.text.trim() !== '';
  const hasOutputVar = typeof step.config.setOutputVariable === 'string' && step.config.setOutputVariable.trim() !== '';

  if (step.type === 'multiple_choice' || step.type === 'single_choice' || step.type === 'emoji_rating') {
    return true;
  }

  return hasText || hasOutputVar;
};


const FlowStepCardComponent = ({ step, onClick, onRemove, allSteps, onStartInteraction, isConnectingSource, isPotentialTarget, onInitiateConnection, onDisconnect, onHoverConnectionLine, onLeaveConnectionLine, hoveredConnectionId }: {
  step: FlowStep;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRemove: (id: string) => void;
  allSteps: FlowStep[];
  onStartInteraction: (clientX: number, clientY: number, stepId: string) => void;
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
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button, a, select, input, textarea')) return;
        if (e.button === 0) {
          onStartInteraction(e.clientX, e.clientY, step.id);
        }
      }}
      onTouchStart={(e) => {
         if ((e.target as HTMLElement).closest('button, a, select, input, textarea')) return;
         if (e.touches.length === 1) {
           onStartInteraction(e.touches[0].clientX, e.touches[0].clientY, step.id);
         }
      }}
      onClick={onClick}
      className={cn(
        "p-3 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-150 ease-in-out cursor-grab absolute w-60 bg-card flex flex-col space-y-2 border-2",
        isConnectingSource && "ring-2 ring-primary ring-offset-2 shadow-primary/50 border-primary",
        isPotentialTarget && "ring-2 ring-accent ring-offset-1 animate-pulse shadow-accent/50 border-accent",
         !isConnectingSource && !isPotentialTarget && "border-card"
      )}
      id={`step-card-${step.id}`}
      style={{ left: step.position.x, top: step.position.y, minHeight: `${CARD_HEIGHT_ESTIMATE}px` }}
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
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowIdToEdit = searchParams.get('edit');

  const [isEditing, setIsEditing] = useState(!!flowIdToEdit);
  const [isLoadingFlow, setIsLoadingFlow] = useState(!!flowIdToEdit);
  const [flowName, setFlowName] = useState('');
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isEditPropertiesPopupOpen, setIsEditPropertiesPopupOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 2.5;
  const ZOOM_SENSITIVITY = 0.001;

  const [connectingState, setConnectingState] = useState<ConnectingState | null>(null);
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [initialPreviewStepId, setInitialPreviewStepId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMobile = useIsMobile();
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef(0);


 useEffect(() => {
    const fetchFlowToEdit = async (id: string) => {
      setIsLoadingFlow(true);
      try {
        const response = await fetch(`/api/flows/${id}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar fluxo para edição.');
        }
        const flowData: Flow = await response.json();
        setFlowName(flowData.name);
        setFlowSteps(flowData.steps || []); // Ensure steps is an array
        setIsEditing(true);
        toast({ title: "Modo de Edição", description: `Carregando fluxo: ${flowData.name}` });
      } catch (error) {
        console.error("Erro ao carregar fluxo:", error);
        toast({ title: "Erro ao Carregar Fluxo", description: (error as Error).message, variant: "destructive" });
        router.push('/flowbuilder/meus-fluxos'); // Redirect to list if loading fails
      } finally {
        setIsLoadingFlow(false);
      }
    };

    if (flowIdToEdit) {
      fetchFlowToEdit(flowIdToEdit);
    } else {
      setIsEditing(false);
      setIsLoadingFlow(false);
      setFlowName('');
      setFlowSteps([]);
    }
  }, [flowIdToEdit, router]);


  const addStep = useCallback((toolType: FlowStepType, position: { x: number; y: number }) => {
    const tool = toolPalette.find(t => t.type === toolType);
    if (!tool) return;

    const newStep: FlowStep = {
      id: Date.now().toString(),
      type: tool.type,
      title: tool.defaultTitle,
      config: JSON.parse(JSON.stringify(tool.defaultConfig)),
      position: position,
    };
    setFlowSteps(prev => [...prev, newStep]);
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
      const x = (event.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel;
      const y = (event.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel;
      addStep(toolType, { x: x - CARD_WIDTH / 2, y: y - CARD_HEIGHT_ESTIMATE / 2 });
      const tool = toolPalette.find(t => t.type === toolType);
      toast({ title: "Ferramenta Adicionada", description: `${tool?.label || 'Ferramenta'} adicionada ao fluxo.`, duration: 2000 });
    }
  };


 const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    if (!draggingStepId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    let newX = (clientX / zoomLevel) - dragOffset.current.x - (canvasRect.left / zoomLevel) + (canvasRef.current.scrollLeft / zoomLevel);
    let newY = (clientY / zoomLevel) - dragOffset.current.y - (canvasRect.top / zoomLevel) + (canvasRef.current.scrollTop / zoomLevel);

    newX = Math.max(0, newX);
    newY = Math.max(0, newY);

    setFlowSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === draggingStepId ? { ...step, position: { x: newX, y: newY } } : step
      )
    );
  }, [draggingStepId, zoomLevel]);

  const handleInteractionEnd = useCallback(() => {
    setDraggingStepId(null);
  }, []);

  useEffect(() => {
    const MOUSE_MOVE_EVENT = 'mousemove';
    const MOUSE_UP_EVENT = 'mouseup';
    const TOUCH_MOVE_EVENT = 'touchmove';
    const TOUCH_END_EVENT = 'touchend';

    const onMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
        if (draggingStepId && e.touches[0]) {
            e.preventDefault();
            handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const onMouseUpOrTouchEnd = () => handleInteractionEnd();

    if (draggingStepId) {
      document.addEventListener(MOUSE_MOVE_EVENT, onMouseMove);
      document.addEventListener(TOUCH_MOVE_EVENT, onTouchMove, { passive: false });
      document.addEventListener(MOUSE_UP_EVENT, onMouseUpOrTouchEnd);
      document.addEventListener(TOUCH_END_EVENT, onMouseUpOrTouchEnd);
    }
    return () => {
      document.removeEventListener(MOUSE_MOVE_EVENT, onMouseMove);
      document.removeEventListener(TOUCH_MOVE_EVENT, onTouchMove);
      document.removeEventListener(MOUSE_UP_EVENT, onMouseUpOrTouchEnd);
      document.removeEventListener(TOUCH_END_EVENT, onMouseUpOrTouchEnd);
    };
  }, [draggingStepId, handleInteractionMove, handleInteractionEnd]);

  const handleStepInteractionStart = useCallback((clientX: number, clientY: number, stepId: string) => {
    if (connectingState) return;
    const step = flowSteps.find(s => s.id === stepId);
    if (!step || !canvasRef.current) return;

    setDraggingStepId(stepId);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: (clientX / zoomLevel) - step.position.x - (canvasRect.left / zoomLevel) + (canvasRef.current.scrollLeft / zoomLevel),
      y: (clientY / zoomLevel) - step.position.y - (canvasRect.top / zoomLevel) + (canvasRef.current.scrollTop / zoomLevel),
    };
  }, [connectingState, flowSteps, zoomLevel]);


  const handleToolTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (!isMobile) return;

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }

    if (event.touches.length === 1) {
       event.preventDefault();
    }
  };

  const handleToolTouchEndOnButton = (event: React.TouchEvent<HTMLButtonElement>, tool: Tool) => {
    if (!isMobile) return;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;

    if (tapLength < 300 && tapLength > 0) {
      if(tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
      lastTapRef.current = 0;

      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = (canvasRef.current.scrollLeft + canvasRect.width / 2) / zoomLevel - (CARD_WIDTH / 2);
        const y = (canvasRef.current.scrollTop + canvasRect.height / 2) / zoomLevel - (CARD_HEIGHT_ESTIMATE / 2);
        addStep(tool.type, { x: Math.max(0,x), y: Math.max(0,y) });
        toast({ title: "Ferramenta Adicionada", description: `${tool.label} adicionado ao fluxo.`, duration: 2000});
      }
    } else {
      lastTapRef.current = currentTime;
      tapTimeoutRef.current = setTimeout(() => {
         toast({ title: tool.label, duration: 2000, description: "Toque duas vezes para adicionar." });
        tapTimeoutRef.current = null;
      }, 300);
    }
  };


  const handleInitiateConnection = (sourceStepId: string, sourceType: 'default' | 'option', sourceOptionValue?: string) => {
    setConnectingState({ sourceStepId, sourceType, sourceOptionValue });
    setIsEditPropertiesPopupOpen(false);
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
    if (connectingState?.sourceStepId === sourceStepId) {
        if (connectingState.sourceType === 'default' && disconnectType === 'default') {
            setConnectingState(null);
        } else if (connectingState.sourceType === 'option' && disconnectType === 'option' && connectingState.sourceOptionValue === optionValue) {
            setConnectingState(null);
        }
    }
  }, [connectingState]);


  const handleStepCardClick = (e: React.MouseEvent<HTMLDivElement>, stepId: string) => {
    if (draggingStepId && draggingStepId === stepId) {
        return;
    }

    if (connectingState) {
      if (connectingState.sourceStepId === stepId) {
        toast({ title: "Ação Inválida", description: "Não é possível conectar uma etapa a ela mesma desta forma.", variant: "destructive" });
        return;
      }
      completeConnection(stepId);
    } else {
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
            opt.value === optionValue ? { ...opt, label: newLabel, nextStepId: newNextStepId === NO_NEXT_STEP_VALUE ? undefined : newNextStepId } : opt
          );
          return { ...step, config: { ...step.config, options: newOptions } };
        }
        return step;
      })
    );
  };

const handleSaveOrUpdateFlow = async () => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Você precisa estar logado para salvar um fluxo.", variant: "destructive" });
      return;
    }
    if (flowName.trim() === '') {
      toast({ title: "Erro", description: "O nome do fluxo é obrigatório.", variant: "destructive" });
      return;
    }
    if (flowSteps.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos uma etapa ao fluxo.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const flowPayloadForCreate = {
      name: flowName,
      steps: flowSteps,
      nutritionistId: user.id,
      status: 'draft' as 'draft' | 'active' | 'archived',
    };
    const flowPayloadForUpdate = {
      name: flowName,
      steps: flowSteps,
      // nutritionistId and status are not typically updated here, or status handled separately
    };


    try {
      let response;
      const initialErrorMessage = `Falha ao ${isEditing ? 'atualizar' : 'salvar'} fluxo.`;


      if (isEditing && flowIdToEdit) {
        response = await fetch(`/api/flows/${flowIdToEdit}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flowPayloadForUpdate),
        });
      } else {
        response = await fetch('/api/flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flowPayloadForCreate),
        });
      }

      if (!response.ok) {
        let detailedErrorMessage = initialErrorMessage; // Fallback
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              if (errorData.error) {
                detailedErrorMessage = errorData.error;
                if (errorData.details) {
                    if (errorData.details.message) {
                         detailedErrorMessage += `: ${errorData.details.message}`;
                    } else if (typeof errorData.details === 'string') {
                        detailedErrorMessage += `: ${errorData.details}`;
                    } else if (errorData.details.formErrors && Array.isArray(errorData.details.formErrors) && errorData.details.formErrors.length > 0) {
                        detailedErrorMessage += `: ${errorData.details.formErrors.join(', ')}`;
                    } else if (errorData.details._errors && Array.isArray(errorData.details._errors) && errorData.details._errors.length > 0) {
                         detailedErrorMessage += `: ${errorData.details._errors.join(', ')}`;
                    }
                }
              } else if (errorData.message) {
                detailedErrorMessage = errorData.message;
              } else {
                detailedErrorMessage = responseText; // Use raw text if no specific error fields
              }
            } catch (jsonParseError) {
              // JSON parsing failed, use the raw text
              detailedErrorMessage = responseText;
            }
          } else {
             detailedErrorMessage = `Erro ${response.status}: ${response.statusText || initialErrorMessage}`;
          }
        } catch (textError) {
          // Failed to even get text, stick with initial error or status text
          detailedErrorMessage = `Erro ${response.status}: ${response.statusText || initialErrorMessage}`;
        }
        throw new Error(detailedErrorMessage);
      }

      toast({ title: `Fluxo ${isEditing ? 'Atualizado' : 'Salvo'}!`, description: `O fluxo "${flowName}" foi ${isEditing ? 'atualizado' : 'salvo'} com sucesso.` });
      router.push('/flowbuilder/meus-fluxos');
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'salvar'} fluxo:`, error);
      toast({ title: `Erro ao ${isEditing ? 'Atualizar' : 'Salvar'} Fluxo`, description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 1 / 1.2;
    const newZoom = Math.max(MIN_ZOOM, Math.min(zoomLevel * factor, MAX_ZOOM));

    if (canvasRef.current) {
        const canvas = canvasRef.current;
        // const canvasRect = canvas.getBoundingClientRect();

        const viewportCenterX = canvas.scrollLeft + canvas.offsetWidth / 2;
        const viewportCenterY = canvas.scrollTop + canvas.offsetHeight / 2;

        const worldX = viewportCenterX / zoomLevel;
        const worldY = viewportCenterY / zoomLevel;

        setZoomLevel(newZoom);

        const newScrollLeft = (worldX * newZoom) - (canvas.offsetWidth / 2);
        const newScrollTop = (worldY * newZoom) - (canvas.offsetHeight / 2);

        canvas.scrollLeft = newScrollLeft;
        canvas.scrollTop = newScrollTop;
    } else {
        setZoomLevel(newZoom);
    }
  };

  const handleWheelZoom = useCallback((event: WheelEvent) => {
    if (!canvasRef.current || draggingStepId) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const delta = event.deltaY * -ZOOM_SENSITIVITY;
    const newZoomUnbounded = zoomLevel * (1 + delta);
    const newZoom = Math.max(MIN_ZOOM, Math.min(newZoomUnbounded, MAX_ZOOM));

    if (newZoom === zoomLevel) return;

    const worldX = (mouseX + canvas.scrollLeft) / zoomLevel;
    const worldY = (mouseY + canvas.scrollTop) / zoomLevel;

    setZoomLevel(newZoom);

    const newScrollLeft = (worldX * newZoom) - mouseX;
    const newScrollTop = (worldY * newZoom) - mouseY;

    requestAnimationFrame(() => {
        canvas.scrollLeft = newScrollLeft;
        canvas.scrollTop = newScrollTop;
    });

  }, [zoomLevel, draggingStepId]);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement && !isMobile) {
      canvasElement.addEventListener('wheel', handleWheelZoom, { passive: false });
      return () => {
        canvasElement.removeEventListener('wheel', handleWheelZoom);
      };
    }
  }, [handleWheelZoom, isMobile]);


  const findFirstStepId = (steps: FlowStep[]): string | null => {
    if (steps.length === 0) return null;
    const targettedStepIds = new Set<string>();
    steps.forEach(step => {
      if (step.config.defaultNextStepId) targettedStepIds.add(step.config.defaultNextStepId);
      step.config.options?.forEach(opt => {
        if (opt.nextStepId) targettedStepIds.add(opt.nextStepId);
      });
    });
    for (const step of steps) {
      if (!targettedStepIds.has(step.id)) return step.id;
    }
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
      const sourceCardEl = document.getElementById(`step-card-${sourceStep.id}`);
      if (!sourceCardEl) return;

      const sourceCardRect = {
        x: sourceStep.position.x,
        y: sourceStep.position.y,
        width: sourceCardEl.offsetWidth,
        height: sourceCardEl.offsetHeight,
      };

      if (sourceStep.config.defaultNextStepId) {
        const targetStep = flowSteps.find(s => s.id === sourceStep.config.defaultNextStepId);
        const targetCardEl = targetStep ? document.getElementById(`step-card-${targetStep.id}`) : null;
        if (targetStep && targetCardEl) {
          const targetCardRect = { x: targetStep.position.x, y: targetStep.position.y, width: targetCardEl.offsetWidth, height: targetCardEl.offsetHeight };
          lines.push({
            id: `${sourceStep.id}-default-${targetStep.id}`,
            startX: sourceCardRect.x + sourceCardRect.width,
            startY: sourceCardRect.y + sourceCardRect.height - 20, // Near the "Próxima Etapa" text
            endX: targetCardRect.x,
            endY: targetCardRect.y + targetCardRect.height / 2,
            type: 'default',
            sourceStepId: sourceStep.id,
            targetStepId: targetStep.id,
          });
        }
      }

      sourceStep.config.options?.forEach((option, index) => {
        if (option.nextStepId) {
          const targetStep = flowSteps.find(s => s.id === option.nextStepId);
          const targetCardEl = targetStep ? document.getElementById(`step-card-${targetStep.id}`) : null;

          if (targetStep && targetCardEl) {
            const targetCardRect = { x: targetStep.position.x, y: targetStep.position.y, width: targetCardEl.offsetWidth, height: targetCardEl.offsetHeight };

            const baseHeaderHeight = 40;
            const outputVarHeight = sourceStep.config.setOutputVariable ? 22 : 0;
            const textContentHeight = sourceStep.config.text ? 20 : 0;
            const optionsSectionPadding = 8;
            const optionItemHeightWithSpacing = 38;

            let startYForOptions = sourceCardRect.y + baseHeaderHeight + outputVarHeight + textContentHeight + optionsSectionPadding;

            const optionCenterY = startYForOptions + (index * optionItemHeightWithSpacing) + (optionItemHeightWithSpacing / 2);

            lines.push({
              id: `${sourceStep.id}-option-${option.value}-${targetStep.id}`,
              startX: sourceCardRect.x + sourceCardRect.width,
              startY: Math.min(optionCenterY, sourceCardRect.y + sourceCardRect.height - 10),
              endX: targetCardRect.x,
              endY: targetCardRect.y + targetCardRect.height / 2,
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
  }, [flowSteps, zoomLevel, hoveredConnectionId]); // Added zoomLevel and hoveredConnectionId to dependencies


  const getPathDefinition = (startX: number, startY: number, endX: number, endY: number) => {
      const dx = endX - startX;
      const controlOffset = Math.max(20, Math.min(Math.abs(dx) * 0.3, 75));
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

  if (isLoadingFlow) {
    return (
      <div className="flex flex-col h-full bg-muted/30 p-2 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando fluxo...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full bg-muted/30 p-2">
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
            <Link href="/flowbuilder/meus-fluxos" passHref>
                <Button variant="outline"><List className="mr-2 h-4 w-4" /> Meus Fluxos</Button>
            </Link>
         </div>
      </div>

      <div className="p-2 border-b bg-card shadow-sm flex space-x-2 overflow-x-auto sticky top-[61px] z-30">
        {toolPalette.map(tool => (
          <Button
            key={tool.type}
            draggable={!isMobile}
            onDragStart={!isMobile ? (e) => handleDragStartTool(e, tool.type) : undefined}
            onTouchStart={isMobile ? (e) => handleToolTouchStart(e) : undefined}
            onTouchEnd={isMobile ? (e) => handleToolTouchEndOnButton(e, tool) : undefined}
            onClick={(e) => {
                if (!isMobile && e.detail > 0) {
                    e.preventDefault();
                }
            }}
            variant="outline"
            size="icon"
            className="flex-shrink-0 cursor-grab touch-manipulation"
            title={tool.label}
          >
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={canvasRef}
          onDragOver={handleDragOverCanvas}
          onDrop={handleDropOnCanvas}
          className={cn(
            "flex-1 relative overflow-auto dot-grid-background",
            connectingState ? "cursor-crosshair" : (draggingStepId ? "cursor-grabbing" : "cursor-grab")
          )}
           onClick={(e) => {
            if (connectingState && e.target === canvasRef.current) {
              setConnectingState(null);
              toast({ title: "Conexão Cancelada", description: "A tentativa de conexão foi cancelada." });
            }
          }}
        >
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `calc(100% / ${zoomLevel})`, height: `calc(100% / ${zoomLevel})`}} className="relative h-full w-full">
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker id="arrowhead-default" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                </marker>
                 <marker id="arrowhead-option" markerWidth="8" markerHeight="5.6" refX="6.4" refY="2.8" orient="auto">
                  <polygon points="0 0, 8 2.8, 0 5.6" fill="hsl(var(--muted-foreground))" />
                </marker>
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
                   style={{ pointerEvents: 'all' }}
                >
                    <path
                        d={getPathDefinition(line.startX, line.startY, line.endX, line.endY)}
                        stroke={line.type === 'default' ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        strokeWidth={hoveredConnectionId === line.id ? 4 : (line.type === 'default' ? 2 : 1.5)}
                        fill="none"
                        strokeDasharray={line.type === 'option' ? "4 3" : undefined}
                        markerEnd={line.type === 'default' ? "url(#arrowhead-default)" : "url(#arrowhead-option)"}
                        style={{ transition: 'stroke-width 0.2s' }}
                    />
                    <path
                        d={getPathDefinition(line.startX, line.startY, line.endX, line.endY)}
                        stroke="transparent"
                        strokeWidth="15"
                        fill="none"
                    />
                    {hoveredConnectionId === line.id && (
                        <circle
                            cx={(line.startX + line.endX) / 2 + (line.endY - line.startY > 0 ? -15 : 15) * Math.sin(Math.atan2(line.endY - line.startY, line.endX - line.startX))}
                            cy={(line.startY + line.endY) / 2 + (line.endX - line.startX > 0 ? 15 : -15) * Math.cos(Math.atan2(line.endY - line.startY, line.endX - line.startX))}
                            r="10"
                            fill="hsl(var(--destructive))"
                            className="pointer-events-auto"
                        >
                           <title>Desconectar</title>
                        </circle>
                    )}
                     {hoveredConnectionId === line.id && (
                         <text
                            x={(line.startX + line.endX) / 2 + (line.endY - line.startY > 0 ? -15 : 15) * Math.sin(Math.atan2(line.endY - line.startY, line.endX - line.startX))}
                            y={(line.startY + line.endY) / 2 + (line.endX - line.startX > 0 ? 15 : -15) * Math.cos(Math.atan2(line.endY - line.startY, line.endX - line.startX))}
                            fill="white"
                            fontSize="12"
                            textAnchor="middle"
                            dy=".3em"
                            className="pointer-events-none"
                         >
                            &#x2715;
                         </text>
                     )}
                </g>
              ))}
            </svg>

            {flowSteps.map(step => (
            <FlowStepCardComponent
                key={step.id}
                step={step}
                onClick={(e) => handleStepCardClick(e, step.id)}
                onRemove={removeStep}
                allSteps={flowSteps}
                onStartInteraction={handleStepInteractionStart}
                isConnectingSource={connectingState?.sourceStepId === step.id}
                isPotentialTarget={!!connectingState && connectingState.sourceStepId !== step.id}
                onInitiateConnection={handleInitiateConnection}
                onDisconnect={handleDisconnect}
                onHoverConnectionLine={setHoveredConnectionId}
                onLeaveConnectionLine={() => setHoveredConnectionId(null)}
                hoveredConnectionId={hoveredConnectionId}
            />
            ))}

            {flowSteps.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground z-10 pointer-events-none">
                    <Move className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">Arraste uma ferramenta da barra superior para adicionar a primeira etapa.</p>
                     <p className="text-sm">No mobile: toque duas vezes.</p>
                </div>
            )}
          </div>
          {/* Floating Zoom Buttons */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <Button variant="outline" size="icon" onClick={() => handleManualZoom('in')} title="Aumentar Zoom" className="bg-card hover:bg-muted">
                <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleManualZoom('out')} title="Diminuir Zoom" className="bg-card hover:bg-muted">
                <ZoomOut className="h-5 w-5" />
            </Button>
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

      <CardFooter className="border-t p-3 flex justify-end gap-2 bg-card shadow-inner sticky bottom-0 z-40">
        <Button variant="outline" onClick={handleOpenPreview}><Eye className="mr-2 h-4 w-4" /> Visualizar</Button>
        <Button variant="outline" onClick={() => alert("Ativação de fluxo ainda não implementada.")}><PlayCircle className="mr-2 h-4 w-4" /> Ativar Fluxo</Button>
        <Button onClick={handleSaveOrUpdateFlow} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isEditing ? 'Atualizar Fluxo' : 'Salvar Fluxo'}
        </Button>
      </CardFooter>

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
