
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import type { Company } from '@/types';

const COMPANIES_COLLECTION = 'companies';

export async function createCompany(companyData: { name: string; cnpj: string }): Promise<Company> {
  if (!db) {
    console.error('Firestore (db) não está inicializado. Verifique a configuração do Firebase.');
    throw new Error('Serviço Indisponível: Backend não conectado.');
  }
  try {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
      createdAt: serverTimestamp(), // Use serverTimestamp para o Firebase definir a data/hora
    });
    return {
      id: docRef.id,
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
      // createdAt não é retornado diretamente aqui, pois é definido pelo servidor.
      // Se precisar dele no objeto retornado, você teria que buscar o documento novamente.
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
    console.warn('Firestore (db) não está inicializado. Retornando array vazio. Verifique a configuração do Firebase.');
    return [];
  }
  try {
    const querySnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
    const companies: Company[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Converta Timestamp do Firestore para string ISO se necessário, ou mantenha como Timestamp.
      // Para este exemplo, não estamos lidando com timestamps na interface Company.
      companies.push({
        id: doc.id,
        name: data.name,
        cnpj: data.cnpj,
        nutritionistCount: data.nutritionistCount,
        status: data.status,
      } as Company); // O 'as Company' pode precisar de mais cuidado com tipos
    });
    return companies;
  } catch (error) {
    console.error('Erro ao buscar empresas do Firestore:', error);
    return []; // Retorna array vazio em caso de erro para não quebrar o frontend
  }
}
