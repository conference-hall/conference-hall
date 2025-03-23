import { getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from 'firebase/auth';
import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { GoogleIcon } from '~/design-system/icons/google-icon.tsx';
import { XIcon } from '~/design-system/icons/x-icon.tsx';

export type ProviderId = 'google.com' | 'github.com' | 'twitter.com';
export type ProviderInfo = { id: ProviderId; label: string; icon: React.ComponentType<{ className?: string }> };

export const PROVIDERS: Array<ProviderInfo> = [
  { id: 'google.com', label: 'Google', icon: GoogleIcon },
  { id: 'github.com', label: 'GitHub', icon: GitHubIcon },
  { id: 'twitter.com', label: 'X.com', icon: XIcon },
];

type FirebaseConfig = {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_AUTH_EMULATOR_HOST?: string;
  USE_EMULATORS: boolean;
};

export function initializeFirebaseClient(config?: FirebaseConfig) {
  if (!config || getApps().length) return;

  const app = initializeApp({
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
  });

  const auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);

  if (config.USE_EMULATORS) {
    connectAuthEmulator(auth, `http://${config.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
  }
}

export function getClientAuth() {
  const app = getApps()[0];
  return getAuth(app);
}
