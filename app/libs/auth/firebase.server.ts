import { credential } from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import type { Storage } from 'firebase-admin/storage';
import { getStorage } from 'firebase-admin/storage';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import { config } from '../config';

let app: App;
let auth: Auth;
let storage: Storage;

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    app = initializeApp({
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE,
      credential: credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    app = initializeApp({
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE,
    });
  }
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  app = getApp();
  auth = getAuth(app);
  storage = getStorage(app);
}

export { auth, storage };
