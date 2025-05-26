
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Filter } from 'lucide-react';
import type { Company } from '@/types';

// Mock companies for filter demonstration
const mockCompaniesForFilter: Pick<Company, 'id' | 'name'>[] = [
  { id: 'comp01', name: 'Clínica Saúde & Bem-Estar Mock' },
  { id: 'comp02', name: 'NutriVida Consultoria' },
  { id: 'comp03', name: 'Performance Nutricional Avançada' },
];


export default function RelatoriosGeraisPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const handleCompanyFilterChange = (companyId: string) => {
    if (companyId === 'all') {
      setSelectedCompanyId(null);
    } else {
      setSelectedCompanyId(companyId);
    }
  };

  const getSelectedCompanyName = () => {
    if (!selectedCompanyId) return "Todas as Empresas";
    return mockCompaniesForFilter.find(c => c.id === selectedCompanyId)?.name || "Empresa Desconhecida";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Gerais</h1>
          <p className="text-muted-foreground">Análises e dados consolidados do sistema.</p>
        </div>
        <div className="min-w-[200px]">
            <Select onValueChange={handleCompanyFilterChange} defaultValue="all">
            <SelectTrigger className="w-full sm:w-auto" aria-label="Filtrar por empresa">
                <Filter className="h-4 w-4 mr-2 opacity-50" />
                <SelectValue placeholder="Filtrar por empresa..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas as Empresas</SelectItem>
                {mockCompaniesForFilter.map(company => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>
      <CardDescription className="text-sm">
        Exibindo relatórios para: <span className="font-semibold">{getSelectedCompanyName()}</span>.
      </CardDescription>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Relatórios Detalhados
          </CardTitle>
          <CardDescription>
            Esta seção está em desenvolvimento. Em breve, você poderá acessar relatórios completos sobre o desempenho e utilização da plataforma {selectedCompanyId ? `para ${getSelectedCompanyName()}` : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Volte em breve para conferir as novidades! Os dados exibidos aqui serão filtrados pela empresa selecionada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
