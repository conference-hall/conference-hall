import { getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from 'firebase/auth';

export type FirebaseConfig = {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_AUTH_EMULATOR_HOST?: string;
};

export function initializeFirebaseClient(locale: string, config?: FirebaseConfig) {
  if (!config || getApps().length) return;

  const app = initializeApp({
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
  });

  const auth = getAuth(app);
  auth.languageCode = locale;
  setPersistence(auth, browserLocalPersistence);

  if (config.FIREBASE_AUTH_EMULATOR_HOST) {
    connectAuthEmulator(auth, `http://${config.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
  }
}

export function getClientAuth() {
  const app = getApps()[0];
  return getAuth(app);
}
