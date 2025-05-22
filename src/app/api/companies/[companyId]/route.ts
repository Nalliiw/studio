
// src/app/api/companies/[companyId]/route.ts
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getCompanyById, updateCompany } from '@/services/companyService';
import { z } from 'zod';

const FIRESTORE_UNINITIALIZED_ERROR_MESSAGE = 'Serviço Indisponível: Backend (Firebase) não conectado ou configurado corretamente.';

const updateCompanySchema = z.object({
  name: z.string().min(3, { message: 'O nome da clínica deve ter pelo menos 3 caracteres.' }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  console.log(`API GET /api/companies/${params.companyId} atingida`);
  try {
    const companyId = params.companyId;
    if (!companyId) {
      return NextResponse.json({ error: 'ID da empresa não fornecido' }, { status: 400 });
    }
    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    console.error('API Error fetching company by ID:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: FIRESTORE_UNINITIALIZED_ERROR_MESSAGE, details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao buscar empresa.', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  console.log(`API PUT /api/companies/${params.companyId} atingida`);
  try {
    const companyId = params.companyId;
    if (!companyId) {
      return NextResponse.json({ error: 'ID da empresa não fornecido' }, { status: 400 });
    }
    const json = await request.json();
    console.log("Payload recebido em PUT /api/companies/[companyId]:", json);
    
    const parsedData = updateCompanySchema.safeParse(json);

    if (!parsedData.success) {
      console.error("Erro de validação em PUT /api/companies/[companyId]:", parsedData.error.flatten());
      return NextResponse.json({ error: 'Dados de entrada inválidos para atualizar empresa', details: parsedData.error.flatten() }, { status: 400 });
    }
    
    const { name } = parsedData.data;

    await updateCompany(companyId, { name });
    console.log("Empresa atualizada com sucesso:", companyId);
    return NextResponse.json({ message: 'Empresa atualizada com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('API Error updating company:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: FIRESTORE_UNINITIALIZED_ERROR_MESSAGE, details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar empresa.', details: errorMessage }, { status: 500 });
  }
}
