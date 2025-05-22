
// src/services/teamService.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { TeamMember, ClinicAccessType, UpdateTeamMemberData } from '@/types';

const TEAM_MEMBERS_COLLECTION = 'teamMembers';
const FIRESTORE_UNINITIALIZED_ERROR = 'Firestore (db) não está inicializado. Verifique a configuração do Firebase.';

interface CreateTeamMemberPayload {
  clinicId: string;
  name: string;
  email: string;
  accessType: ClinicAccessType;
  specialtiesRaw?: string; // raw string from form
  addedBy: string;
  userId?: string;
}

export async function addTeamMember(memberData: CreateTeamMemberPayload): Promise<TeamMember> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const specialtiesArray = memberData.specialtiesRaw
      ? memberData.specialtiesRaw.split(',').map(s => s.trim()).filter(s => s)
      : [];

    const newMemberDocData = {
      clinicId: memberData.clinicId,
      name: memberData.name,
      email: memberData.email,
      accessType: memberData.accessType,
      specialties: specialtiesArray,
      status: 'pending_invitation' as const,
      addedBy: memberData.addedBy,
      createdAt: serverTimestamp(),
      ...(memberData.userId && { userId: memberData.userId }),
    };

    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), newMemberDocData);
    
    return {
      id: docRef.id,
      ...newMemberDocData,
      createdAt: new Date().toISOString(), // Approximation, Firestore will set the actual server timestamp
      status: 'pending_invitation',
    } as TeamMember; // Cast to TeamMember, assuming serverTimestamp resolves appropriately
  } catch (error) {
    console.error('Erro ao adicionar membro da equipe no Firestore:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    throw new Error(`Falha ao adicionar membro da equipe: ${errorMessage}`);
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
    querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict
      const data = docSnap.data();
      members.push({
        id: docSnap.id,
        clinicId: data.clinicId,
        name: data.name,
        email: data.email,
        accessType: data.accessType,
        specialties: data.specialties || [],
        userId: data.userId,
        status: data.status || 'pending_invitation',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        addedBy: data.addedBy,
      } as TeamMember);
    });
    return members.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar membros da equipe do Firestore:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    throw new Error(`Falha ao buscar membros da equipe: ${errorMessage}`);
  }
}

export async function getTeamMemberById(memberId: string): Promise<TeamMember | null> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const memberDocRef = doc(db, TEAM_MEMBERS_COLLECTION, memberId);
    const memberSnap = await getDoc(memberDocRef);
    if (memberSnap.exists()) {
      const data = memberSnap.data();
      return {
        id: memberSnap.id,
        clinicId: data.clinicId,
        name: data.name,
        email: data.email,
        accessType: data.accessType,
        specialties: data.specialties || [],
        userId: data.userId,
        status: data.status || 'pending_invitation',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        addedBy: data.addedBy,
      } as TeamMember;
    } else {
      console.log("Nenhum membro da equipe encontrado com o ID:", memberId);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar membro da equipe por ID:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    throw new Error(`Falha ao buscar membro da equipe por ID: ${errorMessage}`);
  }
}

export async function updateTeamMember(memberId: string, dataToUpdate: UpdateTeamMemberData): Promise<void> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const memberDocRef = doc(db, TEAM_MEMBERS_COLLECTION, memberId);
    
    const updatePayload: any = { ...dataToUpdate };

    // If specialtiesRaw is provided, convert it to specialties array
    if (typeof (dataToUpdate as any).specialtiesRaw === 'string') {
      updatePayload.specialties = (dataToUpdate as any).specialtiesRaw.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      delete updatePayload.specialtiesRaw; // Remove specialtiesRaw as it's not part of TeamMember type
    }


    await updateDoc(memberDocRef, {
      ...updatePayload,
      // lastModified: serverTimestamp(), // Consider adding a lastModified field
    });
  } catch (error) {
    console.error('Erro ao atualizar membro da equipe no Firestore:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    throw new Error(`Falha ao atualizar membro da equipe: ${errorMessage}`);
  }
}
