# Implementation Guide - Wave App Firebase Integration

## 🚀 Quick Start

### 1. Import Firebase Functions

```typescript
import {
  // Auth
  auth,
  
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

## 📋 Implementation Checklist

### ✅ Authentication Flow

**When user logs in (Google/Email):**

```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, createUser } from '@/firebase';

const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  // Create/update user in Firestore
  await createUser({
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    loginMethod: 'google'
  });
};
```

---

### ✅ Chat Page Implementation

**Starting a new chat session:**

```typescript
import { generateSessionId, saveChatMessage } from '@/firebase';
import { useState } from 'react';

const ChatPage = () => {
  const [sessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState([]);
  
  const handleSendMessage = async (prompt: string) => {
    // Get response from your chatbot API
    const response = await fetchChatbotResponse(prompt);
    
    // Save to Firestore
    await saveChatMessage({
      userId: currentUser.uid,
      sessionId: sessionId,
      prompt: prompt,
      response: response
    });
    
    // Update UI
    setMessages([...messages, { prompt, response }]);
  };
  
  return (
    // Your chat UI
  );
};
```

**Loading chat history:**

```typescript
import { getChatHistory, getChatSessions } from '@/firebase';

// Get all sessions
const sessions = await getChatSessions(currentUser.uid);

// Get messages from a specific session
const messages = await getChatHistory(currentUser.uid, sessionId);

// Get recent chats (all sessions, limit 50)
const recentChats = await getChatHistory(currentUser.uid);
```

---

### ✅ Graveyard Page Implementation

**Save an idea:**

```typescript
import { saveIdea } from '@/firebase';

const handleSaveIdea = async () => {
  const ideaId = await saveIdea({
    userId: currentUser.uid,
    title: ideaTitle,
    description: ideaDescription,
    tags: ['AI', 'Web'] // optional
  });
  
  console.log('Idea saved with ID:', ideaId);
};
```

**Display all ideas:**

```typescript
import { getIdeas } from '@/firebase';
import { useEffect, useState } from 'react';

const GraveyardPage = () => {
  const [ideas, setIdeas] = useState([]);
  
  useEffect(() => {
    const loadIdeas = async () => {
      const userIdeas = await getIdeas(currentUser.uid);
      setIdeas(userIdeas);
    };
    
    loadIdeas();
  }, []);
  
  return (
    <div>
      {ideas.map(idea => (
        <div key={idea.ideaId}>
          <h3>{idea.title}</h3>
          <p>{idea.description}</p>
          <button onClick={() => handleConvertToProject(idea.ideaId)}>
            Convert to Project
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

### ✅ Project Page Implementation

**Convert idea to project:**

```typescript
import { convertIdeaToProject } from '@/firebase';

const handleConvertToProject = async (ideaId: string) => {
  const projectId = await convertIdeaToProject(ideaId);
  console.log('Project created with ID:', projectId);
  
  // Navigate to project page
  router.push(`/project/${projectId}`);
};
```

**Create project directly (without idea):**

```typescript
import { createProject } from '@/firebase';

const handleCreateProject = async () => {
  const projectId = await createProject({
    userId: currentUser.uid,
    title: projectTitle,
    description: projectDescription,
    status: 'in-progress'
  });
};
```

**Display all projects:**

```typescript
import { getProjects } from '@/firebase';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    const loadProjects = async () => {
      const userProjects = await getProjects(currentUser.uid);
      setProjects(userProjects);
    };
    
    loadProjects();
  }, []);
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.projectId}>
          <h3>{project.title}</h3>
          <p>Status: {project.status}</p>
          {project.siteLink && (
            <a href={project.siteLink}>View Site</a>
          )}
        </div>
      ))}
    </div>
  );
};
```

**Update project (e.g., mark as completed):**

```typescript
import { updateProject } from '@/firebase';

const handleMarkComplete = async (projectId: string) => {
  await updateProject(projectId, {
    status: 'completed',
    siteLink: 'https://myproject.com'
  });
};
```

---

## 🔐 Next Steps: Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/project/wave-ad270/firestore)
2. Click on **Rules** tab
3. Copy the security rules from `DATABASE.md`
4. Click **Publish**

---

## 📊 Testing Your Database

### Test in Firebase Console:

1. Go to [Firestore Database](https://console.firebase.google.com/project/wave-ad270/firestore/databases/-default-/data)
2. You should see these collections after using the app:
   - `USERS`
   - `CHAT_HISTORY`
   - `GRAVEYARD`
   - `PROJECTS`

### Test Queries:

```typescript
// Test user creation
const user = await getUser(currentUser.uid);
console.log('User data:', user);

// Test chat save
const chatId = await saveChatMessage({
  userId: currentUser.uid,
  sessionId: generateSessionId(),
  prompt: 'Test prompt',
  response: 'Test response'
});
console.log('Chat saved:', chatId);

// Test idea save
const ideaId = await saveIdea({
  userId: currentUser.uid,
  title: 'Test Idea',
  description: 'This is a test'
});
console.log('Idea saved:', ideaId);
```

---

## 🎯 Common Patterns

### Real-time Updates (Optional)

If you want real-time updates, use Firestore's `onSnapshot`:

```typescript
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

// Listen to projects in real-time
const q = query(
  collection(db, 'PROJECTS'),
  where('userId', '==', currentUser.uid)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const projects = snapshot.docs.map(doc => ({
    projectId: doc.id,
    ...doc.data()
  }));
  setProjects(projects);
});

// Cleanup on unmount
return () => unsubscribe();
```

### Error Handling

```typescript
try {
  await saveIdea({
    userId: currentUser.uid,
    title: ideaTitle,
    description: ideaDescription
  });
  toast.success('Idea saved!');
} catch (error) {
  console.error('Error saving idea:', error);
  toast.error('Failed to save idea');
}
```

---

## 📝 File Structure

```
src/
  firebase/
    ├── config.ts          # Firebase initialization
    ├── db.ts              # Database operations
    ├── types.ts           # TypeScript types
    ├── utils.ts           # Utility functions
    ├── index.ts           # Main export file
    ├── DATABASE.md        # Database structure docs
    └── IMPLEMENTATION_GUIDE.md  # This file
```

---

## 🚨 Important Notes

1. **Always check authentication** before calling database functions
2. **Session IDs** should be generated once per chat session
3. **Ideas remain in graveyard** even after converting to project
4. **Use TypeScript types** for better type safety
5. **Handle errors** gracefully with try-catch blocks

---

## 🎉 You're Ready!

Your Firebase database structure is complete and ready to use. Import the functions you need and start building your app!
