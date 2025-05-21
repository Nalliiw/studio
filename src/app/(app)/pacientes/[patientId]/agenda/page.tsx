
'use client';

import React, { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon as CalendarIconLucide, Clock, Workflow, MessageSquare, Award, PlusCircle, Edit, Trash2, ChevronLeft, List } from 'lucide-react';
import { format, addDays, parse, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Flow, Patient } from '@/types';
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
  title: string;
  date: Date;
  time: string;
  content?: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
}

const mockScheduledItems: ScheduledItem[] = [
    { id: 'sch1', type: 'flow', title: 'Check-in Diário de Humor', date: new Date(), time: '09:00', content: 'flow1', recurrence: 'daily' },
    { id: 'sch1_today_later', type: 'reminder', title: 'Lembrete: Preparar lanche saudável', date: new Date(), time: '16:00', content: 'Não esqueça do seu lanche da tarde!', recurrence: 'none' },
    { id: 'sch2', type: 'reminder', title: 'Lembrete: Beber Água', date: addDays(new Date(), 1), time: '10:00', content: 'Não se esqueça de se hidratar bem hoje!', recurrence: 'none' },
    { id: 'sch3', type: 'praise', title: 'Elogio da Semana', date: addDays(new Date(), 3), time: '15:00', content: 'Parabéns por manter o foco nos seus lanches saudáveis esta semana!', recurrence: 'weekly' },
    { id: 'sch4_past', type: 'flow', title: 'Feedback Consulta Anterior', date: addDays(new Date(), -2), time: '11:00', content: 'flow5', recurrence: 'none' },
];


const AgendaItemIcon = ({ type }: { type: ScheduledItemType }) => {
    if (type === 'flow') return <Workflow className="h-5 w-5 text-blue-500" />;
    if (type === 'reminder') return <MessageSquare className="h-5 w-5 text-orange-500" />;
    if (type === 'praise') return <Award className="h-5 w-5 text-yellow-500" />;
    return <CalendarIconLucide className="h-5 w-5" />;
}

