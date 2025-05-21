// src/app/api/flows/[flowId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getFlowById, updateFlow, deleteFlow } from '@/services/flowService';
import { z } from 'zod';
import type { FlowStep } from '@/types';

const flowStepConfigSchema = z.object({
    text: z.string().optional(),
    options: z.array(z.object({
        value: z.string(),
        label: z.string(),
        nextStepId: z.string().optional(),
    })).optional(),
    url: z.string().optional(),
    placeholder: z.string().optional(),
    maxEmojis: z.number().optional(),
    setOutputVariable: z.string().optional(),
    defaultNextStepId: z.string().optional(),
}).passthrough();

const flowStepSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  config: flowStepConfigSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});


const updateFlowSchema = z.object({
  name: z.string().min(1, "O nome do fluxo é obrigatório.").optional(),
  steps: z.array(flowStepSchema).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    const flowId = params.flowId;
    if (!flowId) {
      return NextResponse.json({ error: 'ID do fluxo não fornecido' }, { status: 400 });
    }
    const flow = await getFlowById(flowId);
    if (!flow) {
      return NextResponse.json({ error: 'Fluxo não encontrado' }, { status: 404 });
    }
    return NextResponse.json(flow);
  } catch (error) {
    console.error('API Error fetching flow by ID:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao buscar fluxo.', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    const flowId = params.flowId;
    if (!flowId) {
      return NextResponse.json({ error: 'ID do fluxo não fornecido' }, { status: 400 });
    }
    const json = await request.json();
    
    const parsedData = updateFlowSchema.safeParse(json);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Dados de entrada inválidos para atualizar fluxo', details: parsedData.error.flatten() }, { status: 400 });
    }
    
    const updatePayload: { name?: string; steps?: FlowStep[]; status?: 'draft' | 'active' | 'archived' } = {};
    if (parsedData.data.name) updatePayload.name = parsedData.data.name;
    if (parsedData.data.steps) updatePayload.steps = parsedData.data.steps as FlowStep[];
    if (parsedData.data.status) updatePayload.status = parsedData.data.status;


    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: 'Nenhum dado fornecido para atualização' }, { status: 400 });
    }

    await updateFlow(flowId, updatePayload);
    return NextResponse.json({ message: 'Fluxo atualizado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('API Error updating flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar fluxo.', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    const flowId = params.flowId;
    if (!flowId) {
      return NextResponse.json({ error: 'ID do fluxo não fornecido' }, { status: 400 });
    }
    await deleteFlow(flowId);
    return NextResponse.json({ message: 'Fluxo excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('API Error deleting flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao excluir fluxo.', details: errorMessage }, { status: 500 });
  }
}
