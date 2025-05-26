
// src/app/(auth)/login-user/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { LogIn, Sun, Moon, UserCheck, Shield } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from '@/hooks/use-toast';

// Schema updated to remove role - role will be determined by backend/mock based on email
const loginUserSchema = z.object({
  email: z.string().email({ message: 'Endereço de email inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type LoginUserFormValues = z.infer<typeof loginUserSchema>;

export default function LoginUserPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<LoginUserFormValues>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit: SubmitHandler<LoginUserFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Pass only email and password. AuthContext will find the user and their role from mockUsers.
      await authContext.login(data.email, data.password); 
      toast({ title: "Login bem-sucedido!"});
      // AuthContext (simulado) agora deve lidar com o redirecionamento
      // com base no mockUser encontrado e seu papel.
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "Falha no login. Verifique suas credenciais.";
      form.setError("email", { type: "manual", message: errorMessage });
      form.setError("password", { type: "manual", message: " " });
      toast({ title: "Erro no Login", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
            <UserCheck className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold">Acesso Clínica/Paciente</CardTitle>
        <CardDescription>Faça login com seu email e senha.</CardDescription>
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
            {/* Role Select component removed */}
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
      <CardFooter className="flex flex-col items-center text-sm text-muted-foreground space-y-2 pt-6">
        <Link href="/login" passHref className="w-full">
            <Button variant="link" size="sm" className="w-full">
                <Shield className="mr-2 h-4 w-4" /> Acessar como Administrador Principal
            </Button>
        </Link>
         <p className="text-xs mt-2">Problemas para acessar? Contate o suporte.</p>
      </CardFooter>
    </Card>
  );
}
