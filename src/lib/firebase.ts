// src/lib/firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration (as provided by the user)
const firebaseConfig = {
  apiKey: "AIzaSyAxzIqz02q90ja_Z-b5nL_O2VoNo30sLT0",
  authDomain: "nutritrack-lite-x6ffb.firebaseapp.com",
  projectId: "nutritrack-lite-x6ffb",
  storageBucket: "nutritrack-lite-x6ffb.appspot.com", // Corrected common typo: .appspot.com
  messagingSenderId: "235653291259",
  appId: "1:235653291259:web:83efefa74e5670b7d3645e"
};

let app: FirebaseApp;
let db: Firestore;

// Initialize Firebase
// Check if Firebase has already been initialized
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully with provided config.");
  } catch (error) {
    console.error("Error initializing Firebase with provided config:", error);
    // @ts-ignore
    app = null; // Ensure app is null if initialization fails
  }
} else {
  app = getApps()[0]; // Use the already initialized app
  console.log("Firebase was already initialized.");
}

// @ts-ignore
if (app) {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.error("Error getting Firestore instance:", error);
    // @ts-ignore
    db = null; // Ensure db is null if getting instance fails
  }
} else {
    // @ts-ignore
    db = null; 
    console.warn("Firebase app was not initialized, Firestore instance cannot be created.");
}

// Export the Firebase app instance and Firestore instance
export { app, db };
