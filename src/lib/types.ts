
export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  specialties: string[];
  beds: {
    icu: { available: number; total: number };
    oxygen: { available: number; total: number };
    ventilator: { available: number; total: number };
    general: { available: number; total: number };
  };
  contact?: string;
  imageUrl?: string;
  dataAiHint?: string; // For placeholder image search keywords
  rating?: number; // 1-5
  services?: string[]; // e.g. "24/7 Emergency", "Pharmacy"
  distance?: string; // for display, e.g. "2.5km"
}

export interface Feedback {
  id: string;
  hospitalId: string;
  patientName?: string; // Or userId
  rating: number; // 1-5
  comments: string;
  submittedAt: string; // ISO date string
}

export interface Complaint {
  id: string; // Unique ID
  patientName?: string; // Or userId
  hospitalId?: string;
  description: string;
  status: 'submitted' | 'in_progress' | 'resolved' | 'escalated';
  submittedAt: string; // ISO date string
  escalationNotes?: string;
}

export type UserRole = 'patient' | 'hospital_admin' | 'health_department_official';

export interface BedAvailability {
  hospitalId: string;
  icu: { available: number; total: number };
  oxygen: { available: number; total: number };
  ventilator: { available: number; total: number };
  general: { available: number; total: number };
  lastUpdated: string; // ISO date string
}

    