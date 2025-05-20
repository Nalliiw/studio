import { AuthProvider } from '@/contexts/AuthContext';
// AppShell import removed as it's no longer used here

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* AppShell component removed. Children will now render directly. */}
      {children}
    </AuthProvider>
  );
}
