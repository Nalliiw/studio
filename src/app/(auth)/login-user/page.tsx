
// src/app/(auth)/login-user/page.tsx
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
import { LogIn, Sun, Moon, UserCheck } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const loginUserSchema = z.object({
  email: z.string().email({ message: 'Endereço de email inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  role: z.enum([UserRole.CLINIC_SPECIALIST, UserRole.PATIENT], { errorMap: () => ({ message: "Por favor, selecione um perfil."}) }),
});

type LoginUserFormValues = z.infer<typeof loginUserSchema>;

// Mock users for demonstration (excluding Admin Supremo)
const mockUsers: Partial<Record<UserRole, User>> = {
  [UserRole.CLINIC_SPECIALIST]: { id: 'specialist01', name: 'Dr. Especialista Exemplo', email: 'especialista@nutritrack.com', role: UserRole.CLINIC_SPECIALIST, companyId: 'comp01' },
  [UserRole.PATIENT]: { id: 'patient01', name: 'Paciente Exemplo', email: 'patient@nutritrack.com', role: UserRole.PATIENT, companyId: 'comp01' },
};

export default function LoginUserPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit: SubmitHandler<LoginUserFormValues> = async (data) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const userToLogin = mockUsers[data.role];
    
    if (userToLogin && userToLogin.email?.split('@')[0] === data.email.split('@')[0]) {
      login(userToLogin as User); 

      switch (data.role) {
        case UserRole.CLINIC_SPECIALIST:
          router.push('/dashboard-especialista'); // Rota atualizada
          break;
        case UserRole.PATIENT:
          router.push('/inicio');
          break;
        default:
          router.push('/login-user'); 
      }
    } else {
      form.setError("email", { type: "manual", message: "Credenciais inválidas para o perfil selecionado."});
      form.setError("password", { type: "manual", message: " "}); 
    }
    setIsLoading(false);
  };

  const form = useForm<LoginUserFormValues>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

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
            <UserCheck className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold">Acesso Especialista/Paciente</CardTitle>
        <CardDescription>Faça login com seu perfil de especialista ou paciente.</CardDescription>
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
        <p>Problemas para acessar? Entre em contato com o suporte.</p>
        <Link href="/login" passHref>
            <Button variant="link" size="sm">Acessar como Administrador</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
