import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import type { Storage } from 'firebase-admin/storage';
import { getStorage } from 'firebase-admin/storage';
import { getWebServerEnv } from 'servers/environment.server.ts';
import type { FirebaseConfig } from './firebase.ts';

const env = getWebServerEnv();

let app: App;
let auth: Auth;
let storage: Storage;

if (getApps().length === 0) {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    app = initializeApp({
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE,
      credential: admin.credential.cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    app = initializeApp({
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE,
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
    FIREBASE_API_KEY: env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_EMULATOR_HOST: env.FIREBASE_AUTH_EMULATOR_HOST,
  };
}

export { auth, storage, getFirebaseClientConfig };
