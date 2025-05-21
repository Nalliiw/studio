
'use client';

import React, { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar'; // Basic calendar for date picking
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Workflow, MessageSquare, Award, PlusCircle, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { format, addDays, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Flow, Patient } from '@/types'; // Assuming these types are available
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data
const mockPatientDetail: Patient = {
    id: 'p1', name: 'Ana Silva', email: 'ana.silva@example.com', lastAccess: '2024-05-20T10:00:00Z', companyId: 'c1', nutritionistId: 'n1'
};

const mockAvailableFlowsForAgenda: Pick<Flow, 'id' | 'name'>[] = [
  { id: 'flow1', name: 'Check-in Diário de Humor' },
  { id: 'flow2', name: 'Registro Alimentar Semanal' },
  { id: 'flow5', name: 'Feedback Pós-Consulta' },
];

type ScheduledItemType = 'flow' | 'reminder' | 'praise';
interface ScheduledItem {
  id: string;
  type: ScheduledItemType;
  title: string; // Flow name or custom title for reminder/praise
  date: Date;
  time: string; // HH:mm
  content?: string; // For reminder/praise text, or flow ID for flow type
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
}

const mockScheduledItems: ScheduledItem[] = [
    { id: 'sch1', type: 'flow', title: 'Check-in Diário de Humor', date: new Date(), time: '09:00', content: 'flow1', recurrence: 'daily' },
    { id: 'sch2', type: 'reminder', title: 'Lembrete: Beber Água', date: addDays(new Date(), 1), time: '10:00', content: 'Não se esqueça de se hidratar bem hoje!', recurrence: 'none' },
    { id: 'sch3', type: 'praise', title: 'Elogio da Semana', date: addDays(new Date(), 3), time: '15:00', content: 'Parabéns por manter o foco nos seus lanches saudáveis esta semana!', recurrence: 'weekly' },
];


export default function PatientAgendaPage() {
  const paramsFromHook = useParams();
  const params = use(paramsFromHook as any); 
  
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(mockPatientDetail); // Fetch patient details in real app
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>(mockScheduledItems);
  const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);

  // Form state for new/editing scheduled item
  const [currentItem, setCurrentItem] = useState<Partial<ScheduledItem>>({});
  const [itemType, setItemType] = useState<ScheduledItemType>('flow');
  const [itemTitle, setItemTitle] = useState(''); // For reminder/praise
  const [itemFlowId, setItemFlowId] = useState(''); // For flow
  const [itemDate, setItemDate] = useState<Date | undefined>(new Date());
  const [itemTime, setItemTime] = useState('09:00');
  const [itemContent, setItemContent] = useState(''); // For reminder/praise
  const [itemRecurrence, setItemRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');


  useEffect(() => {
    // In a real app, fetch patient details and their scheduled items
    if (patientId) {
        // setPatient(fetchPatientById(patientId));
        // setScheduledItems(fetchScheduledItemsForPatient(patientId));
    }
  }, [patientId]);

  const handleOpenScheduleDialog = (item?: ScheduledItem) => {
    if (item) {
        setCurrentItem(item);
        setItemType(item.type);
        if (item.type === 'flow' && item.content) setItemFlowId(item.content);
        else setItemTitle(item.title);
        setItemDate(item.date);
        setItemTime(item.time);
        if (item.type !== 'flow') setItemContent(item.content || '');
        setItemRecurrence(item.recurrence);
    } else {
        setCurrentItem({ id: Date.now().toString() }); // New item
        setItemType('flow');
        setItemTitle('');
        setItemFlowId('');
        setItemDate(new Date());
        setItemTime('09:00');
        setItemContent('');
        setItemRecurrence('none');
    }
    setIsSchedulingDialogOpen(true);
  };

  const handleSaveScheduledItem = () => {
    if (!itemDate || !itemTime) {
        toast({ title: "Erro", description: "Data e hora são obrigatórios.", variant: "destructive"});
        return;
    }
    if (itemType === 'flow' && !itemFlowId) {
        toast({ title: "Erro", description: "Selecione um fluxo.", variant: "destructive"});
        return;
    }
    if ((itemType === 'reminder' || itemType === 'praise') && !itemTitle.trim()) {
        toast({ title: "Erro", description: "O título é obrigatório para lembretes/elogios.", variant: "destructive"});
        return;
    }
     if ((itemType === 'reminder' || itemType === 'praise') && !itemContent.trim()) {
        toast({ title: "Erro", description: "O conteúdo é obrigatório para lembretes/elogios.", variant: "destructive"});
        return;
    }

    const newItem: ScheduledItem = {
        id: currentItem.id || Date.now().toString(),
        type: itemType,
        title: itemType === 'flow' ? (mockAvailableFlowsForAgenda.find(f => f.id === itemFlowId)?.name || 'Fluxo') : itemTitle,
        date: itemDate,
        time: itemTime,
        content: itemType === 'flow' ? itemFlowId : itemContent,
        recurrence: itemRecurrence,
    };

    // console.log("Saving scheduled item:", newItem);
    // In a real app, save to backend
    setScheduledItems(prev => {
        const existing = prev.find(it => it.id === newItem.id);
        if (existing) {
            return prev.map(it => it.id === newItem.id ? newItem : it);
        }
        return [...prev, newItem].sort((a,b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));
    });
    toast({ title: "Agendamento Salvo!", description: `${newItem.title} agendado com sucesso.`});
    setIsSchedulingDialogOpen(false);
  };

  const handleDeleteScheduledItem = (itemId: string) => {
    setScheduledItems(prev => prev.filter(item => item.id !== itemId));
    toast({ title: "Item Removido", description: "O agendamento foi removido." });
  };

  const getIconForItemType = (type: ScheduledItemType) => {
    if (type === 'flow') return <Workflow className="h-5 w-5 text-blue-500" />;
    if (type === 'reminder') return <MessageSquare className="h-5 w-5 text-orange-500" />;
    if (type === 'praise') return <Award className="h-5 w-5 text-yellow-500" />;
    return <CalendarIcon className="h-5 w-5" />;
  }


  if (!patient) {
    return <div className="flex items-center justify-center h-full"><p>Carregando dados do paciente...</p></div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Voltar">
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda de {patient.name}</h1>
            <p className="text-muted-foreground">Planeje e visualize fluxos, lembretes e elogios.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleOpenScheduleDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Agendar Novo Item
        </Button>
      </div>

      {/* Simplified Agenda Display - A full calendar is complex */}
      <Card className="shadow-md flex-grow overflow-y-auto">
        <CardHeader>
            <CardTitle>Itens Agendados</CardTitle>
            <CardDescription>Lista de próximos eventos para {patient.name}.</CardDescription>
        </CardHeader>
        <CardContent>
            {scheduledItems.length > 0 ? (
                <div className="space-y-4">
                    {scheduledItems.map(item => (
                        <Card key={item.id} className="bg-muted/50">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {getIconForItemType(item.type)}
                                        <div>
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                            <CardDescription>
                                                {format(item.date, "PPP", { locale: ptBR })} às {item.time}
                                                {item.recurrence !== 'none' && ` (${item.recurrence === 'daily' ? 'Diário' : item.recurrence === 'weekly' ? 'Semanal' : 'Mensal'})`}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenScheduleDialog(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteScheduledItem(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </CardHeader>
                            {item.type !== 'flow' && item.content && (
                                <CardContent>
                                    <p className="text-sm text-foreground italic">"{item.content}"</p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhum item agendado para {patient.name}.</p>
                </div>
            )}
        </CardContent>
      </Card>

      {/* Dialog for Scheduling Item */}
      <Dialog open={isSchedulingDialogOpen} onOpenChange={setIsSchedulingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentItem.id && !currentItem.id.startsWith('opt_') ? 'Editar Item Agendado' : 'Agendar Novo Item'}</DialogTitle>
            <DialogDescription>
              Configure o fluxo, lembrete ou elogio para o paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemType" className="text-right">Tipo</Label>
              <Select value={itemType} onValueChange={(value) => setItemType(value as ScheduledItemType)}>
                <SelectTrigger className="col-span-3" id="itemType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flow">Fluxo de Acompanhamento</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="praise">Elogio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {itemType === 'flow' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemFlowId" className="text-right">Fluxo</Label>
                <Select value={itemFlowId} onValueChange={setItemFlowId}>
                    <SelectTrigger className="col-span-3" id="itemFlowId">
                    <SelectValue placeholder="Selecione um fluxo" />
                    </SelectTrigger>
                    <SelectContent>
                    {mockAvailableFlowsForAgenda.map(flow => (
                        <SelectItem key={flow.id} value={flow.id}>{flow.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              </div>
            )}

            {(itemType === 'reminder' || itemType === 'praise') && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="itemTitle" className="text-right">Título</Label>
                    <Input id="itemTitle" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} className="col-span-3" placeholder="Ex: Lembrete de Hidratação"/>
                </div>
            )}


            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemDate" className="text-right">Data</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !itemDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {itemDate ? format(itemDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={itemDate}
                        onSelect={setItemDate}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemTime" className="text-right">Hora</Label>
                <Input id="itemTime" type="time" value={itemTime} onChange={e => setItemTime(e.target.value)} className="col-span-3"/>
            </div>

            {(itemType === 'reminder' || itemType === 'praise') && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="itemContent" className="text-right">Conteúdo</Label>
                    <Textarea id="itemContent" value={itemContent} onChange={e => setItemContent(e.target.value)} className="col-span-3" placeholder="Digite a mensagem..." />
                </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemRecurrence" className="text-right">Recorrência</Label>
                 <Select value={itemRecurrence} onValueChange={(value) => setItemRecurrence(value as ScheduledItem['recurrence'])}>
                    <SelectTrigger className="col-span-3" id="itemRecurrence">
                    <SelectValue placeholder="Selecione a recorrência" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="monthly">Mensalmente</SelectItem>
                    </SelectContent>
                </Select>
            </div>

          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsSchedulingDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveScheduledItem}>Salvar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
