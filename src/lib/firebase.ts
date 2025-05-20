
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Example if you need auth

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // The problematic measurementId line has been removed.
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Only initialize Firebase if essential configuration is present
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
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
    'Configuração do Firebase está incompleta. O Firebase não será inicializado.'
  );
}

// const auth = app ? getAuth(app) : null; // Example if you need auth

export { db, app }; // Export 'app' if other Firebase services need it
