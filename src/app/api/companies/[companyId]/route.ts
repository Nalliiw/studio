// src/app/api/companies/[companyId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getCompanyById, updateCompany } from '@/services/companyService';
import { z } from 'zod';

const FIRESTORE_UNINITIALIZED_ERROR_MESSAGE = 'Serviço Indisponível: Backend (Firebase) não conectado ou configurado corretamente.';

// Schema for PUT request body: name is optional for partial updates (e.g., only logoUrl),
// but companyService might enforce it for creation.
// CNPJ is optional for update, but might be required by service for creation.
const updateCompanySchema = z.object({
  name: z.string().min(3, { message: 'O nome da clínica deve ter no mínimo 3 caracteres.' }).optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX' }).optional(),
  logoUrl: z.string().url({ message: 'URL do logo inválida.' }).optional(),
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
    
    const updatePayload: { name?: string; cnpj?: string; logoUrl?: string } = {};
    if (parsedData.data.name) updatePayload.name = parsedData.data.name;
    if (parsedData.data.cnpj) updatePayload.cnpj = parsedData.data.cnpj; // Pass CNPJ if provided
    if (parsedData.data.logoUrl) updatePayload.logoUrl = parsedData.data.logoUrl;

    if (Object.keys(updatePayload).length === 0) {
        console.warn(`API PUT /api/companies/${companyId} - Nenhum dado fornecido para atualização.`);
        return NextResponse.json({ error: 'Nenhum dado fornecido para atualização' }, { status: 400 });
    }
    
    // The service's updateCompany now handles upsert logic
    console.log(`API PUT /api/companies/${companyId} - Chamando companyService.updateCompany com payload:`, updatePayload);
    await updateCompany(companyId, updatePayload);
    console.log(`API PUT /api/companies/${companyId} - Empresa atualizada/criada com sucesso.`);
    
    const updatedCompany = await getCompanyById(companyId);
    if (!updatedCompany) {
        console.error(`API PUT /api/companies/${companyId} - Empresa não encontrada após atualização/criação bem-sucedida.`);
        return NextResponse.json({ error: 'Empresa atualizada/criada, mas não pôde ser recuperada.' }, { status: 500 });
    }
    return NextResponse.json(updatedCompany, { status: 200 });

  } catch (error) {
    console.error(`API PUT /api/companies/${companyId} - Erro:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: FIRESTORE_UNINITIALIZED_ERROR_MESSAGE, details: errorMessage }, { status: 503 });
    }
    if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('permissions')) {
      return NextResponse.json({ error: 'Falha ao atualizar empresa.', details: 'Permissões insuficientes no Firestore.' }, { status: 403 });
    }
    if (errorMessage.includes("Nome e CNPJ são obrigatórios para criar uma nova clínica")) {
      return NextResponse.json({ error: 'Falha ao criar/atualizar empresa.', details: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar empresa.', details: errorMessage }, { status: 500 });
  }
}