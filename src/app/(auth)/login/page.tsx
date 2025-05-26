
// src/app/(auth)/login/page.tsx
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
import { LogIn, Sun, Moon, ShieldCheck, UserCheck } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

const loginSchema = z.object({
  email: z.string().email({ message: 'Endereço de email inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }), // Firebase Auth might enforce min 6, but for mock, 1 is fine.
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const authContext = useAuth();
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
    try {
      // For mock login, we specify the role we are trying to log in as.
      // In a real Firebase Auth scenario, the role would be determined after successful auth.
      await authContext.login(data.email, data.password, UserRole.ADMIN_SUPREMO);
      toast({ title: "Login bem-sucedido!"});
      // AuthContext's useEffect will handle redirection based on the set user role
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "Falha no login. Verifique suas credenciais.";
      form.setError("email", { type: "manual", message: errorMessage });
      form.setError("password", { type: "manual", message: " " }); // Clearer to show error only on one field or use a general toast
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
            <ShieldCheck className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold">NutriTrack Lite</CardTitle>
        <CardDescription>Acesso Administrativo Principal.</CardDescription>
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
                    <Input placeholder="admin@nutritrack.com" {...field} />
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
        <Link href="/login-user" passHref className="w-full">
          <Button variant="secondary" className="w-full">
            <UserCheck className="mr-2 h-4 w-4" />
            Acessar como Especialista ou Paciente
          </Button>
        </Link>
        <p className="text-xs mt-2">Problemas para acessar? Contate o suporte.</p>
      </CardFooter>
    </Card>
  );
}
