
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Example if you need auth

// Dynamically construct the config object
const firebaseConfig: { [key: string]: string | undefined } = {};

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  firebaseConfig.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
}
if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
  firebaseConfig.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
}
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  firebaseConfig.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  firebaseConfig.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
}
if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
  firebaseConfig.messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
  firebaseConfig.appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
}
// Explicitly DO NOT include measurementId in this dynamic build based on your error reports
// to avoid any parsing issues. If it's needed AND defined, it can be added carefully:
// if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
// firebaseConfig.measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
// }


let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Only initialize Firebase if essential configuration is present
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    try {
      // The Firebase SDK will perform its own validation on the config object.
      // Our check for apiKey and projectId is a preliminary guard.
      app = initializeApp(firebaseConfig as any); // Using 'as any' for pragmatic dynamic config
      db = getFirestore(app);
    } catch (error) {
      console.error("Erro ao inicializar o Firebase:", error);
      // Keep app and db as null if initialization fails
      app = null;
      db = null;
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
  }
} else {
  console.warn(
    'Configuração essencial do Firebase (apiKey e projectId) está incompleta ou ausente. O Firebase não será inicializado.'
  );
}

// const auth = app ? getAuth(app) : null; // Example if you need auth

export { db, app }; // Export 'app' if other Firebase services need it
