import type { App } from 'firebase-admin/app';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import { config } from '../config';

let app: App;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp({
    projectId: config.FIREBASE_PROJECT_ID,
    storageBucket: config.FIREBASE_STORAGE,
  });
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
}

export { auth };
