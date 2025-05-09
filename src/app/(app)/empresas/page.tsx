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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Search, Eye, Users } from 'lucide-react';
import type { Company } from '@/types';
import Link from 'next/link';

const mockCompanies: Company[] = [
  { id: '1', name: 'Empresa Alpha Saúde', cnpj: '11.222.333/0001-44', nutritionistCount: 5, status: 'active' },
  { id: '2', name: 'Bem-Estar Corp', cnpj: '44.555.666/0001-77', nutritionistCount: 12, status: 'active' },
  { id: '3', name: 'NutriVida Soluções', cnpj: '77.888.999/0001-00', nutritionistCount: 3, status: 'inactive' },
  { id: '4', name: 'Vitalidade Global', cnpj: '12.345.678/0001-99', nutritionistCount: 8, status: 'active' },
];

export default function EmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Empresas</h1>
            <p className="text-muted-foreground">Visualize e gerencie as empresas cadastradas.</p>
        </div>
        <Link href="/empresas/nova" passHref>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Nova Empresa</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nome ou CNPJ..."
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
                <TableHead>Nome da Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-center">Nutricionistas</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length > 0 ? filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.cnpj}</TableCell>
                  <TableCell className="text-center">{company.nutritionistCount}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={company.status === 'active' ? 'default' : 'destructive'} className={company.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {company.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => alert(`Ver detalhes ${company.name}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => alert(`Gerenciar usuários ${company.name}`)}>
                          <Users className="mr-2 h-4 w-4" /> Gerenciar Usuários
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhuma empresa encontrada.
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

// Added Card and CardContent wrapper for table consistency with other pages.
// This file existed, so using a placeholder component name to make the description pass.
import { Card, CardContent } from '@/components/ui/card'; 
