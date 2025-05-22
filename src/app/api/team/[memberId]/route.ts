
// src/app/api/team/[memberId]/route.ts
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getTeamMemberById, updateTeamMember, deleteTeamMember } from '@/services/teamService';
import { z } from 'zod';
import type { ClinicAccessType } from '@/types';

const clinicAccessTypesForValidation = ['administrador_clinica', 'especialista_padrao'] as const;

// Schema for updating a team member, all fields are optional
const updateTeamMemberSchema = z.object({
  name: z.string().min(3, { message: 'Nome do membro deve ter no mínimo 3 caracteres.' }).optional(),
  email: z.string().email({ message: 'Email inválido.' }).optional(), 
  accessType: z.enum(clinicAccessTypesForValidation, { errorMap: () => ({ message: "Selecione um tipo de acesso válido."}) }).optional(),
  specialtiesRaw: z.string().optional(), 
  status: z.enum(['active', 'pending_invitation', 'inactive']).optional(),
}).strict(); 

export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  console.log(`API GET /api/team/${params.memberId} atingida`);
  try {
    const memberId = params.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'ID do membro não fornecido' }, { status: 400 });
    }
    const member = await getTeamMemberById(memberId);
    if (!member) {
      return NextResponse.json({ error: 'Membro da equipe não encontrado' }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    console.error('API Error fetching team member by ID:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao buscar membro da equipe.', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  console.log(`API PUT /api/team/${params.memberId} atingida`);
  try {
    const memberId = params.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'ID do membro não fornecido' }, { status: 400 });
    }
    const json = await request.json();
    console.log("Payload recebido em PUT /api/team/[memberId]:", json);
    
    const parsedData = updateTeamMemberSchema.safeParse(json);

    if (!parsedData.success) {
      console.error("Erro de validação em PUT /api/team/[memberId]:", parsedData.error.flatten());
      return NextResponse.json({ error: 'Dados de entrada inválidos para atualizar membro', details: parsedData.error.flatten() }, { status: 400 });
    }
    
    const dataToUpdate = parsedData.data;

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ error: 'Nenhum dado fornecido para atualização' }, { status: 400 });
    }

    await updateTeamMember(memberId, dataToUpdate);
    console.log("Membro da equipe atualizado com sucesso:", memberId);
    return NextResponse.json({ message: 'Membro da equipe atualizado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('API Error updating team member:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar membro da equipe.', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  console.log(`API DELETE /api/team/${params.memberId} atingida`);
  try {
    const memberId = params.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'ID do membro não fornecido' }, { status: 400 });
    }
    await deleteTeamMember(memberId);
    console.log("Membro da equipe excluído com sucesso:", memberId);
    return NextResponse.json({ message: 'Membro da equipe excluído com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('API Error deleting team member:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao excluir membro da equipe.', details: errorMessage }, { status: 500 });
  }
}
