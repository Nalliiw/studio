
// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, type User } from '@/types';
import { LogIn, Sun, Moon, ShieldCheck, UserCheck } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const loginSchema = z.object({
  email: z.string().email({ message: 'Endereço de email inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Por favor, selecione um perfil."}) }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const mockUsers: Record<UserRole, User> = {
  [UserRole.ADMIN_SUPREMO]: { id: 'admin01', name: 'Admin Supremo', email: 'admin@nutritrack.com', role: UserRole.ADMIN_SUPREMO },
  [UserRole.CLINIC_SPECIALIST]: { id: 'specialist01', name: 'Dr. Especialista Exemplo', email: 'especialista@nutritrack.com', role: UserRole.CLINIC_SPECIALIST, companyId: 'comp01' },
  [UserRole.PATIENT]: { id: 'patient01', name: 'Paciente Exemplo', email: 'patient@nutritrack.com', role: UserRole.PATIENT, companyId: 'comp01' },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const userToLogin = mockUsers[data.role];
    
    if (userToLogin && userToLogin.email.split('@')[0] === data.email.split('@')[0]) { 
      login(userToLogin);

      switch (data.role) {
        case UserRole.ADMIN_SUPREMO:
          router.push('/dashboard-geral');
          break;
        case UserRole.CLINIC_SPECIALIST:
        case UserRole.PATIENT:
          router.push('/login-user'); 
          break;
        default:
          router.push('/login'); 
      }
    } else {
      form.setError("email", { type: "manual", message: "Credenciais inválidas para o perfil selecionado."});
      form.setError("password", { type: "manual", message: " "}); 
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center relative">
         {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="absolute top-4 right-4"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit">
            <ShieldCheck className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold">NutriTrack Lite</CardTitle>
        <CardDescription>Bem-vindo! Faça login para continuar (Acesso Principal).</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seuemail@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN_SUPREMO}>Administrador Supremo</SelectItem>
                      <SelectItem value={UserRole.CLINIC_SPECIALIST}>Especialista (Clínica)</SelectItem>
                      <SelectItem value={UserRole.PATIENT}>Paciente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="animate-spin mr-2">◌</span>
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Entrar
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm text-muted-foreground space-y-2">
        <p>Não tem uma conta? Entre em contato com o suporte.</p>
        <Link href="/login-user" passHref>
          <Button variant="outline" className="w-full">
            <UserCheck className="mr-2 h-4 w-4" />
            Acessar como Especialista ou Paciente
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
