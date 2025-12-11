import { auth, provider, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const signUp = async (email, password, fullName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Use Firebase user.uid (was user.usr_id which is not standard)
  await setDoc(doc(db, "USERS", user.uid), {
    name: fullName,
    email,
    loginMethod: "email",
    createdAt: serverTimestamp(),
  });
  return user;
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  return user;
};

export const googleLogin = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await setDoc(
    // Use uid as the document id
    doc(db, "USERS", user.uid),
    {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      loginMethod: "google",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  return user;
};

/**
 * Check available credits for a user by calling the backend codegen API.
 * Returns the number of credits left, or null if the value couldn't be fetched.
 * @param {string} userId
 * @returns {Promise<number|null>}
 */
export const checkCreditAvailable = async (userId) => {
  if (!userId) return null;
  try {
    const base = 'http://localhost:5000/api/codegen';
    const res = await fetch(`${base}/user-stats?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      console.warn('checkCreditAvailable: backend returned', res.status);
      return null;
    }
    const data = await res.json();
    if (data && typeof data.credits_left === 'number') return data.credits_left;
    return null;
  } catch (err) {
    console.error('checkCreditAvailable error:', err);
    return null;
  }
};
