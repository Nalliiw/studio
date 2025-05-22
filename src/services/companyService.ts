
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import type { Company } from '@/types';

const COMPANIES_COLLECTION = 'companies';
const FIRESTORE_UNINITIALIZED_ERROR = 'Firestore (db) não está inicializado. Verifique a configuração do Firebase e se o backend está conectado.';


export async function createCompany(companyData: { name: string; cnpj: string }): Promise<Company> {
  if (!db) {
    console.error("companyService.createCompany:", FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  console.log("companyService.createCompany - Chamado com:", companyData);
  try {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });
    console.log("companyService.createCompany - Empresa criada com ID:", docRef.id);
    return {
      id: docRef.id,
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
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
    console.error("companyService.getCompanies:", FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  console.log("companyService.getCompanies - Chamado.");
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
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastModified: data.lastModified instanceof Timestamp ? data.lastModified.toDate().toISOString() : data.lastModified,
      } as Company);
    });
    console.log("companyService.getCompanies - Empresas encontradas:", companies.length);
    return companies;
  } catch (error) {
    console.error('Erro ao buscar empresas do Firestore:', error);
    if (error instanceof Error) {
        throw new Error(`Falha ao buscar empresas: ${error.message}`);
    }
    throw new Error('Falha ao buscar empresas.');
  }
}

export async function getCompanyById(companyId: string): Promise<Company | null> {
  if (!db) {
    console.error(`companyService.getCompanyById (${companyId}):`, FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  console.log(`companyService: Tentando buscar empresa com ID: ${companyId}`);
  try {
    const companyDocRef = doc(db, COMPANIES_COLLECTION, companyId);
    const companySnap = await getDoc(companyDocRef);
    if (companySnap.exists()) {
      const data = companySnap.data();
      console.log(`companyService: Empresa encontrada:`, data);
      return {
        id: companySnap.id,
        name: data.name,
        cnpj: data.cnpj,
        nutritionistCount: data.nutritionistCount,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastModified: data.lastModified instanceof Timestamp ? data.lastModified.toDate().toISOString() : data.lastModified,
      } as Company;
    } else {
      console.warn(`companyService: Nenhuma empresa encontrada com o ID: ${companyId}`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar empresa por ID (${companyId}) no Firestore:`, error);
    if (error instanceof Error) {
      throw new Error(`Falha ao buscar empresa por ID: ${error.message}`);
    }
    throw new Error('Falha ao buscar empresa por ID.');
  }
}

export async function updateCompany(companyId: string, data: { name: string; cnpj?: string }): Promise<void> {
  if (!db) {
    console.error(`companyService.updateCompany (${companyId}):`, FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    console.log(`companyService: Tentando atualizar/criar empresa com ID: ${companyId}, Dados:`, data);
    const companyDocRef = doc(db, COMPANIES_COLLECTION, companyId);
    const docSnap = await getDoc(companyDocRef);

    if (!docSnap.exists()) {
      // Document doesn't exist, create it.
      if (!data.cnpj) {
        console.error("companyService.updateCompany - Tentativa de criar empresa sem CNPJ. ID:", companyId, "Dados:", data);
        throw new Error("CNPJ é obrigatório para criar uma nova clínica.");
      }
      await setDoc(companyDocRef, {
        name: data.name,
        cnpj: data.cnpj,
        nutritionistCount: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
      });
      console.log(`companyService: Empresa ${companyId} CRIADA com sucesso.`);
    } else {
      // Document exists, update it.
      await updateDoc(companyDocRef, {
        name: data.name,
        lastModified: serverTimestamp(),
      });
      console.log(`companyService: Empresa ${companyId} ATUALIZADA com sucesso.`);
    }
  } catch (error) {
    console.error(`Erro ao atualizar/criar empresa (${companyId}) no Firestore:`, error);
    if (error instanceof Error) {
      throw new Error(`Falha ao atualizar empresa: ${error.message}`);
    }
    throw new Error('Falha ao atualizar empresa.');
  }
}
