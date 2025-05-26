
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Building, Users, Activity, PlusCircle, Filter } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Company } from '@/types';

const engagementData = [
  { month: 'Jan', responses: 400, target: 500 },
  { month: 'Feb', responses: 300, target: 500 },
  { month: 'Mar', responses: 600, target: 500 },
  { month: 'Apr', responses: 280, target: 500 },
  { month: 'May', responses: 500, target: 500 },
  { month: 'Jun', responses: 450, target: 500 },
];

const chartConfig = {
  responses: {
    label: "Respostas",
    color: "hsl(var(--primary))",
  },
  target: {
    label: "Meta",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;

// Mock companies for filter demonstration
const mockCompaniesForFilter: Pick<Company, 'id' | 'name'>[] = [
  { id: 'comp01', name: 'Clínica Saúde & Bem-Estar Mock' },
  { id: 'comp02', name: 'NutriVida Consultoria' },
  { id: 'comp03', name: 'Performance Nutricional Avançada' },
];

export default function DashboardGeralPage() {
  // Mock data
  const activeCompanies = 15;
  const activeNutritionists = 75;
  const activePatients = 1250;

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Geral</h1>
          <p className="text-muted-foreground">Visão geral do sistema NutriTrack Lite.</p>
        </div>
        <div className="flex items-center gap-2">
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
            <Link href="/empresas/nova" passHref>
                <Button variant="outline" className="shrink-0"><PlusCircle className="mr-2 h-4 w-4" /> Criar Empresa</Button>
            </Link>
        </div>
      </div>
       <CardDescription className="text-sm">
        Exibindo dados para: <span className="font-semibold">{getSelectedCompanyName()}</span>.
        {selectedCompanyId && " (Os gráficos e totais abaixo ainda são dados gerais do sistema)"}
      </CardDescription>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompanies}</div>
            <p className="text-xs text-muted-foreground">+2 desde o último mês</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialistas Ativos</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNutritionists}</div>
            <p className="text-xs text-muted-foreground">+5 desde o último mês</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatients}</div>
            <p className="text-xs text-muted-foreground">+50 desde o último mês</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Taxa de Engajamento (Formulários)</CardTitle>
          <CardDescription>Respostas de formulários nos últimos 6 meses.</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] w-full p-0 pr-6">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <RechartsBarChart data={engagementData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="responses" fill="var(--color-responses)" radius={4} />
              <Bar dataKey="target" fill="var(--color-target)" radius={4} />
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4 mt-6">
        <Link href="/empresas" passHref>
            <Button variant="default"><Building className="mr-2 h-4 w-4" /> Ver Empresas</Button>
        </Link>
        <Link href="/relatorios-gerais" passHref>
            <Button variant="outline"><BarChart className="mr-2 h-4 w-4" /> Ver Relatórios</Button>
        </Link>
      </div>
    </div>
  );
}
