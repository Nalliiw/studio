// src/components/flow/flow-preview-modal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ArrowRight, ArrowLeft, CheckCircle, Smile } from 'lucide-react';
import type { FlowStep, Flow, FlowStepOption } from '@/types'; // Ensure Flow type is exported from types/index.ts
import Image from 'next/image';

interface FlowPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowSteps: FlowStep[];
  initialStepId: string;
}

interface Answer {
  [stepId: string]: any;
}

const FlowPreviewModal: React.FC<FlowPreviewModalProps> = ({ isOpen, onClose, flowSteps, initialStepId }) => {
  const [currentStepId, setCurrentStepId] = useState<string | null>(initialStepId);
  const [answers, setAnswers] = useState<Answer>({});
  const [history, setHistory] = useState<string[]>([]); // To keep track of visited steps for back navigation

  useEffect(() => {
    if (isOpen) {
      setCurrentStepId(initialStepId);
      setAnswers({});
      setHistory([initialStepId]);
    }
  }, [isOpen, initialStepId]);

  const currentStep = flowSteps.find(step => step.id === currentStepId);

  const handleAnswerChange = (stepId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
  };
  
  const handleMultipleChoiceChange = (stepId: string, optionValue: string, checked: boolean) => {
    setAnswers(prev => {
        const currentSelection = prev[stepId] as string[] || [];
        if (checked) {
            return { ...prev, [stepId]: [...currentSelection, optionValue] };
        } else {
            return { ...prev, [stepId]: currentSelection.filter(v => v !== optionValue) };
        }
    });
  };

  const navigateToNextStep = (nextStepId?: string) => {
    if (nextStepId && flowSteps.find(s => s.id === nextStepId)) {
      setHistory(prev => [...prev, nextStepId]);
      setCurrentStepId(nextStepId);
    } else {
      // End of flow or no next step defined
      setCurrentStepId(null); // Indicate end of flow
    }
  };

  const handleNext = () => {
    if (!currentStep) return;

    let nextStepId: string | undefined = currentStep.config.defaultNextStepId;

    if (currentStep.type === 'single_choice' || currentStep.type === 'emoji_rating') {
      const selectedOptionValue = answers[currentStep.id];
      const selectedOption = currentStep.config.options?.find(opt => opt.value === selectedOptionValue);
      if (selectedOption?.nextStepId) {
        nextStepId = selectedOption.nextStepId;
      }
    } else if (currentStep.type === 'multiple_choice') {
      // For multiple choice, typically a default next step is used, or more complex logic not handled here.
      // Using defaultNextStepId is the simplest approach for now.
    }
    
    navigateToNextStep(nextStepId);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current step
      const previousStepId = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentStepId(previousStepId);
    }
  };
  
  const renderStepContent = () => {
    if (!currentStep) {
      return (
        <div className="text-center py-10">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Fim da Visualização do Fluxo</h3>
          <p className="text-muted-foreground mb-4">Você chegou ao final deste fluxo.</p>
          <Button onClick={onClose}>Fechar Visualização</Button>
        </div>
      );
    }

    switch (currentStep.type) {
      case 'information_text':
        return <p className="text-foreground whitespace-pre-wrap">{currentStep.config.text}</p>;
      
      case 'text_input':
        return (
          <div className="space-y-2">
            <Label htmlFor={`preview-${currentStep.id}`}>{currentStep.config.text}</Label>
            <Textarea
              id={`preview-${currentStep.id}`}
              placeholder={currentStep.config.placeholder}
              value={answers[currentStep.id] || ''}
              onChange={(e) => handleAnswerChange(currentStep.id, e.target.value)}
              rows={3}
            />
          </div>
        );

      case 'single_choice':
        return (
          <div className="space-y-2">
            <Label>{currentStep.config.text}</Label>
            <RadioGroup
              value={answers[currentStep.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentStep.id, value)}
              className="space-y-1"
            >
              {currentStep.config.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`preview-${currentStep.id}-${option.value}`} />
                  <Label htmlFor={`preview-${currentStep.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            <Label>{currentStep.config.text}</Label>
            {currentStep.config.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`preview-${currentStep.id}-${option.value}`}
                  checked={(answers[currentStep.id] as string[] || []).includes(option.value)}
                  onCheckedChange={(checked) => handleMultipleChoiceChange(currentStep.id, option.value, !!checked)}
                />
                <Label htmlFor={`preview-${currentStep.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'emoji_rating':
        const emojis = ['😞', '😕', '😐', '🙂', '😄']; // Example emojis
        const maxEmojis = currentStep.config.maxEmojis || 5;
        return (
          <div className="space-y-2">
            <Label>{currentStep.config.text}</Label>
            <div className="flex space-x-2">
              {emojis.slice(0, maxEmojis).map((emoji, index) => (
                <Button
                  key={index}
                  variant={answers[currentStep.id] === `emoji_${index}` ? 'default' : 'outline'}
                  size="icon"
                  className="text-2xl p-2 h-12 w-12"
                  onClick={() => handleAnswerChange(currentStep.id, `emoji_${index}`)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        );
      
      case 'image_upload':
      case 'audio_record':
      case 'video_record':
        return (
            <div className="p-4 border rounded-md bg-muted text-center">
                <Label className="block mb-2">{currentStep.config.text}</Label>
                <p className="text-sm text-muted-foreground">(Simulação de {currentStep.title})</p>
            </div>
        );

      case 'display_pdf':
      case 'display_image':
      case 'display_audio':
      case 'display_video':
        let contentElement;
        if (currentStep.type === 'display_image' && currentStep.config.url) {
            contentElement = <Image src={currentStep.config.url} alt={currentStep.config.text || "Imagem"} width={400} height={300} className="rounded-md object-contain mx-auto max-h-64" data-ai-hint="abstract illustration" />;
        } else if (currentStep.type === 'display_video' && currentStep.config.url) {
            contentElement = <video src={currentStep.config.url} controls className="rounded-md w-full max-w-md mx-auto" >Seu navegador não suporta vídeos.</video>;
        } else if (currentStep.type === 'display_audio' && currentStep.config.url) {
            contentElement = <audio src={currentStep.config.url} controls className="w-full">Seu navegador não suporta áudio.</audio>;
        } else {
            contentElement = <p className="text-sm text-muted-foreground">(Simulação de conteúdo: {currentStep.config.url || currentStep.config.text || currentStep.title})</p>;
        }
        return (
            <div className="p-4 border rounded-md bg-muted space-y-2">
                <Label className="block text-center font-semibold">{currentStep.config.text || currentStep.title}</Label>
                {contentElement}
            </div>
        );

      default:
        return <p>Tipo de etapa não suportado na visualização: {currentStep.type}</p>;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Visualização do Fluxo: {currentStep?.title || "Fim do Fluxo"}</DialogTitle>
          {currentStep && <DialogDescription>Etapa {history.length} de aprox. {flowSteps.length}</DialogDescription>}
        </DialogHeader>
        
        <ScrollArea className="flex-grow my-4 pr-6">
          <div className="space-y-6 min-h-[200px]">
            {renderStepContent()}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t gap-2">
           <Button variant="ghost" onClick={onClose} className="mr-auto">
                <X className="mr-2 h-4 w-4" /> Fechar
            </Button>
          {currentStep && history.length > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          )}
          {currentStep && (
            <Button onClick={handleNext} disabled={!currentStep || ( (currentStep.type.includes('choice') || currentStep.type === 'emoji_rating') && !answers[currentStep.id])}>
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlowPreviewModal;
