
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { LogIn, Sun, Moon, UserCheck, Shield } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from '@/hooks/use-toast';

const loginUserSchema = z.object({
  email: z.string().email({ message: 'Endereço de email inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
  role: z.enum([UserRole.CLINIC_SPECIALIST, UserRole.PATIENT], { errorMap: () => ({ message: "Por favor, selecione um perfil."}) }),
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
      // role: undefined, // Deixe o usuário selecionar
    },
  });
  
  const onSubmit: SubmitHandler<LoginUserFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await authContext.login(data.email, data.password, data.role); // Passa o papel para o AuthContext simulado
      toast({ title: "Login bem-sucedido!"});
      // AuthContext (simulado) agora deve lidar com o redirecionamento
      // Com base no mockUser encontrado e seu papel.
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "Falha no login. Verifique suas credenciais.";
      // Exibe o erro em um campo ou toast geral
      form.setError("email", { type: "manual", message: errorMessage });
      form.setError("password", { type: "manual", message: " " }); // Para não repetir a msg
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
        <CardDescription>Faça login com seu perfil de Clínica ou Paciente.</CardDescription>
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
                  <FormLabel>Acessar como</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key={UserRole.CLINIC_SPECIALIST} value={UserRole.CLINIC_SPECIALIST}>Clínica</SelectItem>
                      <SelectItem key={UserRole.PATIENT} value={UserRole.PATIENT}>Paciente</SelectItem>
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
      <CardFooter className="flex flex-col items-center text-sm text-muted-foreground space-y-2 pt-6">
        <Link href="/login" passHref className="w-full">
            <Button variant="link" size="sm" className="w-full">
                <Shield className="mr-2 h-4 w-4" /> Acessar como Administrador Principal
            </Button>
        </Link>
         {/* O botão de cadastro foi removido conforme solicitado */}
         <p className="text-xs mt-2">Problemas para acessar? Contate o suporte.</p>
      </CardFooter>
    </Card>
  );
}
