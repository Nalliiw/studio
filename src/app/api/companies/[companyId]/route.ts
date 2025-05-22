
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
  const companyId = params.companyId;
  console.log(`API GET /api/companies/${companyId} - Recebida requisição.`);
  try {
    if (!companyId) {
      console.warn(`API GET /api/companies/${companyId} - ID da empresa não fornecido.`);
      return NextResponse.json({ error: 'ID da empresa não fornecido' }, { status: 400 });
    }
    
    console.log(`API GET /api/companies/${companyId} - Chamando companyService.getCompanyById.`);
    const company = await getCompanyById(companyId);
    
    if (!company) {
      console.warn(`API GET /api/companies/${companyId} - Empresa não encontrada pelo serviço.`);
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }
    console.log(`API GET /api/companies/${companyId} - Empresa encontrada, retornando dados.`);
    return NextResponse.json(company);
  } catch (error) {
    console.error(`API GET /api/companies/${companyId} - Erro:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: FIRESTORE_UNINITIALIZED_ERROR_MESSAGE, details: errorMessage }, { status: 503 });
    }
    // Firebase permission errors might be caught here by the service
    if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('permissions')) {
      return NextResponse.json({ error: 'Falha ao buscar empresa.', details: 'Permissões insuficientes no Firestore.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Falha ao buscar empresa.', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const companyId = params.companyId;
  console.log(`API PUT /api/companies/${companyId} - Recebida requisição.`);
  try {
    if (!companyId) {
      console.warn(`API PUT /api/companies/${companyId} - ID da empresa não fornecido.`);
      return NextResponse.json({ error: 'ID da empresa não fornecido' }, { status: 400 });
    }
    const json = await request.json();
    console.log(`API PUT /api/companies/${companyId} - Payload recebido:`, json);
    
    const parsedData = updateCompanySchema.safeParse(json);

    if (!parsedData.success) {
      console.error(`API PUT /api/companies/${companyId} - Erro de validação:`, parsedData.error.flatten());
      return NextResponse.json({ error: 'Dados de entrada inválidos para atualizar empresa', details: parsedData.error.flatten() }, { status: 400 });
    }
    
    const { name } = parsedData.data;

    console.log(`API PUT /api/companies/${companyId} - Chamando companyService.updateCompany.`);
    await updateCompany(companyId, { name });
    console.log(`API PUT /api/companies/${companyId} - Empresa atualizada com sucesso.`);
    return NextResponse.json({ message: 'Empresa atualizada com sucesso' }, { status: 200 });
  } catch (error) {
    console.error(`API PUT /api/companies/${companyId} - Erro:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: FIRESTORE_UNINITIALIZED_ERROR_MESSAGE, details: errorMessage }, { status: 503 });
    }
     // Firebase permission errors might be caught here by the service
    if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('permissions')) {
      return NextResponse.json({ error: 'Falha ao atualizar empresa.', details: 'Permissões insuficientes no Firestore.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar empresa.', details: errorMessage }, { status: 500 });
  }
}
