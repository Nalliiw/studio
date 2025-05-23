
'use client';

import { useState, useEffect } from 'react';
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
import { MoreHorizontal, PlusCircle, Search, Eye, Users, AlertTriangle, Loader2 } from 'lucide-react';
import type { Company } from '@/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function EmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          let errorMessage = 'Falha ao buscar empresas.';
          try {
            const errorData = await response.json();
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch (e) {
            // Ignore if response is not JSON
          }
          throw new Error(errorMessage);
        }
        const data: Company[] = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
        setError(errorMessage);
        toast({
          title: "Erro ao Carregar Empresas",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
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
          aria-label="Buscar empresas"
        />
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Carregando empresas...
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-destructive">
              <AlertTriangle className="mr-2 h-8 w-8" />
              <p className="mt-2 text-lg">Erro ao carregar empresas:</p>
              <p className="text-sm">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead className="text-center">Especialistas</TableHead>
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
                          <Button variant="ghost" size="icon" aria-label={`Ações para ${company.name}`}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
