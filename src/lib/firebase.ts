// Firebase está intencionalmente desconectado para permitir o desenvolvimento do frontend.
// Para reconectar, garanta que seu arquivo .env tenha as variáveis de ambiente corretas do Firebase
// e então atualize este arquivo para inicializar o Firebase.

import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

const app: FirebaseApp | null = null;
const db: Firestore | null = null;

console.warn(
  'ATENÇÃO: Firebase está intencionalmente desconectado. ' +
  'Funcionalidades de backend (Firestore, etc.) não estarão ativas. ' +
  'Ignore erros relacionados à ausência de `db` ou `app` do Firebase nos serviços, pois o foco agora é o frontend.'
);

export { db, app };
