// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile 
} from 'firebase/auth';

// Your web app's Firebase configuration - Wave Project (wave-ad270)
// NOTE: This should match the config in project/src/firebase/config.ts
const firebaseConfig = {
  apiKey: "AIzaSyCfKt0KKd4zLdxBWwZe5XY8Lp8Po8dMz8s",
  authDomain: "wave-ad270.firebaseapp.com",
  projectId: "wave-ad270",
  storageBucket: "wave-ad270.firebasestorage.app",
  messagingSenderId: "568409539106",
  appId: "1:568409539106:web:db3052bb3a55135e69807b",
  measurementId: "G-38B1ZXHBJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signUp = async (email, password, fullName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: fullName });
  return userCredential.user;
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const googleLogin = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};
