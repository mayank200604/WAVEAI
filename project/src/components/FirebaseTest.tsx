import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function FirebaseTest() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setStatus('Testing Firebase connection...');

    try {
      // Test 1: Check Firebase initialization
      if (!auth || !db) {
        throw new Error('Firebase not initialized properly');
      }
      setStatus('✅ Firebase initialized successfully');

      // Test 2: Test Firestore connection
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { 
        timestamp: new Date(),
        test: 'Firebase connection test'
      });
      
      const docSnap = await getDoc(testDoc);
      if (!docSnap.exists()) {
        throw new Error('Firestore write/read test failed');
      }
      setStatus('✅ Firestore connection working');

      // Test 3: Test Auth configuration
      const testEmail = 'test@firebasetest.com';
      const testPassword = 'testpassword123';
      
      try {
        // Try to create a test user
        await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        setStatus('✅ Auth working - Test user created');
        
        // Clean up - delete the test user
        if (auth.currentUser) {
          await auth.currentUser.delete();
          setStatus('✅ All Firebase services working correctly!');
        }
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          // Try to sign in instead
          await signInWithEmailAndPassword(auth, testEmail, testPassword);
          setStatus('✅ Auth working - Signed in with existing test user');
          
          if (auth.currentUser) {
            await auth.currentUser.delete();
            setStatus('✅ All Firebase services working correctly!');
          }
        } else {
          throw authError;
        }
      }

    } catch (error: any) {
      console.error('Firebase test error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDomainAuth = () => {
    setStatus(`Current domain: ${window.location.origin}`);
    setStatus(prev => prev + '\n\nTo fix auth/unauthorized-domain:');
    setStatus(prev => prev + '\n1. Go to Firebase Console');
    setStatus(prev => prev + '\n2. Authentication → Settings → Authorized domains');
    setStatus(prev => prev + `\n3. Add: ${window.location.hostname}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Firebase Configuration Test
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={testFirebaseConnection}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
        
        <button
          onClick={testDomainAuth}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Check Domain Configuration
        </button>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Status:</h3>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {status}
          </pre>
        </div>
        
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
            Quick Fixes:
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Add <code>{window.location.hostname}</code> to Firebase authorized domains</li>
            <li>• Enable Email/Password authentication in Firebase Console</li>
            <li>• Enable Google authentication if using Google sign-in</li>
            <li>• Check Firestore security rules allow authenticated users</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
