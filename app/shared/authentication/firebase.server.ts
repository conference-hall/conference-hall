import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Storage } from 'firebase-admin/storage';
import admin from 'firebase-admin';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import type { FirebaseConfig } from './firebase.ts';
import { getWebServerEnv } from '../../../servers/environment.server.ts';

const {
  FIREBASE_SERVICE_ACCOUNT,
  FIREBASE_PROJECT_ID,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_STORAGE,
  FIREBASE_AUTH_EMULATOR_HOST,
} = getWebServerEnv();

let app: App;
let auth: Auth;
let storage: Storage;

if (getApps().length === 0) {
  if (FIREBASE_SERVICE_ACCOUNT) {
    app = initializeApp({
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE,
      credential: admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    app = initializeApp({
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE,
    });
  }
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  app = getApp();
  auth = getAuth(app);
  storage = getStorage(app);
}

function getFirebaseClientConfig(): FirebaseConfig {
  return {
    FIREBASE_API_KEY: FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_EMULATOR_HOST: FIREBASE_AUTH_EMULATOR_HOST,
  };
}

export { auth, storage, getFirebaseClientConfig };
