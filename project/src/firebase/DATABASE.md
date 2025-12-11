# Firebase Database Structure - Wave App

## 📊 Collections Overview

### 1. **USERS** Collection
Stores user authentication and profile data.

**Document ID:** User's Firebase Auth UID

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | User's full name |
| `email` | string | User's email address |
| `photoURL` | string | Profile picture URL |
| `createdAt` | timestamp | Account creation time |
| `lastLogin` | timestamp | Last login timestamp |
| `loginMethod` | string | "google" or "email" |

---

### 2. **CHAT_HISTORY** Collection
Stores all chat messages with the chatbot, grouped by sessions.

**Document ID:** Auto-generated

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Reference to user UID |
| `sessionId` | string | Groups messages into sessions |
| `prompt` | string | User's question/input |
| `response` | string | Chatbot's reply |
| `timestamp` | timestamp | When chat occurred |

---

### 3. **GRAVEYARD** Collection
Stores saved ideas (remains even after converting to project).

**Document ID:** Auto-generated

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Reference to user UID |
| `title` | string | Idea title |
| `description` | string | Idea description/content |
| `tags` | array | Optional tags (e.g., ["AI", "Web"]) |
| `createdAt` | timestamp | When idea was saved |
| `updatedAt` | timestamp | Last modification time |

---

### 4. **PROJECTS** Collection
Stores projects converted from ideas or created directly.

**Document ID:** Auto-generated

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Reference to user UID |
| `ideaId` | string (optional) | Links to graveyard idea |
| `title` | string | Project title |
| `description` | string | Project description |
| `status` | string | "in-progress" or "completed" |
| `siteLink` | string (optional) | Link to built site |
| `createdAt` | timestamp | Project creation time |
| `updatedAt` | timestamp | Last modification time |

---

## 🔧 Usage Examples

### User Operations

```typescript
import { createUser, getUser, updateUserLastLogin } from '@/firebase/db';

// Create/update user on login
await createUser({
  uid: user.uid,
  name: user.displayName || '',
  email: user.email || '',
  photoURL: user.photoURL || '',
  loginMethod: 'google'
});

// Get user data
const userData = await getUser(user.uid);

// Update last login
await updateUserLastLogin(user.uid);
```

### Chat History Operations

```typescript
import { saveChatMessage, getChatHistory, getChatSessions } from '@/firebase/db';

// Save a chat message
const chatId = await saveChatMessage({
  userId: currentUser.uid,
  sessionId: 'session_123',
  prompt: 'What is AI?',
  response: 'AI stands for Artificial Intelligence...'
});

// Get chat history for a session
const messages = await getChatHistory(currentUser.uid, 'session_123');

// Get all session IDs for a user
const sessions = await getChatSessions(currentUser.uid);

// Get recent chats (all sessions, limit 50)
const recentChats = await getChatHistory(currentUser.uid);
```

### Graveyard (Ideas) Operations

```typescript
import { saveIdea, getIdeas, getIdea, updateIdea, deleteIdea } from '@/firebase/db';

// Save a new idea
const ideaId = await saveIdea({
  userId: currentUser.uid,
  title: 'AI Resume Builder',
  description: 'An app that generates resumes using AI',
  tags: ['AI', 'Career', 'Web']
});

// Get all ideas for a user
const ideas = await getIdeas(currentUser.uid);

// Get a specific idea
const idea = await getIdea(ideaId);

// Update an idea
await updateIdea(ideaId, {
  title: 'Updated Title',
  description: 'Updated description',
  tags: ['AI', 'Updated']
});

// Delete an idea
await deleteIdea(ideaId);
```

### Project Operations

```typescript
import { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject,
  convertIdeaToProject 
} from '@/firebase/db';

// Create a new project
const projectId = await createProject({
  userId: currentUser.uid,
  title: 'My Project',
  description: 'Project description',
  status: 'in-progress'
});

// Convert an idea to a project (idea remains in graveyard)
const newProjectId = await convertIdeaToProject(ideaId);

// Get all projects for a user
const projects = await getProjects(currentUser.uid);

// Get a specific project
const project = await getProject(projectId);

// Update project
await updateProject(projectId, {
  status: 'completed',
  siteLink: 'https://myproject.com'
});

// Delete project
await deleteProject(projectId);
```

---

## 🔒 Firestore Security Rules

Add these rules to your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /USERS/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat history collection
    match /CHAT_HISTORY/{chatId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Graveyard collection
    match /GRAVEYARD/{ideaId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Projects collection
    match /PROJECTS/{projectId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📝 Notes

1. **Session Management**: Chat messages are grouped by `sessionId`. Generate a unique session ID (e.g., using `crypto.randomUUID()` or timestamp) when starting a new chat session.

2. **Idea → Project**: When converting an idea to a project using `convertIdeaToProject()`, the original idea remains in the graveyard as per your requirement.

3. **Timestamps**: All timestamps use Firebase's `serverTimestamp()` for consistency.

4. **Querying**: All queries automatically filter by `userId` to ensure users only see their own data.

5. **Collection Names**: Using uppercase `USERS`, `CHAT_HISTORY`, `GRAVEYARD`, `PROJECTS` as per your Firebase Console structure.
