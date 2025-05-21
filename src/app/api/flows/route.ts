// src/app/api/flows/route.ts
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { createFlow, getFlowsByNutritionist } from '@/services/flowService';
import type { FlowStep } from '@/types'; // Assuming Flow type is available
import { z } from 'zod';

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
}).passthrough(); // Allow other potential config fields

const flowStepSchema = z.object({
    id: z.string(),
    type: z.string(), // In a real app, use z.enum with FlowStepType values
    title: z.string().min(1, "O título da etapa é obrigatório."),
    config: flowStepConfigSchema,
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
});


const createFlowSchema = z.object({
    name: z.string().min(1, "O nome do fluxo é obrigatório."),
    steps: z.array(flowStepSchema).min(1, "O fluxo deve ter pelo menos uma etapa."),
    nutritionistId: z.string().min(1, "ID do nutricionista é obrigatório."),
    status: z.enum(['draft', 'active', 'archived']).optional(),
});


export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsedData = createFlowSchema.safeParse(json);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Dados de entrada inválidos para criar fluxo', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, steps, nutritionistId, status } = parsedData.data;
    const newFlow = await createFlow({ name, steps: steps as FlowStep[], nutritionistId, status });
    return NextResponse.json(newFlow, { status: 201 });

  } catch (error) {
    console.error('API Error creating flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao criar fluxo.', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nutritionistId = searchParams.get('nutritionistId');

    if (!nutritionistId) {
      return NextResponse.json({ error: 'Parâmetro nutritionistId é obrigatório.' }, { status: 400 });
    }

    const flows = await getFlowsByNutritionist(nutritionistId);
    return NextResponse.json(flows);

  } catch (error) {
    console.error('API Error fetching flows:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    if (errorMessage.includes('Firestore (db) não está inicializado')) {
      return NextResponse.json({ error: 'Serviço Indisponível: Backend (Firebase) não conectado.', details: errorMessage }, { status: 503 });
    }
    return NextResponse.json({ error: 'Falha ao buscar fluxos.', details: errorMessage }, { status: 500 });
  }
}
