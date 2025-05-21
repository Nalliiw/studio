
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Building, Users, Activity, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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


export default function DashboardGeralPage() {
  // Mock data
  const activeCompanies = 15;
  const activeNutritionists = 75;
  const activePatients = 1250;

  return (
    <div className="space-y-4"> {/* Reduced from space-y-6 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Geral</h1>
          <p className="text-muted-foreground">Visão geral do sistema NutriTrack Lite.</p>
        </div>
        <div className="space-x-2">
            <Link href="/empresas/nova" passHref>
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Criar Empresa</Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Reduced gap from gap-6 */}
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
            <CardTitle className="text-sm font-medium">Nutricionistas Ativos</CardTitle>
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
        <CardContent className="h-[300px] w-full p-0 pr-6"> {/* Reduced height from h-[350px] */}
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
      
      <div className="flex space-x-4">
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
