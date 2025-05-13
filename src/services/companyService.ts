
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import type { Company } from '@/types';

const COMPANIES_COLLECTION = 'companies';

export async function createCompany(companyData: { name: string; cnpj: string }): Promise<Company> {
  try {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
      createdAt: serverTimestamp(), // Optional: add a timestamp
    });
    return {
      id: docRef.id,
      ...companyData,
      nutritionistCount: 0,
      status: 'active',
    };
  } catch (error) {
    console.error('Error creating company:', error);
    throw new Error('Failed to create company.');
  }
}

export async function getCompanies(): Promise<Company[]> {
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
      } as Company); // Add type assertion if necessary, ensure data matches Company type
    });
    return companies;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies.');
  }
}
