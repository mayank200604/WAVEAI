# 🔧 Troubleshooting: Data Not Visible

## Common Issues & Solutions

### Issue 1: Not Logged In ❌
**Symptom:** Can't see any data in Firebase Console or app

**Solution:**
1. Make sure you're logged in to your app
2. Check browser console for authentication status
3. Run this in console:
```javascript
import { getCurrentUser } from '@/firebase/auth';
console.log('Current user:', getCurrentUser());
```

---

### Issue 2: Security Rules Not Deployed ❌
**Symptom:** "Permission denied" errors in console

**Solution:**
1. Go to: https://console.firebase.google.com/project/wave-ad270/firestore/rules
2. Make sure rules look like this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /USERS/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /CHAT_HISTORY/{chatId} {
      allow read, create, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    // ... etc
  }
}
```
3. Click **"Publish"** button
4. Wait 1-2 minutes for rules to propagate

---

### Issue 3: No Data Created Yet ✅
**Symptom:** Collections don't appear in Firebase Console

**This is NORMAL!** Firestore collections only appear after you create the first document.

**Solution:** Create some test data:

```typescript
// In your browser console or component:
import { diagnoseFirebase } from '@/firebase/diagnose';
diagnoseFirebase();
```

This will:
- Check all connections
- Create a test idea
- Show you exactly what's wrong

---

### Issue 4: Wrong Collection Names ❌
**Symptom:** Data saved but can't see it

**Check:** Collection names must be UPPERCASE:
- ✅ `USERS` (correct)
- ❌ `users` (wrong)
- ✅ `CHAT_HISTORY` (correct)
- ❌ `chat_history` (wrong)

---

### Issue 5: User Document Not Created ❌
**Symptom:** Login works but no user in USERS collection

**Solution:**
1. Log out of your app
2. Log back in (this will trigger `createUser()`)
3. Check Firebase Console for USERS collection

---

## 🔍 Run Diagnostics

### Method 1: In Browser Console

1. Open your app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
```javascript
import { diagnoseFirebase } from './firebase/diagnose';
diagnoseFirebase();
```

### Method 2: In a Component

Add this to any component:

```typescript
import { useEffect } from 'react';
import { diagnoseFirebase } from '@/firebase/diagnose';

function MyComponent() {
  useEffect(() => {
    diagnoseFirebase();
  }, []);
  
  return <div>Check console for diagnostics</div>;
}
```

---

## 📊 Check Firebase Console

1. **Go to Firestore:**
   https://console.firebase.google.com/project/wave-ad270/firestore

2. **What you should see:**
   - `USERS` collection (after login)
   - `CHAT_HISTORY` collection (after saving a chat)
   - `GRAVEYARD` collection (after saving an idea)
   - `PROJECTS` collection (after creating a project)

3. **If collections are empty:**
   - This is normal if you haven't created data yet
   - Run the diagnostic script to create test data

---

## 🧪 Quick Test

Copy this into your browser console:

```javascript
// Test 1: Check if logged in
const user = auth.currentUser;
console.log('Logged in:', user ? 'YES ✅' : 'NO ❌');
console.log('User ID:', user?.uid);

// Test 2: Try to save an idea
import { saveIdea } from './firebase';
if (user) {
  saveIdea({
    userId: user.uid,
    title: 'Test Idea',
    description: 'Testing database'
  }).then(id => {
    console.log('✅ Idea saved with ID:', id);
    console.log('Check Firebase Console now!');
  }).catch(err => {
    console.error('❌ Error:', err.message);
  });
}
```

---

## 🚨 Still Not Working?

### Check These:

1. **Firebase Project ID**
   - Open `src/firebase/config.ts`
   - Verify `projectId: "wave-ad270"`

2. **Internet Connection**
   - Firestore requires internet
   - Check browser network tab

3. **Browser Console Errors**
   - Look for red errors in console
   - Common errors:
     - "Permission denied" → Deploy security rules
     - "Network error" → Check internet
     - "Not authenticated" → Log in first

4. **Firebase Console Access**
   - Make sure you're logged into the correct Google account
   - Verify you have access to wave-ad270 project

---

## 💡 Expected Behavior

### After Login:
```
Console output:
✅ Firebase initialized successfully
✅ User created/updated in USERS collection
```

### After Saving Data:
```
Firebase Console shows:
USERS/
  └── your_uid
        ├── name: "Your Name"
        ├── email: "your@email.com"
        └── ...

GRAVEYARD/
  └── auto_id
        ├── userId: "your_uid"
        ├── title: "Your Idea"
        └── ...
```

---

## 📞 Next Steps

1. **Run diagnostics:** `diagnoseFirebase()`
2. **Check console output** for specific errors
3. **Verify security rules** are published
4. **Try creating test data** using the diagnostic script

If you see specific error messages, share them for more targeted help!
