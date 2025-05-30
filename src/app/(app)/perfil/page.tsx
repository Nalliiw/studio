
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserCircle, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

export default function PerfilPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }
  
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  
  let roleName = "Desconhecido";
  if (user.role === UserRole.ADMIN_SUPREMO) {
    roleName = "Administrador Supremo";
  } else if (user.role === UserRole.CLINIC_SPECIALIST) {
    // Poderíamos ter uma lógica mais fina aqui se o TeamMember tivesse um "sub-role" (admin_clinica vs especialista_padrao)
    // Por ora, para um usuário logado como CLINIC_SPECIALIST, vamos assumir que ele é um "Usuário da Clínica"
    roleName = "Usuário da Clínica"; 
  } else if (user.role === UserRole.PATIENT) {
    roleName = "Paciente";
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Informações da sua conta.</p>
      </div>

      <Card className="shadow-md max-w-2xl mx-auto">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4 border-2 border-primary p-1">
            <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} alt={user.name || 'Avatar do Usuário'} data-ai-hint="profile photo large" />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{user.displayName || user.name}</CardTitle>
          <CardDescription className="text-base">{roleName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
            </div>
            {user.companyId && (
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">ID da Clínica/Empresa:</span>
                    <span className="font-medium">{user.companyId}</span>
                </div>
            )}
            <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ID do Usuário:</span>
                <span className="font-medium">{user.id}</span>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
