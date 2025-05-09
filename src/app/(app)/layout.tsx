import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/app-shell';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>
        {children}
      </AppShell>
    </AuthProvider>
  );
}
