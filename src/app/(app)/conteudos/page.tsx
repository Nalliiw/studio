'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, FileAudio, FileText, Download, PlayCircle, Headphones } from 'lucide-react';
import Image from 'next/image';
import type { Content } from '@/types';

const mockVideos: Content[] = [
  { id: 'v1', type: 'video', title: '5 Exercícios para Fazer em Casa', url: '#', category: 'Exercícios', nutritionistId: 'n1' },
  { id: 'v2', type: 'video', title: 'Como Ler Rótulos de Alimentos', url: '#', category: 'Educação Alimentar', nutritionistId: 'n1' },
];

const mockAudios: Content[] = [
  { id: 'a1', type: 'audio', title: 'Podcast: Mitos da Nutrição', url: '#', category: 'Podcasts', nutritionistId: 'n1' },
  { id: 'a2', type: 'audio', title: 'Áudio Relaxante para Dormir Melhor', url: '#', category: 'Bem-estar', nutritionistId: 'n1' },
];

const mockEbooks: Content[] = [
  { id: 'e1', type: 'pdf', title: 'Guia Completo de Suplementação', url: '#', category: 'Suplementos', nutritionistId: 'n1' },
  { id: 'e2', type: 'pdf', title: 'eBook: Planejamento Semanal de Refeições', url: '#', category: 'Planejamento', nutritionistId: 'n1' },
];

const ContentCard = ({ contentItem }: { contentItem: Content }) => {
  const Icon = contentItem.type === 'video' ? Film : contentItem.type === 'audio' ? FileAudio : FileText;
  const actionButtonLabel = contentItem.type === 'video' ? "Assistir" : contentItem.type === 'audio' ? "Ouvir" : "Download";
  const ActionIcon = contentItem.type === 'video' ? PlayCircle : contentItem.type === 'audio' ? Headphones : Download;
  const placeholderImage = contentItem.type === 'video' ? `https://picsum.photos/seed/${contentItem.id}/400/225` : contentItem.type === 'pdf' ? `https://picsum.photos/seed/${contentItem.id}/400/225` : '';
  const aiHint = contentItem.type === 'video' ? 'video thumbnail' : contentItem.type === 'pdf' ? 'document preview' : '';


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      {placeholderImage && (
         <div className="relative aspect-video">
            <Image src={placeholderImage} alt={contentItem.title} layout="fill" objectFit="cover" data-ai-hint={aiHint} />
         </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Icon className="mr-2 h-5 w-5 text-primary" />
          {contentItem.title}
        </CardTitle>
        <CardDescription>Categoria: {contentItem.category}</CardDescription>
      </CardHeader>
      {contentItem.type === 'audio' && (
        <CardContent className="flex-grow">
            <div className="w-full bg-muted rounded-lg p-4 flex items-center justify-center h-24">
                <Headphones className="h-10 w-10 text-primary" />
            </div>
        </CardContent>
      )}
      <CardFooter className="border-t pt-4 mt-auto">
        <Button onClick={() => alert(`${actionButtonLabel}: ${contentItem.title}`)} className="w-full">
          <ActionIcon className="mr-2 h-4 w-4" /> {actionButtonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function ConteudosPacientePage() {
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Conteúdos</h1>
        <p className="text-muted-foreground">Acesse vídeos, áudios e e-books preparados para você.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="videos"><Film className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Vídeos</TabsTrigger>
          <TabsTrigger value="audios"><FileAudio className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Áudios</TabsTrigger>
          <TabsTrigger value="ebooks"><FileText className="mr-2 h-4 w-4 sm:hidden md:inline-block" />E-books</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-6">
          {mockVideos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockVideos.map((video) => <ContentCard key={video.id} contentItem={video} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">Nenhum vídeo disponível no momento.</p>
          )}
        </TabsContent>

        <TabsContent value="audios" className="mt-6">
          {mockAudios.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockAudios.map((audio) => <ContentCard key={audio.id} contentItem={audio} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">Nenhum áudio disponível no momento.</p>
          )}
        </TabsContent>

        <TabsContent value="ebooks" className="mt-6">
          {mockEbooks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockEbooks.map((ebook) => <ContentCard key={ebook.id} contentItem={ebook} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">Nenhum e-book disponível no momento.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
