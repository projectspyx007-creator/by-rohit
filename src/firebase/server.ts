import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  if (!getApps().length) {
    return getSdks(initializeApp(firebaseConfig));
  } else {
    return getSdks(getApp());
  }
}

function getSdks(app: FirebaseApp) {
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
