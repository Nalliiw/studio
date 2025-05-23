
export enum UserRole {
  ADMIN_SUPREMO = 'administrador_supremo',
  CLINIC_SPECIALIST = 'clinic_specialist',
  PATIENT = 'paciente',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string; // ID da Clínica/Empresa à qual o especialista ou paciente está associado
  specialties?: string[];
}

export interface Company {
  id: string;
  name: string; // Nome da Clínica/Empresa
  cnpj: string;
  nutritionistCount: number; // Considerar renomear para memberCount ou specialistCount no futuro
  status: 'active' | 'inactive';
  createdAt?: any; // Firestore Timestamp or string ISO
  lastModified?: any; // Firestore Timestamp or string ISO
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  lastAccess: string; // ISO date string
  companyId: string; // ID da clínica à qual o paciente pertence
  nutritionistId: string; // ID do especialista principal atribuído
}

export type FlowStepType =
  | 'information_text'
  | 'text_input'
  | 'multiple_choice'
  | 'single_choice'
  | 'image_upload'
  | 'emoji_rating'
  | 'audio_record'
  | 'video_record'
  | 'display_pdf'
  | 'display_image'
  | 'display_audio'
  | 'display_video';

export interface FlowStepOption {
  value: string;
  label: string;
  nextStepId?: string;
}

export interface FlowStepConfig {
  text?: string;
  options?: FlowStepOption[];
  url?: string;
  placeholder?: string;
  maxEmojis?: number;
  setOutputVariable?: string;
  defaultNextStepId?: string;
}

export interface FlowStep {
  id: string;
  type: FlowStepType;
  title: string;
  config: FlowStepConfig;
  position: { x: number; y: number };
}

export interface Flow {
  id: string;
  name: string;
  steps: FlowStep[];
  nutritionistId: string; // ID do especialista que criou o fluxo
  createdAt?: any;
  lastModified?: any;
  status?: 'draft' | 'active' | 'archived';
  patientAssignments?: number;
}

export interface Content {
  id: string;
  type: 'video' | 'audio' | 'pdf';
  title: string;
  url: string;
  category: string;
  nutritionistId: string; // ID do especialista
}

export interface Praise {
  id: string;
  type: 'text' | 'audio' | 'video';
  content: string;
  date: string; // ISO date string
  patientId: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  patientId: string;
  answers: { stepId: string; answer: any }[];
  status: 'pending' | 'completed';
  submittedAt?: string;
}

export type ClinicAccessType = 'administrador_clinica' | 'especialista_padrao';

export interface TeamMember {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  accessType: ClinicAccessType;
  specialties?: string[];
  userId?: string; // ID do usuário Firebase Authentication associado
  status: 'active' | 'pending_invitation' | 'inactive';
  createdAt: any; // Firestore Timestamp or string ISO
  addedBy: string; // User ID of who added this member
  invitationToken?: string; // Token para o fluxo de convite
}

// Partial type for updating a team member, making most fields optional
export type UpdateTeamMemberData = Partial<Omit<TeamMember, 'id' | 'clinicId' | 'createdAt' | 'addedBy' | 'invitationToken'>>;
