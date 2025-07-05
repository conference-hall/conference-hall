import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import type { Storage } from 'firebase-admin/storage';
import { getStorage } from 'firebase-admin/storage';

let app: App;
let auth: Auth;
let storage: Storage;

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE,
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE,
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
