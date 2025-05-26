
// src/app/(app)/central-ajuda/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HelpCircle, PlusCircle, Search, Edit, Trash2, MoreHorizontal, FileText, Video, Link as LinkIcon, Users, Building, Headset } from 'lucide-react';
import type { HelpMaterial, HelpMaterialType, HelpMaterialAudience } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const mockHelpMaterials: HelpMaterial[] = [
  { id: 'hm1', title: 'Como resetar minha senha?', type: 'faq', content: 'Para resetar sua senha, vá para a página de login e clique em "Esqueci minha senha".', audience: ['patient', 'clinic'], category: 'Conta', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'hm2', title: 'Guia de Introdução para Clínicas', type: 'pdf', content: '/docs/guia-clinicas.pdf', audience: ['clinic'], category: 'Primeiros Passos', createdAt: '2024-01-15T14:00:00Z' },
  { id: 'hm3', title: 'Vídeo Tutorial: Usando o FlowBuilder', type: 'video', content: 'https://youtube.com/watch?v=example', audience: ['clinic', 'support'], category: 'Funcionalidades', createdAt: '2024-02-01T11:00:00Z' },
  { id: 'hm4', title: 'Como contatar o Suporte Técnico', type: 'faq', content: 'Você pode contatar o suporte técnico através do email suporte@nutritrack.com ou pelo chat em nossa plataforma.', audience: ['patient', 'clinic', 'support'], category: 'Suporte', createdAt: '2023-12-20T09:00:00Z' },
  { id: 'hm5', title: 'Documentação da API (Link Externo)', type: 'external_link', content: 'https://docs.nutritrack.com/api', audience: ['support'], category: 'Desenvolvedores', createdAt: '2024-03-01T16:00:00Z' },
];

const TypeIcon = ({ type }: { type: HelpMaterialType }) => {
  if (type === 'faq') return <HelpCircle className="h-5 w-5 text-blue-500" />;
  if (type === 'pdf' || type === 'document') return <FileText className="h-5 w-5 text-green-500" />;
  if (type === 'video') return <Video className="h-5 w-5 text-red-500" />;
  if (type === 'external_link') return <LinkIcon className="h-5 w-5 text-purple-500" />;
  return <FileText className="h-5 w-5" />;
};

const getAudienceLabel = (audience: HelpMaterialAudience): string => {
  switch (audience) {
    case 'support': return 'Suporte';
    case 'clinic': return 'Clínica';
    case 'patient': return 'Paciente';
    default: return '';
  }
};

const getAudienceBadgeVariant = (audience: HelpMaterialAudience) => {
  switch (audience) {
    case 'support': return 'secondary';
    case 'clinic': return 'default';
    case 'patient': return 'outline';
    default: return 'outline';
  }
};


export default function CentralAjudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Em um app real, materials viria de um estado gerenciado por fetch/API
  const materials = mockHelpMaterials;

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <HelpCircle className="mr-3 h-8 w-8 text-primary" />
            Gerenciamento da Central de Ajuda
          </h1>
          <p className="text-muted-foreground">Adicione, edite e organize os materiais de suporte.</p>
        </div>
        <Link href="/central-ajuda/novo" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Material
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar materiais por título, tipo ou categoria..."
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar materiais de ajuda"
        />
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Materiais Cadastrados</CardTitle>
            <CardDescription>
                {filteredMaterials.length > 0 
                    ? `Exibindo ${filteredMaterials.length} de ${materials.length} material(is).`
                    : "Nenhum material encontrado para os filtros aplicados."}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Público-Alvo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.length > 0 ? filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell><TypeIcon type={material.type} /></TableCell>
                  <TableCell className="font-medium">{material.title}</TableCell>
                  <TableCell>{material.category || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {material.audience.map(aud => (
                        <Badge key={aud} variant={getAudienceBadgeVariant(aud)} className="text-xs">
                          {getAudienceLabel(aud)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Ações para ${material.title}`}>
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => alert(`Editar ${material.title} (ID: ${material.id})`)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => alert(`Excluir ${material.title} (ID: ${material.id})`)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhum material cadastrado ainda ou correspondente à busca.
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
