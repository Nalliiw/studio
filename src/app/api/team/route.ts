
// src/app/api/team/route.ts
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { addTeamMember, getTeamMembers } from '@/services/teamService';
import { z } from 'zod';
import { UserRole } from '@/types';

const clinicAccessTypesForValidation = ['administrador_clinica', 'especialista_padrao'] as const;

const createTeamMemberSchema = z.object({
  name: z.string().min(3, { message: 'Nome do membro deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  accessType: z.enum(clinicAccessTypesForValidation, { errorMap: () => ({ message: "Selecione um tipo de acesso válido."}) }),
  specialtiesRaw: z.string().optional(),
  clinicId: z.string().min(1, { message: 'ID da clínica é obrigatório.' }),
  addedBy: z.string().min(1, { message: 'ID do adicionador é obrigatório.' }),
  userId: z.string().optional(), // Opcional, para futura associação com Firebase Auth user
});

export async function POST(request: NextRequest) {
  console.log("API POST /api/team atingida");
  try {
    const json = await request.json();
    console.log("Payload recebido em POST /api/team:", json);
    const parsedData = createTeamMemberSchema.safeParse(json);

    if (!parsedData.success) {
      console.error("Erro de validação em POST /api/team:", parsedData.error.flatten());
      return NextResponse.json({ error: 'Dados de entrada inválidos para criar membro da equipe', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, email, accessType, specialtiesRaw, clinicId, addedBy, userId } = parsedData.data;
    
    console.log("Chamando teamService.addTeamMember com:", { clinicId, name, email, accessType, specialtiesRaw, addedBy, userId });
    // Pass specialtiesRaw as it's named in CreateTeamMemberData in the service
    const newMember = await addTeamMember({ clinicId, name, email, accessType, specialtiesRaw, addedBy, userId });
    console.log("Membro da equipe criado com sucesso:", newMember);
    return NextResponse.json(newMember, { status: 201 });

  } catch (error) {
    console.error('Erro na API ao criar membro da equipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao criar membro da equipe.', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log("API GET /api/team atingida");
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      console.warn("GET /api/team - clinicId não fornecido");
      return NextResponse.json({ error: 'Parâmetro clinicId é obrigatório.' }, { status: 400 });
    }
    console.log("Buscando membros da equipe para clinicId:", clinicId);
    const members = await getTeamMembers(clinicId);
    console.log("Membros da equipe encontrados:", members.length);
    return NextResponse.json(members);

  } catch (error) {
    console.error('Erro na API ao buscar membros da equipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao buscar membros da equipe.', details: errorMessage }, { status: 500 });
  }
}
