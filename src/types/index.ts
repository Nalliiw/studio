export enum UserRole {
  ADMIN_SUPREMO = 'administrador_supremo',
  CLINIC_SPECIALIST = 'clinic_specialist', // Alterado de NUTRITIONIST_WHITE_LABEL
  PATIENT = 'paciente',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string; // Para especialistas e pacientes associados a uma clínica/empresa
}

export interface Company {
  id: string;
  name: string; // Nome da Clínica/Empresa
  cnpj: string;
  nutritionistCount: number; // Contagem de especialistas na clínica
  status: 'active' | 'inactive';
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  lastAccess: string; // ISO date string
  companyId: string; // ID da clínica à qual o paciente pertence
  nutritionistId: string; // ID do especialista principal atribuído (manter nome do campo por ora)
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
  value: string; // Internal value/ID of the option, can be same as label for simplicity
  label: string; // Display label for the option
  nextStepId?: string; // If this option is chosen, go to this step ID
}

export interface FlowStepConfig {
  text?: string; // For prompts, instructions, content titles
  options?: FlowStepOption[]; // For multiple_choice, single_choice
  url?: string; // For display_pdf, display_image, display_audio, display_video
  placeholder?: string; // For text_input
  maxEmojis?: number; // For emoji_rating
  setOutputVariable?: string; // Name of the variable this step's result will be stored in
  defaultNextStepId?: string; // Default next step for non-branching steps or fallback
}

export interface FlowStep {
  id: string;
  type: FlowStepType;
  // User-defined title for this step in the builder, displayed on the card
  title: string;
  config: FlowStepConfig;
  position: { x: number; y: number }; // Position on the canvas
}

export interface Flow {
  id: string;
  name: string;
  steps: FlowStep[];
  nutritionistId: string; // ID do especialista que criou o fluxo (manter nome do campo por ora)
  createdAt?: any; // Firebase Timestamp or string
  lastModified?: any; // Firebase Timestamp or string
  status?: 'draft' | 'active' | 'archived';
  patientAssignments?: number; 
}

export interface Content {
  id: string;
  type: 'video' | 'audio' | 'pdf';
  title: string;
  url: string;
  category: string;
  nutritionistId: string; // ID do especialista que fez o upload (manter nome do campo por ora)
}

export interface Praise {
  id: string;
  type: 'text' | 'audio' | 'video';
  content: string; // URL for audio/video, text for text
  date: string; // ISO date string
  patientId: string;
}

export interface FormResponse {
  id: string;
  formId: string; // Corresponds to Flow id
  patientId: string;
  answers: { stepId: string; answer: any }[]; // Corresponds to FlowStep id
  status: 'pending' | 'completed';
  submittedAt?: string; // ISO date string
}
