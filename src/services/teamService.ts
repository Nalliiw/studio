
// src/services/teamService.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, doc, getDoc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
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

    // Generate a simple invitation token (using the future document ID for simulation)
    // In a real scenario, this would be a more secure, unique token.
    const tempDocForId = doc(collection(db, TEAM_MEMBERS_COLLECTION)); // Create a ref to get an ID
    const invitationToken = tempDocForId.id;


    const newMemberDocData = {
      clinicId: memberData.clinicId,
      name: memberData.name,
      email: memberData.email,
      accessType: memberData.accessType,
      specialties: specialtiesArray,
      status: 'pending_invitation' as const,
      addedBy: memberData.addedBy,
      createdAt: serverTimestamp(),
      invitationToken: invitationToken, // Store the simulated token
      ...(memberData.userId && { userId: memberData.userId }),
    };

    // Use the pre-generated reference (tempDocForId) to set the document with its own ID as token
    await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), newMemberDocData);
    
    // It's better to re-fetch or structure the return if the exact ID added is needed immediately for the token,
    // but for simulation, using a newly generated ID is fine.
    // For more robustness, one might use a transaction or a Cloud Function.
    // The ID from addDoc (docRef.id) will be different from tempDocForId.id if not explicitly set.
    // For now, we'll assume the addDoc generates its own ID, and the token can be this ID or another unique string.
    // To keep it simple for now, let's assume the docRef.id IS the token after creation for this simulation.
    
    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), {
      ...newMemberDocData,
      // Overwrite invitationToken with the actual doc ID for this simulation
      invitationToken: '', // Will be set to docRef.id below
    });
    
    await updateDoc(docRef, { invitationToken: docRef.id });


    return {
      id: docRef.id,
      ...newMemberDocData,
      createdAt: new Date().toISOString(), 
      status: 'pending_invitation',
      invitationToken: docRef.id, // Ensure the returned object has the token
    } as TeamMember; 
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
    querySnapshot.forEach((docSnap) => { 
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
        invitationToken: data.invitationToken,
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
        invitationToken: data.invitationToken,
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

    if (typeof (dataToUpdate as any).specialtiesRaw === 'string') {
      updatePayload.specialties = (dataToUpdate as any).specialtiesRaw.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      delete updatePayload.specialtiesRaw; 
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

export async function deleteTeamMember(memberId: string): Promise<void> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const memberDocRef = doc(db, TEAM_MEMBERS_COLLECTION, memberId);
    await deleteDoc(memberDocRef);
  } catch (error) {
    console.error('Erro ao excluir membro da equipe no Firestore:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    throw new Error(`Falha ao excluir membro da equipe: ${errorMessage}`);
  }
}

export async function activateTeamMember(memberId: string): Promise<void> {
  if (!db) {
    console.error(FIRESTORE_UNINITIALIZED_ERROR);
    throw new Error(FIRESTORE_UNINITIALIZED_ERROR);
  }
  try {
    const memberDocRef = doc(db, TEAM_MEMBERS_COLLECTION, memberId);
    await updateDoc(memberDocRef, {
      status: 'active',
      invitationToken: deleteField(), // Remove o token após a ativação
    });
    console.log(`Membro ${memberId} ativado com sucesso.`);
  } catch (error) {
    console.error(`Erro ao ativar membro ${memberId} no Firestore:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    throw new Error(`Falha ao ativar membro da equipe: ${errorMessage}`);
  }
}
