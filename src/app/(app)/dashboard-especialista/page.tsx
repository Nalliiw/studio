
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ClipboardCheck, Library, PlusCircle, WorkflowIcon, UsersRound } from 'lucide-react'; // Adicionado UsersRound
import Link from 'next/link';
import { LineChart, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


const activePatientsData = [
  { date: '2024-01', count: 20 },
  { date: '2024-02', count: 25 },
  { date: '2024-03', count: 22 },
  { date: '2024-04', count: 30 },
  { date: '2024-05', count: 35 },
  { date: '2024-06', count: 40 },
];

const chartConfigActivePatients = {
  count: {
    label: "Pacientes Ativos",
    color: "hsl(var(--primary))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;


const formsData = [
  { name: 'Respondidos', value: 75, fill: 'hsl(var(--primary))' },
  { name: 'Pendentes', value: 25, fill: 'hsl(var(--muted))' },
];
const chartConfigForms = {
  value: {
    label: "Formulários",
  },
  Respondidos: {
    label: "Respondidos",
    color: "hsl(var(--primary))",
  },
  Pendentes: {
    label: "Pendentes",
    color: "hsl(var(--muted))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DashboardEspecialistaPage() {
  // Mock data
  const totalActivePatients = 40;
  const formsRespondedPercentage = 75;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4"> 
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel do Especialista</h1> 
            <p className="text-muted-foreground">Gerencie seus pacientes, fluxos, equipe e conteúdos.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4"> 
            <Link href="/pacientes/novo" passHref>
                <Button variant="default"><PlusCircle className="mr-2 h-4 w-4" /> Novo Paciente</Button>
            </Link>
            <Link href="/flowbuilder/novo" passHref>
                <Button variant="outline"><WorkflowIcon className="mr-2 h-4 w-4" /> Criar Fluxo</Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivePatients}</div>
            <p className="text-xs text-muted-foreground">+5 este mês</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulários Respondidos</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formsRespondedPercentage}%</div>
            <p className="text-xs text-muted-foreground">Taxa de resposta geral</p>
          </CardContent>
        </Card>
         <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros da Equipe</CardTitle>
            <UsersRound className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div> {/* Mock data */}
            <p className="text-xs text-muted-foreground">+1 esta semana</p>
            <Link href="/equipe" passHref className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full">
                    Gerenciar Equipe
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Evolução de Pacientes Ativos</CardTitle>
            <CardDescription>Número de pacientes ativos nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full p-0 pr-6">
            <ChartContainer config={chartConfigActivePatients} className="h-full w-full">
              <LineChart data={activePatientsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Status dos Formulários</CardTitle>
            <CardDescription>Distribuição de formulários respondidos e pendentes.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full p-0 flex items-center justify-center">
             <ChartContainer config={chartConfigForms} className="mx-auto aspect-square max-h-[220px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={formsData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                   {formsData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/biblioteca" passHref>
            <Button variant="outline" className="w-full md:w-auto"><Library className="mr-2 h-4 w-4" /> Acessar Biblioteca de Conteúdos</Button>
        </Link>
      </div>
    </div>
  );
}

