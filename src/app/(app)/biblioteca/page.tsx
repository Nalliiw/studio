'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Library, Upload, PlusCircle, Edit, Trash2, Film, FileAudio, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Content } from '@/types';

const mockContent: Content[] = [
  { id: 'c1', type: 'video', title: 'Guia de Alimentação Saudável', url: '#', category: 'Nutrição Geral', nutritionistId: 'n1' },
  { id: 'c2', type: 'pdf', title: 'Receitas Low Carb (eBook)', url: '#', category: 'Receitas', nutritionistId: 'n1' },
  { id: 'c3', type: 'audio', title: 'Meditação para Ansiedade Alimentar', url: '#', category: 'Mindfulness', nutritionistId: 'n1' },
];


export default function BibliotecaPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<'video' | 'audio' | 'pdf' | ''>('');
  const [contents, setContents] = useState<Content[]>(mockContent);


  const handleFileUpload = async () => {
    if (!title || !category || !file || !contentType) {
      toast({ title: "Erro", description: "Todos os campos são obrigatórios.", variant: "destructive" });
      return;
    }
    console.log('Uploading file:', { title, category, fileName: file.name, contentType });
    // Simulate API call & add to list
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newContent: Content = {
      id: Date.now().toString(),
      title,
      category,
      type: contentType,
      url: URL.createObjectURL(file), // Placeholder URL
      nutritionistId: 'current_nutri_id' // Replace with actual ID
    };
    setContents(prev => [newContent, ...prev]);
    toast({
      title: "Conteúdo Enviado!",
      description: `O arquivo "${title}" foi adicionado à biblioteca.`,
    });
    // Reset form
    setTitle('');
    setCategory('');
    setFile(null);
    setContentType('');
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getIconForType = (type: Content['type']) => {
    switch (type) {
      case 'video': return <Film className="h-5 w-5 text-red-500" />;
      case 'audio': return <FileAudio className="h-5 w-5 text-blue-500" />;
      case 'pdf': return <FileText className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Conteúdos</h1>
        <p className="text-muted-foreground">Faça upload e organize seus materiais (vídeos, áudios, PDFs).</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-6 w-6 text-primary" />
            Upload de Novo Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contentTitle">Título do Conteúdo</Label>
            <Input id="contentTitle" placeholder="Ex: 5 Dicas para um Café da Manhã Saudável" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentCategory">Categoria</Label>
            <Input id="contentCategory" placeholder="Ex: Nutrição Esportiva, Receitas" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentType">Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={(value: Content['type']) => setContentType(value)}>
                <SelectTrigger id="contentType">
                    <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="audio">Áudio</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fileUpload">Arquivo</Label>
            <Input id="fileUpload" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleFileUpload}>
            <PlusCircle className="mr-2 h-4 w-4" /> Enviar para Biblioteca
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Conteúdos Enviados</CardTitle>
            <CardDescription>Gerencie os materiais da sua biblioteca.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contents.length > 0 ? contents.map(content => (
                        <TableRow key={content.id}>
                            <TableCell>{getIconForType(content.type)}</TableCell>
                            <TableCell className="font-medium">{content.title}</TableCell>
                            <TableCell>{content.category}</TableCell>
                            <TableCell className="text-right space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => alert(`Editar ${content.title}`)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setContents(prev => prev.filter(c => c.id !== content.id))}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Nenhum conteúdo na biblioteca ainda.
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
