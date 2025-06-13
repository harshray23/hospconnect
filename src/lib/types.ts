
import type { Timestamp, GeoPoint } from 'firebase/firestore';

export interface HospitalLocation {
  coordinates?: GeoPoint; // For Firestore GeoPoint
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
  lastUpdated?: Timestamp | string; // Firestore Timestamp or ISO string for updates
  imageUrl?: string;
  rating?: number;
  dataAiHint?: string; // For placeholder image generation
}

export interface TreatmentLog {
  note: string;
  timestamp: Timestamp | string; // Firestore Timestamp or ISO string
}

export interface Medication {
  name: string;
  dosage: string;
  schedule: string; // Could be more structured, e.g., { time: string, frequency: string }
}

export interface PatientRecord {
  id: string; // Firestore document ID (auto-generated when hospital creates record)
  name: string;
  phone?: string;
  assignedHospital?: string; // hospitalId
  bedType?: 'icu' | 'oxygen' | 'ventilator' | 'general' | string;
  status: 'admitted' | 'discharged' | 'transferred' | string;
  treatmentLogs?: TreatmentLog[];
  medications?: Medication[];
  // If patient is also a user, this could link to their UserProfile.id (Firebase Auth UID)
  // patientAuthId?: string; 
}

export interface Feedback {
  id: string; // Firestore document ID (auto-generated)
  hospitalId: string;
  hospitalName?: string; // Denormalized
  patientId: string; // Firebase Auth UID of the user submitting feedback
  rating: number; // 1-5
  comment: string;
  submittedAt: Timestamp | string; // Firestore Timestamp or ISO string for updates
}

export interface Complaint {
  id: string; // Firestore document ID (auto-generated)
  hospitalId?: string; // Optional
  hospitalName?: string; // Denormalized
  patientId: string; // Firebase Auth UID of the user submitting
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | string;
  createdAt: Timestamp | string; // Firestore Timestamp or ISO string for updates
  escalationLevel?: 'local' | 'state' | string;
  ticketId?: string;
}

export type UserRole = 'patient' | 'hospital' | 'admin' | 'platform_admin' | 'health_department_official';

export interface UserProfile {
  id: string; // Firebase Auth UID
  name: string;
  email?: string;
  role: UserRole;
  hospitalId?: string; // If role is 'hospital' (hospital admin)
}

export interface BedAvailabilityData {
  icu: { available: number; total: number };
  oxygen: { available: number; total: number };
  ventilator: { available: number; total: number };
  general: { available: number; total: number };
}

export interface HospitalBedUpdatePayload {
  beds: BedAvailabilityData;
  lastUpdated: Timestamp; // Explicitly serverTimestamp() on write
}

export interface Announcement {
  id: string; // Firestore document ID
  title: string;
  content: string;
  issuedAt: Timestamp | string; // ISO date string or Timestamp
  targetAudience: 'all_hospitals' | 'specific_hospitals';
  hospitalIds?: string[];
}
