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

export interface FormQuestion {
  id: string;
  type: 'text' | 'multiple_choice' | 'emoji' | 'audio' | 'video' | 'image_upload';
  text: string;
  options?: string[]; // For multiple_choice
}

export interface Flow {
  id: string;
  name: string;
  questions: FormQuestion[];
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
  formId: string;
  patientId: string;
  answers: { questionId: string; answer: any }[];
  status: 'pending' | 'completed';
  submittedAt?: string; // ISO date string
}
