
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Descomente se precisar do Firebase Auth

// Construir dinamicamente o objeto de configuração
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
// O measurementId é opcional e pode ser adicionado se necessário e definido
if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
 firebaseConfig.measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
// let auth: Auth | null = null; // Descomente se precisar do Firebase Auth

// Só inicializa o Firebase se as configurações essenciais estiverem presentes
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    try {
      console.log("Inicializando Firebase com a configuração:", firebaseConfig);
      app = initializeApp(firebaseConfig as any); // Usando 'as any' para a configuração dinâmica
      db = getFirestore(app);
      // auth = getAuth(app); // Descomente se precisar do Firebase Auth
      console.log("Firebase inicializado com sucesso.");
    } catch (error) {
      console.error("Erro ao inicializar o Firebase:", error);
      // Deixar app e db como null se a inicialização falhar
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    // auth = getAuth(app); // Descomente se precisar do Firebase Auth
    console.log("Firebase já estava inicializado.");
  }
} else {
  console.warn(
    'Configuração essencial do Firebase (apiKey e projectId) está ausente no .env. O Firebase não será inicializado. Verifique suas variáveis de ambiente NEXT_PUBLIC_FIREBASE_...'
  );
}

export { db, app }; // Exporte auth também se estiver usando
