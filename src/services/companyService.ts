
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import type { Company } from '@/types';

const COMPANIES_COLLECTION = 'companies';

const backendErrorMessage = 'Backend (Firebase) não está conectado. Funcionalidade desabilitada.';

export async function createCompany(companyData: { name: string; cnpj: string }): Promise<Company> {
  console.warn(`createCompany: ${backendErrorMessage}`);
  if (!db) {
    throw new Error(backendErrorMessage);
  }
  // O código abaixo não será executado se db for null, mas o mantemos para referência futura.
  try {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
    };
  } catch (error) {
    console.error('Error creating company (mesmo com db potencialmente conectado):', error);
    // Lançar o erro original ou um erro mais genérico
    if (error instanceof Error) {
        throw new Error(`Falha ao criar empresa: ${error.message}`);
    }
    throw new Error('Falha ao criar empresa.');
  }
}

export async function getCompanies(): Promise<Company[]> {
  if (!db) {
    console.warn(`getCompanies: ${backendErrorMessage} Retornando array vazio.`);
    return [];
  }
  // O código abaixo não será executado se db for null, mas o mantemos para referência futura.
  try {
    const querySnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
    const companies: Company[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      companies.push({
        id: doc.id,
        name: data.name,
        cnpj: data.cnpj,
        nutritionistCount: data.nutritionistCount,
        status: data.status,
      } as Company);
    });
    return companies;
  } catch (error) {
    console.error('Error fetching companies (mesmo com db potencialmente conectado):', error);
    // Retornar array vazio em caso de erro para não quebrar o frontend que espera uma lista
    return [];
  }
}
