
// Removed: import type { Timestamp, GeoPoint } from 'firebase/firestore';

// Using native Date or ISO string for timestamps now
// Using a simpler object for coordinates if needed, or just address string

export interface HospitalLocation {
  coordinates?: { latitude: number; longitude: number }; // Simple coordinate object
  address: string;
}

export interface Hospital {
  id: string; // Could be any unique string ID
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
  lastUpdated?: string | Date; // ISO string or Date object
  imageUrl?: string;
  rating?: number;
  dataAiHint?: string; 
}

export interface TreatmentLog {
  note: string;
  timestamp: string | Date; // ISO string or Date object
}

export interface Medication {
  name: string;
  dosage: string;
  schedule: string; 
}

export interface PatientRecord {
  id: string; 
  name: string;
  phone?: string;
  assignedHospital?: string; // hospitalId
  bedType?: 'icu' | 'oxygen' | 'ventilator' | 'general' | string;
  status: 'admitted' | 'discharged' | 'transferred' | string;
  treatmentLogs?: TreatmentLog[];
  medications?: Medication[];
}

export interface Feedback {
  id: string; 
  hospitalId: string;
  hospitalName?: string; 
  patientId?: string; // Could be a mock user ID or anonymous identifier
  name?: string; 
  email?: string; 
  rating: number; // 1-5
  comment: string;
  submittedAt: string | Date; // ISO string or Date object
}

export interface Complaint {
  id: string; 
  hospitalId?: string; 
  hospitalName?: string; 
  patientId?: string; 
  name?: string; 
  email?: string; 
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | string;
  createdAt: string | Date; // ISO string or Date object
  escalationLevel?: 'local' | 'state' | string;
  ticketId?: string;
}

export type UserRole = 'patient' | 'hospital_admin' | 'platform_admin' | 'health_department_official' | '';

export interface UserProfile {
  uid: string; // Mock UID
  name: string; 
  email: string | null;
  role: UserRole;
  hospitalId?: string; 
  profilePictureUrl?: string;
  createdAt: string | Date; // ISO string or Date object
}

export interface BedAvailabilityData {
  icu: { available: number; total: number };
  oxygen: { available: number; total: number };
  ventilator: { available: number; total: number };
  general: { available: number; total: number };
}

export interface HospitalBedUpdatePayload {
  beds: BedAvailabilityData;
  lastUpdated: string | Date; // ISO string or Date object
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  issuedAt: string | Date; // ISO string or Date object
  targetAudience: 'all_hospitals' | 'specific_hospitals';
  hospitalIds?: string[];
}
