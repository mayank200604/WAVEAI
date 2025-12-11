import { Timestamp } from 'firebase/firestore';

// ============================================
// USER TYPES
// ============================================

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  loginMethod: 'google' | 'email';
}

// ============================================
// CHAT HISTORY TYPES
// ============================================

export interface ChatMessage {
  chatId: string;
  userId: string; // Reference to USERS collection
  sessionId: string; // Group multiple messages into sessions
  prompt: string;
  response: string;
  timestamp: Timestamp;
}

// ============================================
// GRAVEYARD TYPES (Saved Ideas)
// ============================================

export interface GraveyardIdea {
  ideaId: string;
  userId: string; // Reference to USERS collection
  title: string;
  description: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// PROJECTS TYPES
// ============================================

export type ProjectStatus = 'in-progress' | 'completed';

export interface Project {
  projectId: string;
  userId: string; // Reference to USERS collection
  ideaId?: string; // Optional - links to graveyard idea
  title: string;
  description: string;
  status: ProjectStatus;
  siteLink?: string; // Optional - link to built site
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// INPUT TYPES (for creating new documents)
// ============================================

export interface CreateUserInput {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  loginMethod: 'google' | 'email';
}

export interface CreateChatInput {
  userId: string;
  sessionId: string;
  prompt: string;
  response: string;
}

export interface CreateIdeaInput {
  userId: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface CreateProjectInput {
  userId: string;
  ideaId?: string;
  title: string;
  description: string;
  status?: ProjectStatus;
  siteLink?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  siteLink?: string;
}
