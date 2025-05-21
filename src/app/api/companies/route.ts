
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
      return NextResponse.json({ error: 'Dados de entrada inválidos', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, cnpj } = parsedData.data;
    const newCompany = await createCompany({ name, cnpj });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('API Error creating company:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    // Verifica se a mensagem de erro indica que o Firestore não está inicializado
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado ou configurado corretamente.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao criar empresa.', details: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const companies = await getCompanies();
    // Se getCompanies retornar um array vazio (pode ser por erro ou por não haver dados),
    // a API simplesmente retornará o array vazio, o que é um comportamento aceitável para GET.
    return NextResponse.json(companies);
  } catch (error) {
    // Este catch pode não ser acionado se getCompanies já tratar seus próprios erros e retornar [].
    // Mas é bom ter para outros erros inesperados.
    console.error('API Error fetching companies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    return NextResponse.json({ error: 'Falha ao buscar empresas.', details: errorMessage }, { status: 500 });
  }
}
