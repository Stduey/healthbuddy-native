export interface HealthProfile {
  age?: number;
  sex?: string;
  race?: string;
  conditions: string[];
  medications: Medication[];
  allergies: string[];
  doctorVisits: DoctorVisit[];
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  prescribingDoctor?: string;
  notes?: string;
}

export interface DoctorVisit {
  date: string;
  doctor: string;
  reason: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  conditions: [],
  medications: [],
  allergies: [],
  doctorVisits: [],
};
