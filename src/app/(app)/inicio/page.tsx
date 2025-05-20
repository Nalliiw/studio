
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MotivationalMessageCard from '@/components/patient/motivational-message';
import { useAuth } from '@/hooks/useAuth';

export default function InicioPacientePage() {
  const { user } = useAuth();
  const greetingName = user ? user.name.split(' ')[0] : 'Paciente';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Olá, {greetingName}!</h1>
        <p className="text-xl text-muted-foreground mt-1">Que bom ter você por aqui. Continue firme em sua jornada!</p>
      </div>

      <MotivationalMessageCard />

      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video md:aspect-[2.4/1]">
            <Image
              src="https://picsum.photos/seed/healthyfood/1200/500"
              alt="Banner inspiracional com comida saudável"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
              data-ai-hint="healthy food"
            />
            <div className="absolute inset-0 bg-black/30 flex items-end p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white shadow-md">
                "A jornada de mil milhas começa com um único passo." - Lao Tzu
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

       <div className="grid md:grid-cols-2 gap-6">
           <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Próximos Passos</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Responder formulário "Check-in Semanal"</li>
                        <li>Assistir vídeo "Importância da Hidratação"</li>
                        <li>Ler PDF "Guia de Lanches Rápidos"</li>
                    </ul>
                </CardContent>
           </Card>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Sua Conquista Mais Recente</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold text-accent">Completou o desafio de 7 dias sem açúcar!</p>
                    <p className="text-sm text-muted-foreground">Parabéns pela sua dedicação!</p>
                </CardContent>
            </Card>
       </div>

    </div>
  );
}

    