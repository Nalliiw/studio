
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

// Firebase está intencionalmente desconectado para focar no frontend.
// Nenhuma inicialização será tentada.

console.warn(
  'ATENÇÃO: Firebase está intencionalmente desconectado. ' +
  'Funcionalidades de backend (Firestore, etc.) não estarão ativas. ' +
  'Se este erro persistir, substitua manualmente o conteúdo deste arquivo e reinicie o servidor.'
);

const app: FirebaseApp | null = null;
const db: Firestore | null = null;

export { db, app };
