
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASaPbn_C9TY0mwjCtQZJt6aOAxLNGKdHA",
  authDomain: "hospconnect-drjo0.firebaseapp.com",
  projectId: "hospconnect-drjo0",
  storageBucket: "hospconnect-drjo0.appspot.com", // Corrected from .firebasestorage.app
  messagingSenderId: "203104311053",
  appId: "1:203104311053:web:94b2d7123c48d168068244"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
