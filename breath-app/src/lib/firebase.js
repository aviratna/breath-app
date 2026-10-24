import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase web config for project breath-17213. These values identify the project and are
// meant to ship inside the app; access is controlled by Firestore security rules
// (see /firebase/firestore.rules), not by keeping this secret.
const firebaseConfig = {
  apiKey: 'AIzaSyBu26g29oVjswOdabRoBSZS-Mtx7AKBGTE',
  authDomain: 'breath-17213.firebaseapp.com',
  projectId: 'breath-17213',
  storageBucket: 'breath-17213.firebasestorage.app',
  messagingSenderId: '910229099034',
  appId: '1:910229099034:web:92bb5c63f69734245b77a3',
};

const isFirstInit = getApps().length === 0;
export const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// Keep the anonymous sign-in across launches: AsyncStorage on phones, localStorage on web.
export const auth = isFirstInit
  ? initializeAuth(app, {
      persistence: Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);

// React Native's networking doesn't support Firestore's default streaming transport.
export const db = initializeFirestore(app, Platform.OS === 'web' ? {} : { experimentalForceLongPolling: true });

// Development only: EXPO_PUBLIC_FIREBASE_EMULATOR=<host> points the app at local emulators
// (auth on :9099, Firestore on :8089) instead of the live project.
const emulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR;
if (emulatorHost && isFirstInit) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorHost, 8089);
}
