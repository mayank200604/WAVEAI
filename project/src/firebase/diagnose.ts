/**
 * Diagnostic script to troubleshoot Firebase connection issues
 * Run this in your browser console or component
 */

import { auth, db } from './config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const diagnoseFirebase = async () => {
  console.log('🔍 Starting Firebase diagnostics...\n');

  // 1. Check Firebase initialization
  console.log('1️⃣ Checking Firebase initialization...');
  console.log('Auth instance:', auth ? '✅ OK' : '❌ FAILED');
  console.log('Firestore instance:', db ? '✅ OK' : '❌ FAILED');
  console.log('Project ID:', auth.app.options.projectId);

  // 2. Check authentication
  console.log('\n2️⃣ Checking authentication...');
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('✅ User is logged in');
    console.log('User ID:', currentUser.uid);
    console.log('Email:', currentUser.email);
  } else {
    console.log('❌ No user logged in');
    console.log('⚠️  You must be logged in to access Firestore data');
    return;
  }

  // 3. Check USERS collection
  console.log('\n3️⃣ Checking USERS collection...');
  try {
    const userRef = doc(db, 'USERS', currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      console.log('✅ User document exists');
      console.log('User data:', userSnap.data());
    } else {
      console.log('❌ User document does NOT exist');
      console.log('💡 Try logging out and logging back in to create the user document');
    }
  } catch (error: any) {
    console.error('❌ Error reading USERS collection:', error.message);
    if (error.code === 'permission-denied') {
      console.log('⚠️  PERMISSION DENIED - Check your Firestore security rules');
    }
  }

  // 4. Check CHAT_HISTORY collection
  console.log('\n4️⃣ Checking CHAT_HISTORY collection...');
  try {
    const chatRef = collection(db, 'CHAT_HISTORY');
    const chatSnap = await getDocs(chatRef);
    console.log(`Found ${chatSnap.size} chat messages`);
    
    if (chatSnap.size > 0) {
      console.log('Sample chat:', chatSnap.docs[0].data());
    } else {
      console.log('💡 No chat messages yet - this is normal if you haven\'t saved any');
    }
  } catch (error: any) {
    console.error('❌ Error reading CHAT_HISTORY:', error.message);
    if (error.code === 'permission-denied') {
      console.log('⚠️  PERMISSION DENIED - Check your Firestore security rules');
    }
  }

  // 5. Check GRAVEYARD collection
  console.log('\n5️⃣ Checking GRAVEYARD collection...');
  try {
    const graveyardRef = collection(db, 'GRAVEYARD');
    const graveyardSnap = await getDocs(graveyardRef);
    console.log(`Found ${graveyardSnap.size} ideas`);
    
    if (graveyardSnap.size > 0) {
      console.log('Sample idea:', graveyardSnap.docs[0].data());
    } else {
      console.log('💡 No ideas yet - this is normal if you haven\'t saved any');
    }
  } catch (error: any) {
    console.error('❌ Error reading GRAVEYARD:', error.message);
    if (error.code === 'permission-denied') {
      console.log('⚠️  PERMISSION DENIED - Check your Firestore security rules');
    }
  }

  // 6. Check PROJECTS collection
  console.log('\n6️⃣ Checking PROJECTS collection...');
  try {
    const projectsRef = collection(db, 'PROJECTS');
    const projectsSnap = await getDocs(projectsRef);
    console.log(`Found ${projectsSnap.size} projects`);
    
    if (projectsSnap.size > 0) {
      console.log('Sample project:', projectsSnap.docs[0].data());
    } else {
      console.log('💡 No projects yet - this is normal if you haven\'t created any');
    }
  } catch (error: any) {
    console.error('❌ Error reading PROJECTS:', error.message);
    if (error.code === 'permission-denied') {
      console.log('⚠️  PERMISSION DENIED - Check your Firestore security rules');
    }
  }

  // 7. Test write operation
  console.log('\n7️⃣ Testing write operation...');
  try {
    const { saveIdea } = await import('./db');
    const testIdeaId = await saveIdea({
      userId: currentUser.uid,
      title: 'Diagnostic Test Idea',
      description: 'This is a test to verify write permissions',
      tags: ['test']
    });
    console.log('✅ Write successful! Test idea ID:', testIdeaId);
    console.log('💡 Check Firebase Console to see the data');
  } catch (error: any) {
    console.error('❌ Write failed:', error.message);
    if (error.code === 'permission-denied') {
      console.log('⚠️  PERMISSION DENIED - Check your Firestore security rules');
      console.log('📋 Rules should be deployed from firestore.rules file');
    }
  }

  console.log('\n🏁 Diagnostics complete!');
  console.log('\n📊 Check Firebase Console:');
  console.log('https://console.firebase.google.com/project/wave-ad270/firestore');
};

// Quick permission check
export const checkPermissions = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ Not logged in');
    return false;
  }

  try {
    // Try to read user document
    const userRef = doc(db, 'USERS', user.uid);
    await getDoc(userRef);
    console.log('✅ Read permissions OK');
    return true;
  } catch (error: any) {
    console.error('❌ Permission error:', error.message);
    console.log('\n🔧 To fix:');
    console.log('1. Go to Firebase Console > Firestore > Rules');
    console.log('2. Copy rules from firestore.rules file');
    console.log('3. Click Publish');
    return false;
  }
};
