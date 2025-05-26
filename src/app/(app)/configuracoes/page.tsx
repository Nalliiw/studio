// src/app/(app)/configuracoes/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, UploadCloud, ImageIcon, Palette } from 'lucide-react'; // Added Palette for branding section
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ConfiguracoesPage() {
  const { user } = useAuth();

  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [appLogoFile, setAppLogoFile] = useState<File | null>(null);
  const [appLogoPreview, setAppLogoPreview] = useState<string | null>(null);
  const [pwaIconFile, setPwaIconFile] = useState<File | null>(null);
  const [pwaIconPreview, setPwaIconPreview] = useState<string | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSimulatedUpload = (fileName: string | undefined, assetType: string) => {
    if (!fileName) {
        toast({ title: "Nenhum arquivo selecionado", description: `Por favor, selecione um arquivo para o ${assetType}.`, variant: "destructive"});
        return;
    }
    toast({
      title: `${assetType} Enviado (Simulação)`,
      description: `O arquivo "${fileName}" foi processado (simulação).`,
    });
    // Reset state after simulated upload if needed
    if (assetType === 'Favicon') { setFaviconFile(null); setFaviconPreview(null); }
    if (assetType === 'Logo da Aplicação') { setAppLogoFile(null); setAppLogoPreview(null); }
    if (assetType === 'Ícone PWA') { setPwaIconFile(null); setPwaIconPreview(null); }
    const fileInput = document.getElementById(assetType.toLowerCase().replace(/ /g, '-')) as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta e preferências.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            Preferências da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userName">Nome</Label>
            <Input id="userName" defaultValue={user?.name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email</Label>
            <Input id="userEmail" type="email" defaultValue={user?.email || ''} disabled />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-base">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber atualizações importantes e lembretes por email.
              </p>
            </div>
            <Switch id="notifications" aria-label="Ativar notificações por email" />
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode" className="text-base">Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">
                Alternar para o tema escuro da aplicação. (Funcionalidade em desenvolvimento)
              </p>
            </div>
            <Switch id="darkMode" aria-label="Ativar modo escuro" disabled />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={() => toast({title: "Simulação", description: "Configurações da conta salvas (simulação)." })}>
            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
          </Button>
        </CardFooter>
      </Card>

      {user?.role === UserRole.ADMIN_SUPREMO && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-6 w-6 text-primary" /> 
              Branding da Aplicação
            </CardTitle>
            <CardDescription>
              Gerencie o favicon, logo principal e ícone PWA da aplicação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Favicon Section */}
            <div className="space-y-3 p-4 border rounded-md">
              <Label htmlFor="favicon-upload" className="text-lg font-medium">Favicon do Aplicativo</Label>
              <p className="text-xs text-muted-foreground">Formatos recomendados: .ico, .png, .svg. Tamanho ideal: 32x32 ou 16x16.</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {faviconPreview ? (
                  <Image src={faviconPreview} alt="Prévia do Favicon" width={32} height={32} className="rounded border" data-ai-hint="favicon preview" />
                ) : (
                  <div className="h-8 w-8 bg-muted rounded border flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-4 w-4 opacity-50" />
                  </div>
                )}
                <Input
                  id="favicon-upload"
                  type="file"
                  accept=".ico,.png,.svg"
                  onChange={(e) => handleFileChange(e, setFaviconFile, setFaviconPreview)}
                  className="max-w-xs"
                />
              </div>
              <Button size="sm" onClick={() => handleSimulatedUpload(faviconFile?.name, 'Favicon')}>
                <UploadCloud className="mr-2 h-4 w-4" /> Salvar Favicon
              </Button>
            </div>

            {/* App Logo Section */}
            <div className="space-y-3 p-4 border rounded-md">
              <Label htmlFor="app-logo-upload" className="text-lg font-medium">Logo Principal da Aplicação</Label>
              <p className="text-xs text-muted-foreground">Formatos recomendados: .png, .svg, .jpg. Idealmente com fundo transparente se PNG/SVG.</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {appLogoPreview ? (
                  <Image src={appLogoPreview} alt="Prévia do Logo" width={100} height={40} className="rounded border object-contain bg-muted p-1" data-ai-hint="app logo" />
                ) : (
                  <div className="h-10 w-24 bg-muted rounded border flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6 opacity-50" />
                  </div>
                )}
                <Input
                  id="app-logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleFileChange(e, setAppLogoFile, setAppLogoPreview)}
                  className="max-w-xs"
                />
              </div>
              <Button size="sm" onClick={() => handleSimulatedUpload(appLogoFile?.name, 'Logo da Aplicação')}>
                <UploadCloud className="mr-2 h-4 w-4" /> Salvar Logo Principal
              </Button>
            </div>

            {/* PWA Icon Section */}
            <div className="space-y-3 p-4 border rounded-md">
              <Label htmlFor="pwa-icon-upload" className="text-lg font-medium">Ícone PWA</Label>
              <p className="text-xs text-muted-foreground">Formato recomendado: .png. Tamanhos comuns: 192x192, 512x512.</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {pwaIconPreview ? (
                  <Image src={pwaIconPreview} alt="Prévia do Ícone PWA" width={64} height={64} className="rounded border" data-ai-hint="pwa icon" />
                ) : (
                  <div className="h-16 w-16 bg-muted rounded border flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-50" />
                  </div>
                )}
                <Input
                  id="pwa-icon-upload"
                  type="file"
                  accept="image/png"
                  onChange={(e) => handleFileChange(e, setPwaIconFile, setPwaIconPreview)}
                  className="max-w-xs"
                />
              </div>
              <Button size="sm" onClick={() => handleSimulatedUpload(pwaIconFile?.name, 'Ícone PWA')}>
                <UploadCloud className="mr-2 h-4 w-4" /> Salvar Ícone PWA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
