// src/lib/firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration (as provided by the user)
const firebaseConfig = {
  apiKey: "AIzaSyAxzIqz02q90ja_Z-b5nL_O2VoNo30sLT0",
  authDomain: "nutritrack-lite-x6ffb.firebaseapp.com",
  projectId: "nutritrack-lite-x6ffb",
  storageBucket: "nutritrack-lite-x6ffb.appspot.com", // Confirme este valor no seu console Firebase
  messagingSenderId: "235653291259",
  appId: "1:235653291259:web:83efefa74e5670b7d3645e"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

console.log("Tentando inicializar Firebase com config:", firebaseConfig);

if (!getApps().length) {
  try {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("Configuração essencial do Firebase (apiKey ou projectId) está faltando. Firebase NÃO será inicializado.");
      throw new Error("Configuração essencial do Firebase (apiKey ou projectId) está faltando.");
    }
    app = initializeApp(firebaseConfig);
    console.log("Firebase inicializado com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar Firebase com a configuração fornecida:", error);
    app = null;
  }
} else {
  app = getApps()[0];
  console.log("Firebase já estava inicializado.");
}

if (app) {
  try {
    db = getFirestore(app);
    console.log("Instância do Firestore obtida com sucesso.");
  } catch (error) {
    console.error("Erro ao obter instância do Firestore:", error);
    db = null;
  }
  try {
    storage = getStorage(app);
    console.log("Instância do Firebase Storage obtida com sucesso.");
    const configuredBucket = storage.app.options.storageBucket;
    console.log('Firebase Storage configurado para o bucket:', configuredBucket);
    if (configuredBucket !== firebaseConfig.storageBucket) {
        console.warn(`AVISO: O bucket do Storage configurado (${configuredBucket}) é diferente do firebaseConfig.storageBucket (${firebaseConfig.storageBucket}). Verifique sua configuração.`);
    }
  } catch (error) {
    console.error("Erro ao obter instância do Firebase Storage:", error);
    storage = null;
  }
} else {
    db = null;
    storage = null;
    console.warn("App Firebase não foi inicializado, as instâncias do Firestore e Storage não podem ser criadas.");
}

export { app, db, storage };