
import type { Timestamp } from 'firebase/firestore';

export interface Hospital {
  id: string; // Firestore document ID
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
  distance?: string; // for display, e.g. "2.5km" - this might be calculated client-side if not stored
  lastBedUpdate?: Timestamp | string; // For Firestore timestamp
}

export interface Feedback {
  id: string; // Firestore document ID
  hospitalId: string;
  hospitalName?: string; // Denormalized for easier display
  userId: string; // Firebase Auth UID of the submitting user
  patientName?: string; // Optional, could be user's display name
  rating: number; // 1-5
  comments: string;
  submittedAt: Timestamp | string; // For Firestore timestamp
}

export interface Complaint {
  id: string; // Firestore document ID
  userId: string; // Firebase Auth UID of the submitting user
  patientName?: string; // Optional
  hospitalId?: string;
  hospitalName?: string; // Denormalized
  description: string;
  status: 'submitted' | 'in_progress' | 'resolved' | 'escalated';
  submittedAt: Timestamp | string; // For Firestore timestamp
  escalationNotes?: string;
}

export type UserRole = 'patient' | 'hospital_admin' | 'health_department_official' | 'platform_admin';

// This type is for the form on hospital/beds page, actual storage is within Hospital type
export interface BedAvailabilityData {
  icu: { available: number; total: number };
  oxygen: { available: number; total: number };
  ventilator: { available: number; total: number };
  general: { available: number; total: number };
}

export interface BedAvailabilityUpdateData extends BedAvailabilityData {
  lastBedUpdate: Timestamp;
}


export interface Announcement {
  id: string; // Firestore document ID
  title: string;
  content: string;
  issuedAt: Timestamp | string; // ISO date string or Timestamp
  targetAudience: 'all_hospitals' | 'specific_hospitals'; // Add more if needed
  hospitalIds?: string[]; // if targetAudience is specific_hospitals
}

export interface PatientAdmission {
  id: string; // Firestore document ID
  hospitalId: string; // ID of the hospital where patient is admitted
  patientName: string; 
  admissionDate: Timestamp | string; 
  reason: string;
  bedType: 'icu' | 'oxygen' | 'ventilator' | 'general';
  status: 'admitted' | 'discharged' | 'transferred';
  notes?: string;
  recordedBy?: string; // UID of hospital staff who recorded it
}
