
// FIREBASE IS NO LONGER IN USE IN THIS PROJECT.
// The 'db' and 'auth' exports are mocked to prevent widespread import errors
// during the refactoring process. They do not connect to any Firebase services.

// Original Firebase imports (commented out):
// import { initializeApp, getApp, getApps } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// Mocked Firebase app, db, and auth
const app = null; // Or a mock app object if needed by any lingering type checks
const db = null;  // Or a mock db object
const auth = null; // Or a mock auth object

// Diagnostic log for API key (no longer relevant as Firebase is removed)
// if (typeof window !== 'undefined') {
//   console.log("Firebase.ts (Client-side): NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or UNDEFINED");
// } else {
//   console.log("Firebase.ts (Server-side/Build): NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or UNDEFINED");
// }

export { app, db, auth };
