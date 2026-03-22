import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import type { FirebaseConfig } from './firebase.ts';

const {
  FIREBASE_SERVICE_ACCOUNT,
  FIREBASE_PROJECT_ID,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_AUTH_EMULATOR_HOST,
} = getWebServerEnv();

let app: App;
let auth: Auth;

if (getApps().length === 0) {
  if (FIREBASE_SERVICE_ACCOUNT) {
    app = initializeApp({
      projectId: FIREBASE_PROJECT_ID,
      credential: admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    app = initializeApp({ projectId: FIREBASE_PROJECT_ID });
  }
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
}

function getFirebaseClientConfig(): FirebaseConfig {
  return {
    FIREBASE_API_KEY: FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_EMULATOR_HOST: FIREBASE_AUTH_EMULATOR_HOST,
  };
}

export { auth, getFirebaseClientConfig };
