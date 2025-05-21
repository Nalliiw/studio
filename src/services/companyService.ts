
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import type { Company } from '@/types';

const COMPANIES_COLLECTION = 'companies';

export async function createCompany(companyData: { name: string; cnpj: string }): Promise<Company> {
  if (!db) {
    const errorMessage = 'Firestore (db) não está inicializado. Verifique a configuração do Firebase e se o backend está conectado.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
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
    console.error('Erro ao criar empresa no Firestore:', error);
    if (error instanceof Error) {
        throw new Error(`Falha ao criar empresa: ${error.message}`);
    }
    throw new Error('Falha ao criar empresa.');
  }
}

export async function getCompanies(): Promise<Company[]> {
  if (!db) {
    console.warn('Firestore (db) não está inicializado. Retornando array vazio. Verifique a configuração do Firebase e se o backend está conectado.');
    // Lançar erro aqui também para ser pego pela API route, ou a API route deve checar se o array está vazio e inferir o problema.
    // Por consistência com createCompany, vamos lançar o erro.
    const errorMessage = 'Firestore (db) não está inicializado. Verifique a configuração do Firebase e se o backend está conectado.';
    console.error(errorMessage);
    throw new Error(errorMessage);
    // return []; // Alternativamente, retornar array vazio e a API lida com isso.
  }
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
    console.error('Erro ao buscar empresas do Firestore:', error);
    if (error instanceof Error) {
        throw new Error(`Falha ao buscar empresas: ${error.message}`);
    }
    throw new Error('Falha ao buscar empresas.');
  }
}
