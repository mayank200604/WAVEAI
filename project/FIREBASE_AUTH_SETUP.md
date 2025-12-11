# Firebase Authentication Setup Guide

## 🚨 Current Issues & Solutions

### Issue 1: `auth/unauthorized-domain` Error

**Problem**: The current domain (`127.0.0.1`, `localhost`) is not authorized for OAuth operations.

**Solution**: Add authorized domains in Firebase Console

#### Steps to Fix:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `wave-ad270`
3. **Navigate to**: Authentication → Settings → Authorized domains
4. **Add the following domains**:
   - `localhost`
   - `127.0.0.1`
   - `localhost:5173` (if using specific port)
   - `127.0.0.1:5173` (if using specific port)
   - Any other development domains you use

#### Alternative: Using Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Add authorized domains
firebase auth:domains:add localhost
firebase auth:domains:add 127.0.0.1
```

### Issue 2: `auth/invalid-credential` Error

**Problem**: Invalid email/password combination or user doesn't exist.

**Possible Causes**:
1. User account doesn't exist in Firebase Auth
2. Wrong password
3. Email not verified (if email verification is enabled)
4. Account disabled

#### Steps to Fix:

1. **Check Firebase Console**: Authentication → Users
2. **Verify the user exists** with the email you're trying to use
3. **Create a test user** if none exists:
   - Go to Authentication → Users → Add user
   - Add email: `test@wave.ai`
   - Add password: `test123456`
4. **Check Authentication methods**:
   - Go to Authentication → Sign-in method
   - Ensure Email/Password is **enabled**
   - Ensure Google is **enabled** (if using Google sign-in)

## 🔧 Firebase Console Configuration Checklist

### Authentication Settings:
- [ ] **Email/Password** provider enabled
- [ ] **Google** provider enabled (if using Google sign-in)
- [ ] **Authorized domains** include:
  - [ ] `localhost`
  - [ ] `127.0.0.1`
  - [ ] Your production domain (when deploying)

### Firestore Database:
- [ ] Database created in **test mode** or with proper security rules
- [ ] Required indexes created (see FIRESTORE_INDEXES.md)

### Security Rules (Firestore):
```javascript
// Basic rules for development - UPDATE FOR PRODUCTION
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /USERS/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /CHAT_HISTORY/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /GRAVEYARD/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /PROJECTS/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🧪 Testing Authentication

### Test User Credentials:
- **Email**: `test@wave.ai`
- **Password**: `test123456`

### Test Steps:
1. Go to your app: `http://localhost:5173`
2. Navigate: Splash → Landing → Login
3. Try email/password login with test credentials
4. Try Google sign-in (should work after domain authorization)

## 🔍 Debugging Tips

### Check Browser Console:
- Look for detailed Firebase error messages
- Check network tab for failed requests
- Verify Firebase SDK is loading correctly

### Check Firebase Console:
- Authentication → Users (see if users are being created)
- Authentication → Usage (see authentication attempts)
- Firestore → Data (see if user data is being stored)

### Common Error Messages:
- `auth/user-not-found`: Create the user in Firebase Console
- `auth/wrong-password`: Check password or reset it
- `auth/unauthorized-domain`: Add domain to authorized domains
- `auth/popup-blocked`: Allow popups for Google sign-in

## 🚀 Quick Fix Commands

If you have Firebase CLI installed:

```bash
# Add development domains
firebase auth:domains:add localhost
firebase auth:domains:add 127.0.0.1

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## 📞 Support

If issues persist:
1. Check Firebase Console → Authentication → Usage for error details
2. Verify your Firebase project ID matches the one in config.ts
3. Ensure billing is enabled if using Firebase on a paid plan
4. Check Firebase status page: https://status.firebase.google.com/
