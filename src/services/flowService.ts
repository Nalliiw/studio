// src/services/flowService.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import type { Flow, FlowStep } from '@/types';

const FLOWS_COLLECTION = 'flows';
const FIRESTORE_UNINITIALIZED_ERROR = 'Firestore (db) não está inicializado. Verifique a configuração do Firebase.';

export async function createFlow(flowData: {
  name: string;
  steps: FlowStep[];
  nutritionistId: string;
  status?: 'draft' | 'active' | 'archived';
}): Promise<Flow> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const docRef = await addDoc(collection(db, FLOWS_COLLECTION), {
      ...flowData,
      status: flowData.status || 'draft',
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...flowData,
      status: flowData.status || 'draft',
    };
  } catch (error) {
    console.error('Erro ao criar fluxo no Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao criar fluxo: ${error.message}`);
    }
    throw new Error('Falha ao criar fluxo.');
  }
}

export async function getFlowsByNutritionist(nutritionistId: string): Promise<Flow[]> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const q = query(collection(db, FLOWS_COLLECTION), where('nutritionistId', '==', nutritionistId));
    const querySnapshot = await getDocs(q);
    const flows: Flow[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      flows.push({
        id: doc.id,
        name: data.name,
        steps: data.steps,
        nutritionistId: data.nutritionistId,
        status: data.status || 'draft',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastModified: data.lastModified?.toDate ? data.lastModified.toDate().toISOString() : data.lastModified,
        patientAssignments: data.patientAssignments || 0,
      } as Flow);
    });
    return flows.sort((a, b) => new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime());
  } catch (error) {
    console.error('Erro ao buscar fluxos do Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao buscar fluxos: ${error.message}`);
    }
    throw new Error('Falha ao buscar fluxos.');
  }
}

export async function getFlowById(flowId: string): Promise<Flow | null> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const flowDocRef = doc(db, FLOWS_COLLECTION, flowId);
    const flowSnap = await getDoc(flowDocRef);
    if (flowSnap.exists()) {
      const data = flowSnap.data();
      return {
        id: flowSnap.id,
        name: data.name,
        steps: data.steps,
        nutritionistId: data.nutritionistId,
        status: data.status || 'draft',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastModified: data.lastModified?.toDate ? data.lastModified.toDate().toISOString() : data.lastModified,
      } as Flow;
    } else {
      console.log("Nenhum fluxo encontrado com o ID:", flowId);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar fluxo por ID:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao buscar fluxo por ID: ${error.message}`);
    }
    throw new Error('Falha ao buscar fluxo por ID.');
  }
}


export async function updateFlow(flowId: string, flowData: Partial<Omit<Flow, 'id' | 'createdAt' | 'nutritionistId'>>): Promise<void> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const flowDocRef = doc(db, FLOWS_COLLECTION, flowId);
    await updateDoc(flowDocRef, {
      ...flowData,
      lastModified: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar fluxo no Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao atualizar fluxo: ${error.message}`);
    }
    throw new Error('Falha ao atualizar fluxo.');
  }
}

export async function deleteFlow(flowId: string): Promise<void> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const flowDocRef = doc(db, FLOWS_COLLECTION, flowId);
    await deleteDoc(flowDocRef);
  } catch (error) {
    console.error('Erro ao excluir fluxo no Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao excluir fluxo: ${error.message}`);
    }
    throw new Error('Falha ao excluir fluxo.');
  }
}
