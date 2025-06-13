
import type { Timestamp } from 'firebase/firestore';

export interface HospitalLocation {
  lat?: number; // Optional as per initial user request, but good for maps
  lng?: number; // Optional
  address: string;
}

export interface Hospital {
  id: string; // Firestore document ID
  name: string;
  location: HospitalLocation;
  contact?: string;
  specialties: string[];
  beds: {
    icu: { total: number; available: number };
    general: { total: number; available: number };
    oxygen: { total: number; available: number };
    ventilator: { total: number; available: number };
  };
  emergencyAvailable?: boolean;
  lastUpdated?: Timestamp | string; // Firestore Timestamp or ISO string
  imageUrl?: string; // Retained from previous, useful for UI
  // dataAiHint, city, distance, services removed as not in new schema
  rating?: number; // Retained from previous, useful for UI
}

export interface TreatmentLog {
  note: string;
  timestamp: Timestamp | string;
}

export interface Medication {
  name: string;
  dosage: string;
  schedule: string;
}

// Replaces PatientAdmission, aligns with 'patients' collection schema
export interface PatientRecord {
  id: string; // Document ID, ideally Firebase Auth UID of the patient
  name: string;
  phone?: string;
  assignedHospital?: string; // hospitalId
  bedType?: 'icu' | 'oxygen' | 'ventilator' | 'general' | string; // Allow string for flexibility
  status: 'admitted' | 'discharged' | 'transferred' | string; // Allow string for flexibility
  treatmentLogs?: TreatmentLog[];
  medications?: Medication[];
  // Fields like 'reason' from old PatientAdmission could be the first treatmentLog.note
  // 'recordedBy' removed as not in new schema
}

export interface Feedback {
  id: string; // Firestore document ID
  hospitalId: string;
  hospitalName?: string; // Denormalized for easier display
  patientId: string; // Firebase Auth UID of the patient or user submitting
  rating: number; // 1-5
  comment: string; // Renamed from comments
  submittedAt: Timestamp | string; // Firestore Timestamp or ISO string
}

export interface Complaint {
  id: string; // Firestore document ID
  hospitalId?: string; // Optional as per schema (can be general)
  hospitalName?: string; // Denormalized
  patientId: string; // Firebase Auth UID of the patient or user submitting
  issue: string; // Renamed from description
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | string; // Allow string
  createdAt: Timestamp | string; // Firestore Timestamp or ISO string
  escalationLevel?: 'local' | 'state' | string; // Optional
  ticketId?: string; // Optional
  // escalationNotes from previous implementation can be part of a more detailed status tracking or a separate log if needed
}

export type UserRole = 'patient' | 'hospital' | 'admin' | 'platform_admin' | 'health_department_official'; // 'hospital' instead of 'hospital_admin' to match schema

export interface UserProfile {
  id: string; // Firebase Auth UID
  name: string;
  email?: string; // Useful to store
  role: UserRole;
  hospitalId?: string; // If role is 'hospital'
}


// This type is for the form on hospital/beds page, actual storage is within Hospital type
export interface BedAvailabilityData {
  icu: { available: number; total: number };
  oxygen: { available: number; total: number };
  ventilator: { available: number; total: number };
  general: { available: number; total: number };
}

// This is for the update operation, ensuring lastUpdated is part of it
export interface HospitalBedUpdatePayload {
  beds: BedAvailabilityData;
  lastUpdated: Timestamp; // serverTimestamp()
}


export interface Announcement {
  id: string; // Firestore document ID
  title: string;
  content: string;
  issuedAt: Timestamp | string; // ISO date string or Timestamp
  targetAudience: 'all_hospitals' | 'specific_hospitals'; // Add more if needed
  hospitalIds?: string[]; // if targetAudience is specific_hospitals
}
