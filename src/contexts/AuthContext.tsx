
'use client';

import type { User, Company, UserRole } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>; // Role é opcional agora para login principal
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nutritrack_user';
const COMPANY_STORAGE_KEY = 'nutritrack_company';

// Dados Mockados (simulação de backend)
const mockUsers: User[] = [
  { id: 'admin01', name: 'Admin Supremo', email: 'admin@nutritrack.com', role: 'administrador_supremo' as UserRole },
  { id: 'specialist01', name: 'Dr. Especialista', email: 'especialista@nutritrack.com', role: 'clinic_specialist' as UserRole, companyId: 'comp01', companyCnpj: '11.222.333/0001-44' },
  { id: 'patient01', name: 'Paciente Teste', email: 'patient@nutritrack.com', role: 'paciente' as UserRole, companyId: 'comp01' },
];

const mockCompanyDatabase: Record<string, Company> = {
  'comp01': { id: 'comp01', name: 'Clínica Saúde & Bem-Estar Mock', cnpj: '11.222.333/0001-44', nutritionistCount: 2, status: 'active', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
};

console.log("AuthContext: Definindo mockUsers e mockCompanyDatabase globalmente no módulo.");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCompanyData = useCallback((companyId: string) => {
    console.log("AuthContext: fetchCompanyData chamado para companyId:", companyId);
    const companyData = mockCompanyDatabase[companyId];
    if (companyData) {
      localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(companyData));
      setCompany(companyData);
      console.log("AuthContext: Dados da empresa carregados (mock):", companyData);
    } else {
      console.warn(`AuthContext: Empresa com ID ${companyId} não encontrada no mockCompanyDatabase.`);
      localStorage.removeItem(COMPANY_STORAGE_KEY);
      setCompany(null);
    }
  }, []);

  useEffect(() => {
    console.log("AuthContext: useEffect de inicialização disparado.");
    setLoading(true);
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("AuthContext: Usuário carregado do localStorage:", parsedUser);
        if (parsedUser.companyId) {
          fetchCompanyData(parsedUser.companyId);
        } else {
          setCompany(null);
          localStorage.removeItem(COMPANY_STORAGE_KEY);
        }
      } else {
        console.log("AuthContext: Nenhum usuário encontrado no localStorage.");
      }
    } catch (error) {
      console.error('AuthContext: Falha ao carregar dados do localStorage:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(COMPANY_STORAGE_KEY);
      setUser(null);
      setCompany(null);
    }
    setLoading(false);
    console.log("AuthContext: useEffect de inicialização concluído, loading:", false);
  }, [fetchCompanyData]);

  useEffect(() => {
    console.log("AuthContext: useEffect de verificação de usuário/rota disparado. Loading:", loading, "User:", user, "Pathname:", pathname);
    if (!loading && !user && !pathname.startsWith('/login')) {
      console.log("AuthContext: Usuário não logado e não está na página de login. Redirecionando para /login.");
      router.push('/login');
    } else if (!loading && user && pathname.startsWith('/login')) {
      // Se o usuário está logado e na página de login, redireciona para o dashboard apropriado
      console.log(`AuthContext: Usuário logado (${user.role}) na página de login. Redirecionando...`);
      if (user.role === 'administrador_supremo' as UserRole) router.push('/dashboard-geral');
      else if (user.role === 'clinic_specialist' as UserRole) router.push('/dashboard-especialista');
      else if (user.role === 'paciente' as UserRole) router.push('/inicio');
    }
  }, [user, loading, router, pathname]);

  const login = async (email: string, password: string, roleAttempt?: UserRole) => {
    console.log("AuthContext: Tentativa de login com email:", email, "roleAttempt:", roleAttempt);
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => { // Simula chamada de API
        const foundUser = mockUsers.find(
          u => u.email === email && (roleAttempt ? u.role === roleAttempt : true)
        );

        if (foundUser) {
          // No mock, vamos ignorar a senha por simplicidade de teste,
          // ou adicionar uma verificação simples se necessário: && password === 'password'
          console.log("AuthContext: Usuário mockado encontrado:", foundUser);
          const userToStore = { ...foundUser }; // Copia para evitar mutação direta do mock
          setUser(userToStore);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));

          if (userToStore.companyId) {
            fetchCompanyData(userToStore.companyId);
          } else {
            setCompany(null);
            localStorage.removeItem(COMPANY_STORAGE_KEY);
          }
          console.log("AuthContext: Login simulado bem-sucedido. User set:", userToStore);
          setLoading(false);
          resolve();
        } else {
          console.warn("AuthContext: Usuário mockado não encontrado ou papel incorreto para:", email, roleAttempt);
          setLoading(false);
          reject(new Error('Credenciais inválidas ou perfil não encontrado.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    console.log("AuthContext: Logout chamado.");
    setUser(null);
    setCompany(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(COMPANY_STORAGE_KEY);
    setLoading(false); // Garante que o loading é resetado
    router.push('/login'); // Redireciona para login após logout
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
