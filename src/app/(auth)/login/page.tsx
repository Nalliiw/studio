'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Please select a role."}) }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Mock users for demonstration
const mockUsers: Record<UserRole, User> = {
  [UserRole.ADMIN_SUPREMO]: { id: 'admin01', name: 'Admin Supremo', email: 'admin@nutritrack.com', role: UserRole.ADMIN_SUPREMO },
  [UserRole.NUTRITIONIST_WHITE_LABEL]: { id: 'nutri01', name: 'Dr. Nutri', email: 'nutri@nutritrack.com', role: UserRole.NUTRITIONIST_WHITE_LABEL, companyId: 'comp01' },
  [UserRole.PATIENT]: { id: 'patient01', name: 'Paciente Exemplo', email: 'patient@nutritrack.com', role: UserRole.PATIENT, companyId: 'comp01' },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userToLogin = mockUsers[data.role];
    
    if (userToLogin && userToLogin.email.split('@')[0] === data.email.split('@')[0]) { // Simple email prefix check for demo
      login(userToLogin); // Store user in context/localStorage

      // Redirect based on role
      switch (data.role) {
        case UserRole.ADMIN_SUPREMO:
          router.push('/dashboard-geral');
          break;
        case UserRole.NUTRITIONIST_WHITE_LABEL:
          router.push('/dashboard-nutricionista');
          break;
        case UserRole.PATIENT:
          router.push('/inicio');
          break;
        default:
          router.push('/login'); // Fallback
      }
    } else {
      form.setError("email", { type: "manual", message: "Invalid credentials for selected role."});
      form.setError("password", { type: "manual", message: " "}); // Clear password error if any
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M15.5 7.5c0-1.105-.895-2-2-2s-2 .895-2 2c0 1.105.895 2 2 2 .653 0 1.231-.316 1.601-.809l.007-.013c.055-.09.105-.184.149-.282.139-.31.243-.645.243-.996z"/><path d="M8.5 15c0-1.105.895-2 2-2s2 .895 2 2c0 1.105-.895 2-2 2s-2-.895-2-2z"/><path d="M12 12.5c-1.5 0-2.5 1-2.5 2.5S10.5 17.5 12 17.5s2.5-1 2.5-2.5S13.5 12.5 12 12.5zM12 9.5c-1.5 0-2.5-1-2.5-2.5S10.5 4.5 12 4.5s2.5 1 2.5 2.5S13.5 9.5 12 9.5z"/></svg>
        </div>
        <CardTitle className="text-3xl font-bold">NutriTrack Lite</CardTitle>
        <CardDescription>Bem-vindo! Faça login para continuar.</CardDescription>
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
                      <SelectItem value={UserRole.NUTRITIONIST_WHITE_LABEL}>Nutricionista</SelectItem>
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
      <CardFooter className="text-center text-sm text-muted-foreground">
        <p>Não tem uma conta? Entre em contato com o suporte.</p>
      </CardFooter>
    </Card>
  );
}
