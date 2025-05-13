'use client';

import { useState, useEffect } from 'react';
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
  const params = useParams();
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
  const [itemDate, setItemDate] = useState&lt;Date | undefined&gt;(new Date());
  const [itemTime, setItemTime] = useState('09:00');
  const [itemContent, setItemContent] = useState(''); // For reminder/praise
  const [itemRecurrence, setItemRecurrence] = useState&lt;'none' | 'daily' | 'weekly' | 'monthly'&gt;('none');


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
    if (type === 'flow') return &lt;Workflow className="h-5 w-5 text-blue-500" /&gt;;
    if (type === 'reminder') return &lt;MessageSquare className="h-5 w-5 text-orange-500" /&gt;;
    if (type === 'praise') return &lt;Award className="h-5 w-5 text-yellow-500" /&gt;;
    return &lt;CalendarIcon className="h-5 w-5" /&gt;;
  }


  if (!patient) {
    return &lt;div className="flex items-center justify-center h-full"&gt;&lt;p&gt;Carregando dados do paciente...&lt;/p&gt;&lt;/div&gt;;
  }

  return (
    &lt;div className="space-y-6 h-full flex flex-col"&gt;
      &lt;div className="flex items-center gap-4"&gt;
        &lt;Button variant="outline" size="icon" onClick={() =&gt; router.push('/pacientes')} aria-label="Voltar para pacientes"&gt;
            &lt;ChevronLeft className="h-4 w-4" /&gt;
        &lt;/Button&gt;
        &lt;div&gt;
            &lt;h1 className="text-3xl font-bold tracking-tight"&gt;Agenda de {patient.name}&lt;/h1&gt;
            &lt;p className="text-muted-foreground"&gt;Planeje e visualize fluxos, lembretes e elogios.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="flex justify-end"&gt;
        &lt;Button onClick={() =&gt; handleOpenScheduleDialog()}&gt;
            &lt;PlusCircle className="mr-2 h-4 w-4" /&gt; Agendar Novo Item
        &lt;/Button&gt;
      &lt;/div&gt;
      
      {/* Simplified Agenda Display - A full calendar is complex */}
      &lt;Card className="shadow-md flex-grow overflow-y-auto"&gt;
        &lt;CardHeader&gt;
            &lt;CardTitle&gt;Itens Agendados&lt;/CardTitle&gt;
            &lt;CardDescription&gt;Lista de próximos eventos para {patient.name}.&lt;/CardDescription&gt;
        &lt;/CardHeader&gt;
        &lt;CardContent&gt;
            {scheduledItems.length &gt; 0 ? (
                &lt;div className="space-y-4"&gt;
                    {scheduledItems.map(item =&gt; (
                        &lt;Card key={item.id} className="bg-muted/50"&gt;
                            &lt;CardHeader className="pb-3"&gt;
                                &lt;div className="flex justify-between items-start"&gt;
                                    &lt;div className="flex items-center gap-3"&gt;
                                        {getIconForItemType(item.type)}
                                        &lt;div&gt;
                                            &lt;CardTitle className="text-lg"&gt;{item.title}&lt;/CardTitle&gt;
                                            &lt;CardDescription&gt;
                                                {format(item.date, "PPP", { locale: ptBR })} às {item.time}
                                                {item.recurrence !== 'none' && ` (${item.recurrence === 'daily' ? 'Diário' : item.recurrence === 'weekly' ? 'Semanal' : 'Mensal'})`}
                                            &lt;/CardDescription&gt;
                                        &lt;/div&gt;
                                    &lt;/div&gt;
                                    &lt;div className="flex gap-1"&gt;
                                        &lt;Button variant="ghost" size="icon" onClick={() =&gt; handleOpenScheduleDialog(item)}&gt;&lt;Edit className="h-4 w-4" /&gt;&lt;/Button&gt;
                                        &lt;Button variant="ghost" size="icon" onClick={() =&gt; handleDeleteScheduledItem(item.id)} className="text-destructive hover:text-destructive"&gt;&lt;Trash2 className="h-4 w-4" /&gt;&lt;/Button&gt;
                                    &lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/CardHeader&gt;
                            {item.type !== 'flow' && item.content && (
                                &lt;CardContent&gt;
                                    &lt;p className="text-sm text-foreground italic"&gt;"{item.content}"&lt;/p&gt;
                                &lt;/CardContent&gt;
                            )}
                        &lt;/Card&gt;
                    ))}
                &lt;/div&gt;
            ) : (
                &lt;div className="text-center py-10 text-muted-foreground"&gt;
                    &lt;CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" /&gt;
                    &lt;p&gt;Nenhum item agendado para {patient.name}.&lt;/p&gt;
                &lt;/div&gt;
            )}
        &lt;/CardContent&gt;
      &lt;/Card&gt;

      {/* Dialog for Scheduling Item */}
      &lt;Dialog open={isSchedulingDialogOpen} onOpenChange={setIsSchedulingDialogOpen}&gt;
        &lt;DialogContent className="sm:max-w-lg"&gt;
          &lt;DialogHeader&gt;
            &lt;DialogTitle&gt;{currentItem.id && !currentItem.id.startsWith('opt_') ? 'Editar Item Agendado' : 'Agendar Novo Item'}&lt;/DialogTitle&gt;
            &lt;DialogDescription&gt;
              Configure o fluxo, lembrete ou elogio para o paciente.
            &lt;/DialogDescription&gt;
          &lt;/DialogHeader&gt;
          &lt;div className="grid gap-4 py-4"&gt;
            &lt;div className="grid grid-cols-4 items-center gap-4"&gt;
              &lt;Label htmlFor="itemType" className="text-right"&gt;Tipo&lt;/Label&gt;
              &lt;Select value={itemType} onValueChange={(value) =&gt; setItemType(value as ScheduledItemType)}&gt;
                &lt;SelectTrigger className="col-span-3" id="itemType"&gt;
                  &lt;SelectValue placeholder="Selecione o tipo" /&gt;
                &lt;/SelectTrigger&gt;
                &lt;SelectContent&gt;
                  &lt;SelectItem value="flow"&gt;Fluxo de Acompanhamento&lt;/SelectItem&gt;
                  &lt;SelectItem value="reminder"&gt;Lembrete&lt;/SelectItem&gt;
                  &lt;SelectItem value="praise"&gt;Elogio&lt;/SelectItem&gt;
                &lt;/SelectContent&gt;
              &lt;/Select&gt;
            &lt;/div&gt;

            {itemType === 'flow' && (
              &lt;div className="grid grid-cols-4 items-center gap-4"&gt;
                &lt;Label htmlFor="itemFlowId" className="text-right"&gt;Fluxo&lt;/Label&gt;
                &lt;Select value={itemFlowId} onValueChange={setItemFlowId}&gt;
                    &lt;SelectTrigger className="col-span-3" id="itemFlowId"&gt;
                    &lt;SelectValue placeholder="Selecione um fluxo" /&gt;
                    &lt;/SelectTrigger&gt;
                    &lt;SelectContent&gt;
                    {mockAvailableFlowsForAgenda.map(flow =&gt; (
                        &lt;SelectItem key={flow.id} value={flow.id}&gt;{flow.name}&lt;/SelectItem&gt;
                    ))}
                    &lt;/SelectContent&gt;
                &lt;/Select&gt;
              &lt;/div&gt;
            )}

            {(itemType === 'reminder' || itemType === 'praise') && (
                 &lt;div className="grid grid-cols-4 items-center gap-4"&gt;
                    &lt;Label htmlFor="itemTitle" className="text-right"&gt;Título&lt;/Label&gt;
                    &lt;Input id="itemTitle" value={itemTitle} onChange={(e) =&gt; setItemTitle(e.target.value)} className="col-span-3" placeholder="Ex: Lembrete de Hidratação"/&gt;
                &lt;/div&gt;
            )}


            &lt;div className="grid grid-cols-4 items-center gap-4"&gt;
                &lt;Label htmlFor="itemDate" className="text-right"&gt;Data&lt;/Label&gt;
                &lt;Popover&gt;
                    &lt;PopoverTrigger asChild&gt;
                    &lt;Button
                        variant={"outline"}
                        className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !itemDate && "text-muted-foreground"
                        )}
                    &gt;
                        &lt;CalendarIcon className="mr-2 h-4 w-4" /&gt;
                        {itemDate ? format(itemDate, "PPP", { locale: ptBR }) : &lt;span&gt;Escolha uma data&lt;/span&gt;}
                    &lt;/Button&gt;
                    &lt;/PopoverTrigger&gt;
                    &lt;PopoverContent className="w-auto p-0"&gt;
                    &lt;Calendar
                        mode="single"
                        selected={itemDate}
                        onSelect={setItemDate}
                        initialFocus
                        locale={ptBR}
                    /&gt;
                    &lt;/PopoverContent&gt;
                &lt;/Popover&gt;
            &lt;/div&gt;

            &lt;div className="grid grid-cols-4 items-center gap-4"&gt;
                &lt;Label htmlFor="itemTime" className="text-right"&gt;Hora&lt;/Label&gt;
                &lt;Input id="itemTime" type="time" value={itemTime} onChange={e =&gt; setItemTime(e.target.value)} className="col-span-3"/&gt;
            &lt;/div&gt;
            
            {(itemType === 'reminder' || itemType === 'praise') && (
                &lt;div className="grid grid-cols-4 items-center gap-4"&gt;
                    &lt;Label htmlFor="itemContent" className="text-right"&gt;Conteúdo&lt;/Label&gt;
                    &lt;Textarea id="itemContent" value={itemContent} onChange={e =&gt; setItemContent(e.target.value)} className="col-span-3" placeholder="Digite a mensagem..." /&gt;
                &lt;/div&gt;
            )}

            &lt;div className="grid grid-cols-4 items-center gap-4"&gt;
                &lt;Label htmlFor="itemRecurrence" className="text-right"&gt;Recorrência&lt;/Label&gt;
                 &lt;Select value={itemRecurrence} onValueChange={(value) =&gt; setItemRecurrence(value as ScheduledItem['recurrence'])}&gt;
                    &lt;SelectTrigger className="col-span-3" id="itemRecurrence"&gt;
                    &lt;SelectValue placeholder="Selecione a recorrência" /&gt;
                    &lt;/SelectTrigger&gt;
                    &lt;SelectContent&gt;
                        &lt;SelectItem value="none"&gt;Nenhuma&lt;/SelectItem&gt;
                        &lt;SelectItem value="daily"&gt;Diariamente&lt;/SelectItem&gt;
                        &lt;SelectItem value="weekly"&gt;Semanalmente&lt;/SelectItem&gt;
                        &lt;SelectItem value="monthly"&gt;Mensalmente&lt;/SelectItem&gt;
                    &lt;/SelectContent&gt;
                &lt;/Select&gt;
            &lt;/div&gt;

          &lt;/div&gt;
          &lt;DialogFooter&gt;
            &lt;Button variant="outline" onClick={() =&gt; setIsSchedulingDialogOpen(false)}&gt;Cancelar&lt;/Button&gt;
            &lt;Button onClick={handleSaveScheduledItem}&gt;Salvar Agendamento&lt;/Button&gt;
          &lt;/DialogFooter&gt;
        &lt;/DialogContent&gt;
      &lt;/Dialog&gt;

    &lt;/div&gt;
  );
}
