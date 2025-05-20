import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/app-shell'; // Restaurar a importação

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell> {/* Restaurar o uso do AppShell */}
    </AuthProvider>
  );
}
