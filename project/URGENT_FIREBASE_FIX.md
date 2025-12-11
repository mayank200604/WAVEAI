# 🚨 URGENT: Firebase Domain Authorization Fix

## Current Issue
**Error**: "❌ Domain not authorized. Please contact support to add this domain to Firebase."

## Immediate Fix Required

### Step 1: Check Your Current Domain
Your app is likely running on one of these:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- Or another local development URL

### Step 2: Add Domain to Firebase Console (REQUIRED)

1. **Open Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `wave-ad270`
3. **Go to**: Authentication → Settings → Authorized domains
4. **Click**: "Add domain"
5. **Add ALL of these domains**:
   ```
   localhost
   127.0.0.1
   localhost:5173
   127.0.0.1:5173
   ```

### Step 3: Screenshot Guide

**Navigation Path**:
```
Firebase Console → wave-ad270 → Authentication → Settings → Authorized domains → Add domain
```

**What you should see**:
- A list of authorized domains
- An "Add domain" button
- Default domains like `wave-ad270.firebaseapp.com`

**What to add**:
- Type `localhost` → Click "Add"
- Type `127.0.0.1` → Click "Add"  
- Type `localhost:5173` → Click "Add"
- Type `127.0.0.1:5173` → Click "Add"

### Step 4: Verify the Fix

1. **Save changes** in Firebase Console
2. **Refresh your app** (Ctrl+F5 or Cmd+Shift+R)
3. **Try Google sign-in again**

## Alternative: Use Firebase CLI (If you have it installed)

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Add authorized domains
firebase auth:domains:add localhost
firebase auth:domains:add 127.0.0.1
firebase auth:domains:add localhost:5173
firebase auth:domains:add 127.0.0.1:5173
```

## Troubleshooting

### If the error persists:

1. **Check the exact domain** in browser address bar
2. **Add that exact domain** to Firebase Console
3. **Wait 1-2 minutes** for changes to propagate
4. **Hard refresh** the browser (Ctrl+Shift+R)

### Common Issues:

- **Port numbers**: Make sure to include the port (`:5173`)
- **Protocol**: Don't include `http://` or `https://` when adding domains
- **Case sensitivity**: Use lowercase for domains
- **Propagation delay**: Changes may take 1-2 minutes to take effect

## Quick Test

After adding domains, test with this URL:
`http://localhost:5173/firebase-test`

This will show you the current domain and test Firebase connection.

---

**⚠️ This is a Firebase Console configuration issue, not a code issue. The domains MUST be added in Firebase Console for Google sign-in to work.**
