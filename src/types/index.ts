
export enum UserRole {
  ADMIN_SUPREMO = 'administrador_supremo',
  CLINIC_SPECIALIST = 'clinic_specialist',
  PATIENT = 'paciente',
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  displayName?: string | null;
  role: UserRole;
  companyId?: string;
  companyCnpj?: string;
  specialties?: string[];
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  responsibleName?: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  logoUrl?: string;
  nutritionistCount: number; // Considerar renomear para memberCount ou specialistCount no futuro
  status: 'active' | 'inactive';
  createdAt?: any;
  lastModified?: any;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  lastAccess: string; // ISO date string
  companyId: string;
  nutritionistId: string; // ID do especialista principal ou de referência
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
  nutritionistId: string; // ID do especialista que criou
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
  nutritionistId: string; // ID do especialista que adicionou
}

export interface Praise { // Renomeado para Conquista na UI, mas tipo pode permanecer Praise
  id: string;
  type: 'text' | 'audio' | 'video';
  content: string;
  date: string; // ISO date string
  patientId: string;
}

export interface FormResponse {
  id: string;
  formId: string; // ID do Flow original
  flowName: string; // Nome do Flow para exibição
  patientId: string;
  answers: { stepId: string; answer: any }[];
  status: 'pending' | 'completed';
  submittedAt?: string; // ISO date string
  assignedAt?: string; // ISO date string (para formulários pendentes)
}

export type ClinicAccessType = 'administrador_clinica' | 'especialista_padrao';

export interface TeamMember {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  accessType: ClinicAccessType;
  specialties?: string[];
  userId?: string; // UID do Firebase Auth, se o membro tiver uma conta real
  status: 'active' | 'pending_invitation' | 'inactive';
  createdAt: any; // Firebase Timestamp ou string ISO
  addedBy: string; // UID do admin da clínica que adicionou
  invitationToken?: string;
}

export type UpdateTeamMemberData = Partial<Omit<TeamMember, 'id' | 'clinicId' | 'createdAt' | 'addedBy' | 'invitationToken'>>;


// Tipos para a Central de Ajuda
export type HelpMaterialType = 'faq' | 'video' | 'pdf' | 'document' | 'external_link';
export type HelpMaterialAudience = 'support' | 'clinic' | 'patient';

export interface HelpMaterial {
  id: string;
  title: string;
  type: HelpMaterialType;
  // Para FAQ: o texto da resposta.
  // Para Vídeo/Link Externo: a URL.
  // Para PDF/Documento: a URL do arquivo após o upload (ou um identificador para buscar).
  content: string;
  audience: HelpMaterialAudience[];
  category?: string;
  createdAt?: string; // ISO date string
  lastModified?: string; // ISO date string
}
