import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

type FirebaseConfig = {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_AUTH_EMULATOR_HOST: string;
};

export const initializeFirebase = (config?: FirebaseConfig) => {
  if (!config || getApps().length) return;

  const app = initializeApp({
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
  });

  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${config.FIREBASE_AUTH_EMULATOR_HOST}`);

  return app;
};
