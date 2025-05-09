'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Search, Edit, History, Eye } from 'lucide-react';
import type { Patient } from '@/types';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

const mockPatients: Patient[] = [
  { id: 'p1', name: 'Ana Silva', email: 'ana.silva@example.com', lastAccess: '2024-05-20T10:00:00Z', companyId: 'c1', nutritionistId: 'n1' },
  { id: 'p2', name: 'Bruno Costa', email: 'bruno.costa@example.com', lastAccess: '2024-05-22T14:30:00Z', companyId: 'c1', nutritionistId: 'n1' },
  { id: 'p3', name: 'Carlos Lima', email: 'carlos.lima@example.com', lastAccess: '2024-05-18T09:15:00Z', companyId: 'c1', nutritionistId: 'n1' },
  { id: 'p4', name: 'Daniela Souza', email: 'daniela.souza@example.com', lastAccess: '2024-05-23T11:00:00Z', companyId: 'c1', nutritionistId: 'n1' },
];

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Pacientes</h1>
            <p className="text-muted-foreground">Visualize e gerencie seus pacientes.</p>
        </div>
        <Link href="/pacientes/novo" passHref>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Paciente</Button>
        </Link>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
            type="search"
            placeholder="Buscar por nome ou email..."
            className="pl-10 w-full md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${patient.id}/40/40`} alt={patient.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{patient.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {patient.name}
                    </div>
                  </TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{format(parseISO(patient.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => alert(`Ver perfil ${patient.name}`)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => alert(`Editar ${patient.name}`)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => alert(`Acessar histórico ${patient.name}`)}>
                            <History className="mr-2 h-4 w-4" /> Acessar Histórico
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