export default function PatientAgendaPage() {
  const paramsFromHook = useParams();
  const params = use(paramsFromHook as any); 
  
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(mockPatientDetail);
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>(mockScheduledItems);
  const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Form state for new/editing scheduled item
  const [currentItem, setCurrentItem] = useState<Partial<ScheduledItem>>({});
  const [itemType, setItemType] = useState<ScheduledItemType>('flow');
  const [itemTitle, setItemTitle] = useState('');
  const [itemFlowId, setItemFlowId] = useState('');
  const [itemDate, setItemDate] = useState<Date | undefined>(new Date());
  const [itemTime, setItemTime] = useState('09:00');
  const [itemContent, setItemContent] = useState('');
  const [itemRecurrence, setItemRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');


  useEffect(() => {
    // In a real app, fetch patient details and their scheduled items
    if (patientId) {
        // setPatient(fetchPatientById(patientId));
        // setScheduledItems(fetchScheduledItemsForPatient(patientId));
    }
  }, [patientId]);

  const handleOpenScheduleDialog = (itemToEdit?: ScheduledItem) => {
    if (itemToEdit) {
        setCurrentItem(itemToEdit);
        setItemType(itemToEdit.type);
        if (itemToEdit.type === 'flow' && itemToEdit.content) setItemFlowId(itemToEdit.content);
        else setItemTitle(itemToEdit.title);
        setItemDate(itemToEdit.date);
        setItemTime(itemToEdit.time);
        if (itemToEdit.type !== 'flow') setItemContent(itemToEdit.content || '');
        setItemRecurrence(itemToEdit.recurrence);
    } else {
        setCurrentItem({ id: Date.now().toString() }); // New item
        setItemType('flow');
        setItemTitle('');
        setItemFlowId(mockAvailableFlowsForAgenda[0]?.id || ''); // Default to first flow if available
        setItemDate(selectedDate || new Date()); // Pre-fill with selected calendar date
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
        title: itemType === 'flow' ? (mockAvailableFlowsForAgenda.find(f => f.id === itemFlowId)?.name || 'Fluxo Desconhecido') : itemTitle,
        date: itemDate,
        time: itemTime,
        content: itemType === 'flow' ? itemFlowId : itemContent,
        recurrence: itemRecurrence,
    };

    setScheduledItems(prev => {
        const existing = prev.find(it => it.id === newItem.id);
        const updatedItems = existing ? prev.map(it => it.id === newItem.id ? newItem : it) : [...prev, newItem];
        return updatedItems.sort((a,b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));
    });
    toast({ title: "Agendamento Salvo!", description: `${newItem.title} agendado com sucesso.`});
    setIsSchedulingDialogOpen(false);
  };

  const handleDeleteScheduledItem = (itemId: string) => {
    setScheduledItems(prev => prev.filter(item => item.id !== itemId));
    toast({ title: "Item Removido", description: "O agendamento foi removido." });
  };

  const scheduledItemsForSelectedDate = selectedDate
    ? scheduledItems.filter(item => isSameDay(item.date, selectedDate))
    : scheduledItems; // Show all if no date selected, or handle differently

  if (!patient) {
    return <div className="flex items-center justify-center h-full"><p>Carregando dados do paciente...</p></div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Voltar">
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agenda de {patient.name}</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Planeje e visualize fluxos, lembretes e elogios.</p>
            </div>
        </div>
        <Button onClick={() => handleOpenScheduleDialog()} className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" /> Agendar Novo Item
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 flex-grow min-h-0">
        <Card className="md:col-span-1 shadow-md flex flex-col">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver os eventos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center flex-grow items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border p-0 sm:p-3" // adjusted padding
              locale={ptBR}
              modifiers={{
                scheduled: scheduledItems.map(item => item.date)
              }}
              modifiersStyles={{
                scheduled: { fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'hsl(var(--primary))', textUnderlineOffset: '0.2em' }
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md flex flex-col">
          <CardHeader>
            <CardTitle>
              Eventos para {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : 'Todas as Datas'}
            </CardTitle>
            <CardDescription>
              {selectedDate 
                ? (scheduledItemsForSelectedDate.length > 0
                    ? `Encontrado(s) ${scheduledItemsForSelectedDate.length} item(ns) para este dia.`
                    : 'Nenhum evento para este dia.')
                : `Mostrando todos os ${scheduledItems.length} eventos agendados.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow overflow-y-auto pr-2"> {/* Added pr for scrollbar space */}
            {scheduledItemsForSelectedDate.length > 0 ? (
              scheduledItemsForSelectedDate.sort((a,b) => (a.time || "00:00").localeCompare(b.time || "00:00")).map(item => (
                <Card key={item.id} className="bg-muted/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                            <div className="pt-0.5"><AgendaItemIcon type={item.type} /></div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{item.time}</p>
                                </div>
                                {item.recurrence !== 'none' && (
                                    <p className="text-xs text-muted-foreground capitalize">
                                        Recorrência: {item.recurrence === 'daily' ? 'Diário' : item.recurrence === 'weekly' ? 'Semanal' : 'Mensal'}
                                    </p>
                                )}
                                {(item.type === 'reminder' || item.type === 'praise') && item.content && (
                                    <p className="text-sm text-foreground mt-1 italic">"{item.content}"</p>
                                )}
                                {item.type === 'flow' && item.content && (
                                     <p className="text-xs text-muted-foreground mt-0.5">Fluxo ID: {item.content}</p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenScheduleDialog(item)} className="h-7 w-7 sm:h-8 sm:w-8"><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteScheduledItem(item.id)} className="text-destructive hover:text-destructive h-7 w-7 sm:h-8 sm:w-8"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-full">
                <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum evento agendado {selectedDate ? "para esta data" : "ainda"}.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Scheduling Item */}
      <Dialog open={isSchedulingDialogOpen} onOpenChange={setIsSchedulingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentItem.id && !currentItem.id.startsWith('opt_') && scheduledItems.find(si => si.id === currentItem.id) ? 'Editar Item Agendado' : 'Agendar Novo Item'}</DialogTitle>
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
                        <CalendarIconLucide className="mr-2 h-4 w-4" />
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


    