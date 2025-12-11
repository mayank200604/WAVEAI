# 🔥 Wave App - Firebase Integration

Complete Firebase setup for authentication and Firestore database with TypeScript support.

---

## 📁 File Structure

```
src/firebase/
├── config.ts                  # Firebase initialization & exports
├── auth.ts                    # Authentication helpers (existing)
├── db.ts                      # Database operations (CRUD functions)
├── types.ts                   # TypeScript interfaces
├── utils.ts                   # Utility functions (session ID, etc.)
├── index.ts                   # Main export file
├── DATABASE.md                # Database structure documentation
├── IMPLEMENTATION_GUIDE.md    # Step-by-step implementation guide
└── README.md                  # This file

firestore.rules                # Security rules (copy to Firebase Console)
```

---

## 🚀 Quick Start

### Import and Use

```typescript
import {
  // User operations
  createUser,
  getUser,
  
  // Chat operations
  saveChatMessage,
  getChatHistory,
  generateSessionId,
  
  // Graveyard operations
  saveIdea,
  getIdeas,
  
  // Project operations
  createProject,
  getProjects,
  convertIdeaToProject,
} from '@/firebase';
```

---

## 📊 Database Collections

### Independent Collections (linked by `userId`)

1. **USERS** - User profiles and authentication data
2. **CHAT_HISTORY** - All chat messages (grouped by `sessionId`)
3. **GRAVEYARD** - Saved ideas
4. **PROJECTS** - Projects (converted from ideas or created directly)

---

## 📖 Documentation

- **[DATABASE.md](./DATABASE.md)** - Complete database structure, fields, and usage examples
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step guide for implementing in your app
- **[firestore.rules](../../firestore.rules)** - Security rules to copy to Firebase Console

---

## ✅ Setup Checklist

### 1. Firebase Console Setup

- [x] Firebase project created (`wave-ad270`)
- [x] Authentication enabled (Google + Email)
- [ ] **TODO: Add Firestore security rules**
  - Go to: https://console.firebase.google.com/project/wave-ad270/firestore/rules
  - Copy rules from `firestore.rules`
  - Click **Publish**

### 2. Code Implementation

- [x] Firebase config setup
- [x] TypeScript types defined
- [x] Database operations implemented
- [ ] **TODO: Implement in your components**
  - See `IMPLEMENTATION_GUIDE.md` for examples

---

## 🎯 Key Features

### ✅ Type-Safe Operations
All database operations are fully typed with TypeScript interfaces.

### ✅ User Isolation
Each user can only access their own data (enforced by security rules).

### ✅ Session-Based Chat
Chat messages are grouped by `sessionId` for better organization.

### ✅ Idea → Project Conversion
Convert graveyard ideas to projects while keeping the original idea.

### ✅ Timestamp Management
All timestamps use Firebase's `serverTimestamp()` for consistency.

---

## 📝 Example Usage

### Save a Chat Message

```typescript
import { saveChatMessage, generateSessionId } from '@/firebase';

const sessionId = generateSessionId();

await saveChatMessage({
  userId: currentUser.uid,
  sessionId: sessionId,
  prompt: 'What is AI?',
  response: 'AI stands for Artificial Intelligence...'
});
```

### Save an Idea

```typescript
import { saveIdea } from '@/firebase';

const ideaId = await saveIdea({
  userId: currentUser.uid,
  title: 'AI Resume Builder',
  description: 'An app that generates resumes using AI',
  tags: ['AI', 'Career']
});
```

### Convert Idea to Project

```typescript
import { convertIdeaToProject } from '@/firebase';

const projectId = await convertIdeaToProject(ideaId);
// Idea remains in graveyard, new project created
```

---

## 🔒 Security

Security rules ensure:
- Users can only access their own data
- Authentication is required for all operations
- No cross-user data access

**Deploy rules:** Copy `firestore.rules` to Firebase Console

---

## 🛠️ Available Functions

### User Operations
- `createUser()` - Create/update user profile
- `getUser()` - Get user data
- `updateUserLastLogin()` - Update last login timestamp

### Chat Operations
- `saveChatMessage()` - Save a chat message
- `getChatHistory()` - Get chat history (all or by session)
- `getChatSessions()` - Get all session IDs
- `deleteChatMessage()` - Delete a chat message

### Graveyard Operations
- `saveIdea()` - Save a new idea
- `getIdeas()` - Get all user ideas
- `getIdea()` - Get a specific idea
- `updateIdea()` - Update an idea
- `deleteIdea()` - Delete an idea

### Project Operations
- `createProject()` - Create a new project
- `getProjects()` - Get all user projects
- `getProject()` - Get a specific project
- `updateProject()` - Update a project
- `deleteProject()` - Delete a project
- `convertIdeaToProject()` - Convert idea to project

### Utilities
- `generateSessionId()` - Generate unique session ID
- `generateUniqueId()` - Generate unique ID
- `formatTimestamp()` - Format Firestore timestamp
- `isValidEmail()` - Validate email format

---

## 🎉 Next Steps

1. **Deploy Security Rules** - Copy `firestore.rules` to Firebase Console
2. **Implement in Components** - Follow `IMPLEMENTATION_GUIDE.md`
3. **Test Database** - Use Firebase Console to verify data

---

## 📞 Support

For detailed implementation examples, see:
- `IMPLEMENTATION_GUIDE.md` - Complete implementation guide
- `DATABASE.md` - Database structure and examples

---

**Firebase Project:** wave-ad270  
**Database:** Firestore (independent collections)  
**Authentication:** Google + Email/Password
