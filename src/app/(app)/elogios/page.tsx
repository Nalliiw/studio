'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, MessageSquare, Mic, Video } from 'lucide-react';
import type { Praise } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const mockPraises: Praise[] = [
  { id: 'praise1', type: 'text', content: 'Parabéns pela sua dedicação esta semana! Seus esforços em seguir o plano alimentar estão trazendo ótimos resultados. Continue assim!', date: '2024-05-20T10:00:00Z', patientId: 'p1' },
  { id: 'praise2', type: 'audio', content: '#audio_url_placeholder', date: '2024-05-15T14:30:00Z', patientId: 'p1' },
  { id: 'praise3', type: 'video', content: '#video_url_placeholder', date: '2024-05-10T09:15:00Z', patientId: 'p1' },
  { id: 'praise4', type: 'text', content: 'Notei que você experimentou a nova receita de salada que enviei. Ficou ótima, né? Pequenas mudanças fazem grande diferença!', date: '2024-05-05T11:00:00Z', patientId: 'p1' },
];

const PraiseIcon = ({ type }: { type: Praise['type'] }) => {
  if (type === 'audio') return <Mic className="mr-3 h-6 w-6 text-blue-500 flex-shrink-0" />;
  if (type === 'video') return <Video className="mr-3 h-6 w-6 text-red-500 flex-shrink-0" />;
  return <MessageSquare className="mr-3 h-6 w-6 text-green-500 flex-shrink-0" />;
};

export default function ElogiosPacientePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Elogios e Feedbacks</h1>
        <p className="text-muted-foreground">Mensagens de incentivo e reconhecimento do seu nutricionista.</p>
      </div>

      {mockPraises.length > 0 ? (
        <div className="space-y-4">
          {mockPraises.map((praise) => (
            <Card key={praise.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start">
                    <PraiseIcon type={praise.type} />
                    <div>
                        <CardTitle className="text-lg leading-tight">
                            Mensagem do seu Nutricionista
                        </CardTitle>
                        <CardDescription>
                            Recebido em: {format(parseISO(praise.date), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                {praise.type === 'text' && <p className="text-foreground leading-relaxed">{praise.content}</p>}
                {praise.type === 'audio' && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Mic className="h-5 w-5 text-primary" />
                    <span>Áudio motivacional.</span>
                    <audio controls src={praise.content} className="w-full max-w-xs h-10">Seu navegador não suporta o elemento de áudio.</audio>
                  </div>
                )}
                {praise.type === 'video' && (
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                     <video controls src={praise.content} className="w-full h-full rounded-md">Seu navegador não suporta o elemento de vídeo.</video>
                     {/* Fallback if video src is placeholder */}
                     {praise.content === '#video_url_placeholder' && <p className="text-muted-foreground">Vídeo indisponível (placeholder)</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-md">
            <CardContent className="h-40 flex flex-col items-center justify-center text-center">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum elogio ou feedback ainda.</p>
                <p className="text-sm text-muted-foreground">Continue focado nos seus objetivos!</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
