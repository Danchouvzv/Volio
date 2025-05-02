import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Setup offline persistance for Firestore
if (typeof window !== 'undefined') {
  // Enable offline persistence
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support persistence
      console.log('Firebase persistence not supported in this browser');
    }
  });
}

// Connect to emulators in development mode
if (process.env.NODE_ENV === 'development') {
  try {
    // Check if we're not already connected to emulators
    // @ts-ignore - these properties exist but might not be in the type definitions
    if (typeof window !== 'undefined' && !window.EMULATORS_CONNECTED) {
      // @ts-ignore
      window.EMULATORS_CONNECTED = true;
      
      // For local development without Firebase emulators, 
      // we'll set up mock data in context providers instead
      console.log('Development mode active - offline data will be used');
    }
  } catch (error) {
    console.error('Failed to set up development mode:', error);
  }
}


export { app, auth, db, storage };
