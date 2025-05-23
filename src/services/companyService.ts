// src/services/companyService.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import type { Company } from '@/types';

const COMPANIES_COLLECTION = 'companies';
const FIRESTORE_UNINITIALIZED_ERROR = 'Firestore (db) não está inicializado. Verifique a configuração do Firebase e se o backend está conectado.';


export async function createCompany(companyData: { name: string; cnpj: string }): Promise<Company> {
  console.log("companyService.createCompany - Chamado com:", companyData);
  if (!db) {
    console.error("companyService.createCompany:", FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...companyData,
      nutritionistCount: 0,
      status: 'active', // Default status
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });
    console.log("companyService.createCompany - Empresa criada com ID:", docRef.id);
    return {
      id: docRef.id,
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(), // Approximate for immediate return
      lastModified: new Date().toISOString(), // Approximate for immediate return
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
  console.log("companyService.getCompanies - Chamado.");
  if (!db) {
    console.error("companyService.getCompanies:", FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
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
        logoUrl: data.logoUrl,
        nutritionistCount: data.nutritionistCount || 0,
        status: data.status || 'active',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastModified: data.lastModified instanceof Timestamp ? data.lastModified.toDate().toISOString() : data.lastModified,
      });
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
  console.log(`companyService.getCompanyById - Chamado com ID: ${companyId}`);
  if (!db) {
    console.error(`companyService.getCompanyById (${companyId}):`, FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const companyDocRef = doc(db, COMPANIES_COLLECTION, companyId);
    const companySnap = await getDoc(companyDocRef);
    if (companySnap.exists()) {
      const data = companySnap.data();
      console.log(`companyService.getCompanyById: Empresa ${companyId} encontrada:`, data);
      return {
        id: companySnap.id,
        name: data.name,
        cnpj: data.cnpj,
        logoUrl: data.logoUrl,
        nutritionistCount: data.nutritionistCount || 0,
        status: data.status || 'active',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastModified: data.lastModified instanceof Timestamp ? data.lastModified.toDate().toISOString() : data.lastModified,
      };
    } else {
      console.warn(`companyService.getCompanyById: Nenhuma empresa encontrada com o ID: ${companyId}`);
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

// Partial type for updates, Omit 'id' and 'createdAt' as they shouldn't be directly updatable this way
type CompanyUpdateData = Partial<Omit<Company, 'id' | 'createdAt'>>;

export async function updateCompany(companyId: string, data: CompanyUpdateData): Promise<void> {
  console.log(`companyService.updateCompany - Chamado para ID: ${companyId} com dados:`, data);
  if (!db) {
    console.error(`companyService.updateCompany (${companyId}):`, FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const companyDocRef = doc(db, COMPANIES_COLLECTION, companyId);
    const docSnap = await getDoc(companyDocRef);

    const updatePayload: any = { ...data, lastModified: serverTimestamp() };

    if (!docSnap.exists()) {
      // Document doesn't exist, create it (upsert behavior).
      // Ensure required fields for creation are present, especially CNPJ if it's a rule.
      if (!data.name || !data.cnpj) { // Basic check, adjust if CNPJ isn't always sent or is optional on create
        const errorMsg = "Nome e CNPJ são obrigatórios para criar uma nova clínica.";
        console.error(`companyService.updateCompany - Tentativa de criar empresa ${companyId} sem nome ou CNPJ. Dados:`, data);
        throw new Error(errorMsg);
      }
      console.log(`companyService.updateCompany: Empresa ${companyId} não encontrada. Criando novo documento...`);
      await setDoc(companyDocRef, {
        ...updatePayload, // Includes name, cnpj, logoUrl (if provided)
        nutritionistCount: data.nutritionistCount || 0,
        status: data.status || 'active',
        createdAt: serverTimestamp(), // Set createdAt only on creation
      });
      console.log(`companyService.updateCompany: Empresa ${companyId} CRIADA com sucesso.`);
    } else {
      // Document exists, update it.
      // Remove cnpj from updatePayload if it's not meant to be updatable after creation.
      // If cnpj is updatable, keep it. For now, let's assume it's not updatable here.
      if (updatePayload.cnpj) delete updatePayload.cnpj;

      console.log(`companyService.updateCompany: Empresa ${companyId} encontrada. Atualizando documento...`);
      await updateDoc(companyDocRef, updatePayload);
      console.log(`companyService.updateCompany: Empresa ${companyId} ATUALIZADA com sucesso.`);
    }
  } catch (error) {
    console.error(`Erro ao atualizar/criar empresa (${companyId}) no Firestore:`, error);
    if (error instanceof Error) {
      throw new Error(`Falha ao atualizar empresa: ${error.message}`);
    }
    throw new Error('Falha ao atualizar empresa.');
  }
}