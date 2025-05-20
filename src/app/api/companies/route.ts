
import { NextResponse, type NextRequest } from 'next/server';
import { createCompany, getCompanies } from '@/services/companyService';
import * as z from 'zod';

const companySchema = z.object({
  name: z.string().min(3, { message: 'Nome da empresa deve ter no mínimo 3 caracteres.' }),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX' }),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsedData = companySchema.safeParse(json);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input data', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, cnpj } = parsedData.data;
    const newCompany = await createCompany({ name, cnpj });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('API Error creating company:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    if (errorMessage.includes('Backend (Firebase) não está conectado')) {
      return NextResponse.json({ error: 'Service Unavailable: Backend not connected', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to create company', details: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const companies = await getCompanies();
    // Se o backend estiver desconectado, getCompanies retornará [], o que é um comportamento aceitável para GET.
    // Não precisamos de tratamento especial aqui, a menos que queiramos retornar um status diferente.
    return NextResponse.json(companies);
  } catch (error) {
    // Esta parte do catch pode não ser alcançada se getCompanies já tratar seus próprios erros e retornar [].
    console.error('API Error fetching companies:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to fetch companies', details: errorMessage }, { status: 500 });
  }
}
