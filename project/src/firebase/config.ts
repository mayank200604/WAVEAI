import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration - Wave Project (wave-ad270)
// Updated with correct API key from Firebase Console
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
let app;
let auth: any = null;
let db: any = null;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully with project:', firebaseConfig.projectId);
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  // Verify auth is working
  if (auth && typeof auth.onAuthStateChanged === 'function') {
    console.log('✅ Firebase Auth is ready');
  } else {
    throw new Error('Firebase Auth initialization failed');
  }
  
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error);
  
  // Re-throw the error instead of creating mocks for production
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { auth, db };

export default app;
