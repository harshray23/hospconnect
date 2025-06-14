
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
}

export interface Feedback {
  id: string; // Firestore document ID (auto-generated)
  hospitalId: string;
  hospitalName?: string; // Denormalized
  // patientId might now refer to an anonymous identifier or be optional if users are not logged in
  patientId?: string; // Firebase Auth UID of the user submitting feedback (if they choose to identify, or if this is admin-entered)
  name?: string; // Optional: name of person giving feedback if not logged in
  email?: string; // Optional: email of person giving feedback if not logged in
  rating: number; // 1-5
  comment: string;
  submittedAt: Timestamp | string;
}

export interface Complaint {
  id: string; // Firestore document ID (auto-generated)
  hospitalId?: string; // Optional
  hospitalName?: string; // Denormalized
  // patientId might now refer to an anonymous identifier or be optional
  patientId?: string; // Firebase Auth UID of the user submitting (if they choose to identify, or if this is admin-entered)
  name?: string; // Optional: name of person making complaint if not logged in
  email?: string; // Optional: email of person making complaint if not logged in
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | string;
  createdAt: Timestamp | string;
  escalationLevel?: 'local' | 'state' | string;
  ticketId?: string;
}

// Role 'patient' might be deprecated for login, but kept if hospitals manage "patient" type users in their system.
// For login purposes, only 'hospital_admin' and 'platform_admin' are primary.
export type UserRole = 'patient' | 'hospital_admin' | 'platform_admin' | 'health_department_official' | '';

export interface UserProfile {
  uid: string; // Firebase Auth UID
  name: string; // For hospital_admin, this is the contact person's name.
  email: string | null;
  role: UserRole;
  hospitalId?: string; // If role is 'hospital_admin', this links to the hospital (e.g., hospital's name or a dedicated ID)
  profilePictureUrl?: string;
  createdAt: Timestamp | string;
}

export interface BedAvailabilityData {
  icu: { available: number; total: number };
  oxygen: { available: number; total: number };
  ventilator: { available: number; total: number };
  general: { available: number; total: number };
}

export interface HospitalBedUpdatePayload {
  beds: BedAvailabilityData;
  lastUpdated: Timestamp;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  issuedAt: Timestamp | string;
  targetAudience: 'all_hospitals' | 'specific_hospitals';
  hospitalIds?: string[];
}
