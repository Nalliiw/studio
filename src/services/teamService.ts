
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
  specialtiesRaw?: string;
  addedBy: string;
  userId?: string; // Opcional, para futura associação com Firebase Auth user
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

    const newMemberDoc: Omit<TeamMember, 'id' | 'createdAt'> & { createdAt: any } = {
      clinicId: memberData.clinicId,
      name: memberData.name,
      email: memberData.email,
      accessType: memberData.accessType,
      specialties: specialtiesArray,
      status: 'pending_invitation' as const, // Default to pending, admin can change or invite flow handles this
      addedBy: memberData.addedBy,
      createdAt: serverTimestamp(),
    };
    if (memberData.userId) {
      newMemberDoc.userId = memberData.userId;
    }


    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), newMemberDoc);
    
    return {
      id: docRef.id,
      ...newMemberDoc,
      createdAt: new Date().toISOString(), // Aproximação, Firestore atualizará
      specialties: specialtiesArray,
      status: 'pending_invitation', // ensure status is part of the returned type
    } as TeamMember;
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
        userId: data.userId, // Incluir userId
        status: data.status || 'pending_invitation',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        addedBy: data.addedBy,
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
