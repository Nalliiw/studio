
'use client';

import type { User, Company } from '@/types'; // Added Company
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  company: Company | null; // Added company state
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nutritrack_user';
const COMPANY_STORAGE_KEY = 'nutritrack_company'; // For caching company data

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null); // Initialize company state
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCompanyData = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const companyData: Company = await response.json();
        localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(companyData));
        setCompany(companyData);
      } else {
        console.warn(`Failed to fetch company data for ${companyId}, status: ${response.status}`);
        localStorage.removeItem(COMPANY_STORAGE_KEY);
        setCompany(null);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      localStorage.removeItem(COMPANY_STORAGE_KEY);
      setCompany(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    let initialUser: User | null = null;
    let initialCompany: Company | null = null;

    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        initialUser = JSON.parse(storedUser);
        setUser(initialUser);
      }
      const storedCompany = localStorage.getItem(COMPANY_STORAGE_KEY);
      if (storedCompany) {
        initialCompany = JSON.parse(storedCompany);
        // Validate if stored company still belongs to the current user
        if (initialUser && initialCompany && initialUser.companyId === initialCompany.id) {
            setCompany(initialCompany);
        } else {
            localStorage.removeItem(COMPANY_STORAGE_KEY); // Clear if inconsistent
        }
      }
    } catch (error) {
      console.error('Failed to parse data from localStorage:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(COMPANY_STORAGE_KEY);
    }

    // If company data wasn't loaded from cache but user has companyId, fetch it
    if (initialUser?.companyId && !initialCompany) {
      fetchCompanyData(initialUser.companyId);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  const login = async (userData: User) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    if (userData.companyId) {
      await fetchCompanyData(userData.companyId); // Fetch company data on login
    } else {
      localStorage.removeItem(COMPANY_STORAGE_KEY);
      setCompany(null); // Clear company data if user has no companyId
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(COMPANY_STORAGE_KEY); // Clear company data on logout
    setUser(null);
    setCompany(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
