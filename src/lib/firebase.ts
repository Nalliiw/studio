// src/lib/firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from "firebase/storage"; // Adicionado para Firebase Storage

// Your web app's Firebase configuration (as provided by the user)
// IMPORTANT: Replace with your actual Firebase configuration values
const firebaseConfig = {
  apiKey: "AIzaSyAxzIqz02q90ja_Z-b5nL_O2VoNo30sLT0",
  authDomain: "nutritrack-lite-x6ffb.firebaseapp.com",
  projectId: "nutritrack-lite-x6ffb",
  storageBucket: "nutritrack-lite-x6ffb.appspot.com", // Corrigido para o formato comum .appspot.com
  messagingSenderId: "235653291259",
  appId: "1:235653291259:web:83efefa74e5670b7d3645e"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null; // Adicionada variável para storage

console.log("Tentando inicializar Firebase com config:", firebaseConfig);

// Initialize Firebase
// Check if Firebase has already been initialized
if (!getApps().length) {
  try {
    // Validate essential config keys before attempting to initialize
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("Configuração essencial do Firebase (apiKey ou projectId) está faltando. Firebase NÃO será inicializado.");
      throw new Error("Configuração essencial do Firebase (apiKey ou projectId) está faltando.");
    }
    app = initializeApp(firebaseConfig);
    console.log("Firebase inicializado com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar Firebase com a configuração fornecida:", error);
    app = null; // Ensure app is null if initialization fails
  }
} else {
  app = getApps()[0]; // Use the already initialized app
  console.log("Firebase já estava inicializado.");
}

if (app) {
  try {
    db = getFirestore(app);
    console.log("Instância do Firestore obtida com sucesso.");
  } catch (error) {
    console.error("Erro ao obter instância do Firestore:", error);
    db = null; // Ensure db is null if getting instance fails
  }
  try {
    storage = getStorage(app); // Inicializa o Firebase Storage
    console.log("Instância do Firebase Storage obtida com sucesso.");
  } catch (error) {
    console.error("Erro ao obter instância do Firebase Storage:", error);
    storage = null; // Ensure storage is null if getting instance fails
  }
} else {
    db = null; // Ensure db is null if app is not initialized
    storage = null; // Ensure storage is null if app is not initialized
    console.warn("App Firebase não foi inicializado, as instâncias do Firestore e Storage não podem ser criadas.");
}

// Export the Firebase app instance, Firestore instance, and Storage instance
export { app, db, storage };
