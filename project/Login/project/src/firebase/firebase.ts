import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User
} from 'firebase/auth';

// NOTE: This file uses environment variables but may not be the active config.
// The main app uses: project/src/firebase/config.ts
// If using this file, ensure .env contains wave-ad270 project credentials:
// FIREBASE_API_KEY=AIzaSyCfKt0KKd4zLdxBWwZe5XY8Lp8Po8dMz8s
// FIREBASE_AUTH_DOMAIN=wave-ad270.firebaseapp.com
// FIREBASE_PROJECT_ID=wave-ad270
// FIREBASE_STORAGE_BUCKET=wave-ad270.firebasestorage.app
// FIREBASE_MESSAGING_SENDER_ID=568409539106
// FIREBASE_APP_ID=1:568409539106:web:db3052bb3a55135e69807b
// FIREBASE_MEASUREMENT_ID=G-38B1ZXHBJX

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signUp = async (email: string, password: string, fullName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const googleLogin = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};