'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function RelatoriosGeraisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Gerais</h1>
        <p className="text-muted-foreground">Análises e dados consolidados do sistema.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Relatórios Detalhados
          </CardTitle>
          <CardDescription>
            Esta seção está em desenvolvimento. Em breve, você poderá acessar relatórios completos sobre o desempenho e utilização da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Volte em breve para conferir as novidades!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
