
// src/services/teamService.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { TeamMember, ClinicAccessType } from '@/types';

const TEAM_MEMBERS_COLLECTION = 'teamMembers';
const FIRESTORE_UNINITIALIZED_ERROR = 'Firestore (db) não está inicializado. Verifique a configuração do Firebase.';

interface CreateTeamMemberData {
  clinicId: string;
  name: string;
  email: string;
  accessType: ClinicAccessType;
  specialtiesRaw?: string; // String de especialidades separadas por vírgula
  addedBy: string; // ID do usuário (administrador da clínica) que está adicionando
}

export async function addTeamMember(memberData: CreateTeamMemberData): Promise<TeamMember> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const specialtiesArray = memberData.specialtiesRaw
      ? memberData.specialtiesRaw.split(',').map(s => s.trim()).filter(s => s)
      : [];

    const newMemberDoc = {
      clinicId: memberData.clinicId,
      name: memberData.name,
      email: memberData.email,
      accessType: memberData.accessType,
      specialties: specialtiesArray,
      status: 'active' as const, // Ou 'pending_invitation' se for implementar convites
      createdAt: serverTimestamp(),
      addedBy: memberData.addedBy,
    };

    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), newMemberDoc);
    
    return {
      id: docRef.id,
      ...newMemberDoc,
      createdAt: new Date().toISOString(), // Aproximação, Firestore atualizará com serverTimestamp
      specialties: specialtiesArray, // Garantir que specialties seja um array
    };
  } catch (error) {
    console.error('Erro ao adicionar membro da equipe no Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao adicionar membro da equipe: ${error.message}`);
    }
    throw new Error('Falha ao adicionar membro da equipe.');
  }
}

export async function getTeamMembers(clinicId: string): Promise<TeamMember[]> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const q = query(collection(db, TEAM_MEMBERS_COLLECTION), where('clinicId', '==', clinicId));
    const querySnapshot = await getDocs(q);
    const members: TeamMember[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        id: doc.id,
        clinicId: data.clinicId,
        name: data.name,
        email: data.email,
        accessType: data.accessType,
        specialties: data.specialties || [],
        status: data.status || 'active',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        addedBy: data.addedBy,
        userId: data.userId,
      } as TeamMember);
    });
    return members.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar membros da equipe do Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao buscar membros da equipe: ${error.message}`);
    }
    throw new Error('Falha ao buscar membros da equipe.');
  }
}
