import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth, type Auth } from 'firebase/auth'; // Descomente se precisar de Auth

// --- Configuração para o Projeto Firebase Principal (Project A) ---
const firebaseConfigProjectA: { [key: string]: string | undefined } = {};
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  firebaseConfigProjectA.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
}
if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
  firebaseConfigProjectA.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
}
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  firebaseConfigProjectA.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  firebaseConfigProjectA.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
}
if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
  firebaseConfigProjectA.messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
  firebaseConfigProjectA.appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
}

let app: FirebaseApp | null = null; // App padrão (Project A)
let db: Firestore | null = null; // Firestore do app padrão (Project A)
// let auth: Auth | null = null; // Auth do app padrão (Project A)

if (firebaseConfigProjectA.apiKey && firebaseConfigProjectA.projectId) {
  if (!getApps().find(app => app.name === '[DEFAULT]')) {
    try {
      app = initializeApp(firebaseConfigProjectA as any); // Default app
      db = getFirestore(app);
      // auth = getAuth(app);
      console.log("Firebase Project A (default) inicializado com sucesso.");
    } catch (error) {
      console.error("Erro ao inicializar Firebase Project A (default):", error);
    }
  } else {
    app = getApps().find(app => app.name === '[DEFAULT]')!;
    db = getFirestore(app);
    // auth = getAuth(app);
    console.log("Firebase Project A (default) já estava inicializado.");
  }
} else {
  console.warn(
    'Configuração essencial do Firebase Project A (apiKey e projectId) está ausente. O app Firebase padrão não será inicializado.'
  );
}

// --- Configuração para o Segundo Projeto Firebase (Project B) ---
const firebaseConfigProjectB: { [key: string]: string | undefined } = {};
if (process.env.NEXT_PUBLIC_PROJECT_B_API_KEY) {
  firebaseConfigProjectB.apiKey = process.env.NEXT_PUBLIC_PROJECT_B_API_KEY;
}
if (process.env.NEXT_PUBLIC_PROJECT_B_AUTH_DOMAIN) {
  firebaseConfigProjectB.authDomain = process.env.NEXT_PUBLIC_PROJECT_B_AUTH_DOMAIN;
}
if (process.env.NEXT_PUBLIC_PROJECT_B_PROJECT_ID) {
  firebaseConfigProjectB.projectId = process.env.NEXT_PUBLIC_PROJECT_B_PROJECT_ID;
}
if (process.env.NEXT_PUBLIC_PROJECT_B_STORAGE_BUCKET) {
  firebaseConfigProjectB.storageBucket = process.env.NEXT_PUBLIC_PROJECT_B_STORAGE_BUCKET;
}
if (process.env.NEXT_PUBLIC_PROJECT_B_MESSAGING_SENDER_ID) {
  firebaseConfigProjectB.messagingSenderId = process.env.NEXT_PUBLIC_PROJECT_B_MESSAGING_SENDER_ID;
}
if (process.env.NEXT_PUBLIC_PROJECT_B_APP_ID) {
  firebaseConfigProjectB.appId = process.env.NEXT_PUBLIC_PROJECT_B_APP_ID;
}

let appProjectB: FirebaseApp | null = null;
let dbProjectB: Firestore | null = null;
// let authProjectB: Auth | null = null;

const projectBAppName = "ProjectBApp"; // Nome exclusivo para a instância do app do Project B

if (firebaseConfigProjectB.apiKey && firebaseConfigProjectB.projectId) {
  const existingProjectBApp = getApps().find(app => app.name === projectBAppName);
  if (!existingProjectBApp) {
    try {
      appProjectB = initializeApp(firebaseConfigProjectB as any, projectBAppName);
      dbProjectB = getFirestore(appProjectB);
      // authProjectB = getAuth(appProjectB);
      console.log("Firebase Project B inicializado com sucesso com o nome:", projectBAppName);
    } catch (error) {
      console.error("Erro ao inicializar Firebase Project B:", error);
    }
  } else {
    appProjectB = existingProjectBApp;
    dbProjectB = getFirestore(appProjectB);
    // authProjectB = getAuth(appProjectB);
    console.log("Firebase Project B já estava inicializado com o nome:", projectBAppName);
  }
} else {
  console.warn(
    'Configuração essencial do Firebase Project B (apiKey e projectId) está ausente. O app Firebase secundário não será inicializado.'
  );
}

export { 
  app, // App padrão (Project A)
  db,  // Firestore do Project A
  // auth, // Auth do Project A
  appProjectB, 
  dbProjectB, // Firestore do Project B
  // authProjectB // Auth do Project B
};
