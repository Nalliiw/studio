export enum UserRole {
  ADMIN_SUPREMO = 'administrador_supremo',
  NUTRITIONIST_WHITE_LABEL = 'nutricionista_white_label',
  PATIENT = 'paciente',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string; // For nutritionists and patients associated with a company
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  nutritionistCount: number;
  status: 'active' | 'inactive';
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  lastAccess: string; // ISO date string
  companyId: string;
  nutritionistId: string;
}

// Renamed FormQuestion to FlowStepConfig and made it more generic for flow steps
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

export interface FlowStep {
  id: string;
  type: FlowStepType;
  // User-defined title for this step in the builder, displayed on the card
  title: string; 
  // Type-specific configuration
  config: {
    text?: string; // For text_input, information_text, choice questions prompt
    options?: string[]; // For multiple_choice, single_choice
    url?: string; // For display_pdf, display_image, display_audio, display_video
    placeholder?: string; // For text_input
    maxEmojis?: number; // For emoji_rating
    // Add other specific config fields as needed per type
  };
}

export interface Flow {
  id: string;
  name: string;
  steps: FlowStep[]; // Changed from questions to steps
  nutritionistId: string;
}

export interface Content {
  id: string;
  type: 'video' | 'audio' | 'pdf';
  title: string;
  url: string;
  category: string;
  nutritionistId: string;
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
