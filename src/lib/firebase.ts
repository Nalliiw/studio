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
  storageBucket: "nutritrack-lite-x6ffb.appspot.com", // Corrigido para .appspot.com, ajuste se o seu for diferente
  messagingSenderId: "235653291259",
  appId: "1:235653291259:web:83efefa74e5670b7d3645e"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

console.log("Tentando inicializar Firebase com config:", firebaseConfig);

// Initialize Firebase
// Check if Firebase has already been initialized
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase inicializado com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar Firebase com a configuração fornecida:", error);
    app = null; // Garante que app seja null se a inicialização falhar
  }
} else {
  app = getApps()[0]; // Usa o app já inicializado
  console.log("Firebase já estava inicializado.");
}

if (app) {
  try {
    db = getFirestore(app);
    console.log("Instância do Firestore obtida com sucesso.");
  } catch (error) {
    console.error("Erro ao obter instância do Firestore:", error);
    db = null; // Garante que db seja null se a obtenção da instância falhar
  }
} else {
    db = null;
    console.warn("App Firebase não foi inicializado, a instância do Firestore não pode ser criada.");
}

// Export the Firebase app instance and Firestore instance
export { app, db };
