import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';
import { createUser, getUser, updateUserLastLogin } from './db';

const googleProvider = new GoogleAuthProvider();
// Configure Google provider for better compatibility
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign up with email and password
export const signUp = async (email: string, password: string, fullName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName: fullName });
    
    // Store user data in Firestore (USERS collection)
    await createUser({
      uid: user.uid,
      name: fullName,
      email: user.email || '',
      photoURL: user.photoURL || '',
      loginMethod: 'email'
    });
    
    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    // Check if auth is properly initialized
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }
    
    console.log('Attempting email sign-in for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Email sign-in successful:', user.email);
    
    // Update last login timestamp
    await updateUserLastLogin(user.uid);
    
    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Check if auth is properly initialized
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }
    
    console.log('Attempting Google sign-in...');
    
    let result;
    let user;
    
    try {
      // Try popup first
      result = await signInWithPopup(auth, googleProvider);
      user = result.user;
      console.log('Google sign-in successful (popup):', user.email);
    } catch (popupError: any) {
      console.log('Popup failed, trying redirect...', popupError.message);
      
      // If popup fails due to domain issues, try redirect
      if (popupError.code === 'auth/unauthorized-domain' || 
          popupError.message.includes('unauthorized-domain')) {
        
        console.log('Using redirect method for Google sign-in...');
        await signInWithRedirect(auth, googleProvider);
        
        // This will cause a page redirect, so we won't reach the code below
        // The redirect result will be handled when the page loads
        throw new Error('Redirecting to Google sign-in...');
      } else {
        throw popupError;
      }
    }
    
    // Check if user exists in Firestore, if not create profile
    const existingUser = await getUser(user.uid);
    
    if (!existingUser) {
      // Create new user in USERS collection
      await createUser({
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        loginMethod: 'google'
      });
    } else {
      // Update last login for existing user
      await updateUserLastLogin(user.uid);
    }
    
    return user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Handle Google redirect result
export const handleGoogleRedirectResult = async (): Promise<User | null> => {
  try {
    if (!auth) {
      return null;
    }
    
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      console.log('Google sign-in successful (redirect):', user.email);
      
      // Check if user exists in Firestore, if not create profile
      const existingUser = await getUser(user.uid);
      
      if (!existingUser) {
        // Create new user in USERS collection
        await createUser({
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          loginMethod: 'google'
        });
      } else {
        // Update last login for existing user
        await updateUserLastLogin(user.uid);
      }
      
      return user;
    }
    return null;
  } catch (error: any) {
    console.error('Google redirect result error:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth || !auth.onAuthStateChanged) {
    console.warn('Firebase auth not initialized, using mock auth state');
    // Call callback with null user immediately for mock mode
    setTimeout(() => callback(null), 100);
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

// Get user profile data from Firestore
export const getUserProfile = async (userId: string) => {
  try {
    return await getUser(userId);
  } catch (error: any) {
    console.error('Get profile error:', error);
    throw new Error(error.message || 'Failed to get profile');
  }
};
