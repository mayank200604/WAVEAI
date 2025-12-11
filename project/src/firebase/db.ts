import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type {
  User,
  ChatMessage,
  GraveyardIdea,
  Project,
  CreateUserInput,
  CreateChatInput,
  CreateIdeaInput,
  CreateProjectInput,
  UpdateProjectInput,
} from './types';

// ============================================
// COLLECTION NAMES
// ============================================

const COLLECTIONS = {
  USERS: 'USERS',
  CHAT_HISTORY: 'CHAT_HISTORY',
  GRAVEYARD: 'GRAVEYARD',
  PROJECTS: 'PROJECTS',
} as const;

// ============================================
// USER OPERATIONS
// ============================================

export const createUser = async (userData: CreateUserInput): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
  const userDoc: Omit<User, 'uid'> = {
    name: userData.name,
    email: userData.email,
    photoURL: userData.photoURL,
    loginMethod: userData.loginMethod,
    createdAt: serverTimestamp() as Timestamp,
    lastLogin: serverTimestamp() as Timestamp,
  };
  await setDoc(userRef, userDoc, { merge: true });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { uid: userSnap.id, ...userSnap.data() } as User;
  }
  return null;
};

export const updateUserLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
  });
};

// ============================================
// CHAT HISTORY OPERATIONS
// ============================================

export const saveChatMessage = async (chatData: CreateChatInput): Promise<string> => {
  const chatRef = collection(db, COLLECTIONS.CHAT_HISTORY);
  const chatDoc = {
    userId: chatData.userId,
    sessionId: chatData.sessionId,
    prompt: chatData.prompt,
    response: chatData.response,
    timestamp: serverTimestamp(),
  };
  
  const docRef = await addDoc(chatRef, chatDoc);
  return docRef.id;
};

export const getChatHistory = async (
  userId: string,
  sessionId?: string,
  limitCount: number = 50
): Promise<ChatMessage[]> => {
  const chatRef = collection(db, COLLECTIONS.CHAT_HISTORY);
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount),
  ];
  
  if (sessionId) {
    constraints.splice(1, 0, where('sessionId', '==', sessionId));
  }
  
  const q = query(chatRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    chatId: doc.id,
    ...doc.data(),
  })) as ChatMessage[];
};

export const getChatSessions = async (userId: string): Promise<string[]> => {
  const chatRef = collection(db, COLLECTIONS.CHAT_HISTORY);
  const q = query(
    chatRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const sessions = new Set<string>();
  
  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.sessionId) {
      sessions.add(data.sessionId);
    }
  });
  
  return Array.from(sessions);
};

export const deleteChatMessage = async (chatId: string): Promise<void> => {
  const chatRef = doc(db, COLLECTIONS.CHAT_HISTORY, chatId);
  await deleteDoc(chatRef);
};

// ============================================
// GRAVEYARD OPERATIONS
// ============================================

export const saveIdea = async (ideaData: CreateIdeaInput): Promise<string> => {
  const graveyardRef = collection(db, COLLECTIONS.GRAVEYARD);
  const ideaDoc = {
    userId: ideaData.userId,
    title: ideaData.title,
    description: ideaData.description,
    tags: ideaData.tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(graveyardRef, ideaDoc);
  return docRef.id;
};

export const getIdeas = async (userId: string): Promise<GraveyardIdea[]> => {
  const graveyardRef = collection(db, COLLECTIONS.GRAVEYARD);
  const q = query(
    graveyardRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ideaId: doc.id,
    ...doc.data(),
  })) as GraveyardIdea[];
};

export const getIdea = async (ideaId: string): Promise<GraveyardIdea | null> => {
  const ideaRef = doc(db, COLLECTIONS.GRAVEYARD, ideaId);
  const ideaSnap = await getDoc(ideaRef);
  
  if (ideaSnap.exists()) {
    return { ideaId: ideaSnap.id, ...ideaSnap.data() } as GraveyardIdea;
  }
  return null;
};

export const updateIdea = async (
  ideaId: string,
  updates: Partial<Omit<GraveyardIdea, 'ideaId' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const ideaRef = doc(db, COLLECTIONS.GRAVEYARD, ideaId);
  await updateDoc(ideaRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteIdea = async (ideaId: string): Promise<void> => {
  const ideaRef = doc(db, COLLECTIONS.GRAVEYARD, ideaId);
  await deleteDoc(ideaRef);
};

// ============================================
// PROJECT OPERATIONS
// ============================================

export const createProject = async (projectData: CreateProjectInput): Promise<string> => {
  const projectsRef = collection(db, COLLECTIONS.PROJECTS);
  const projectDoc = {
    userId: projectData.userId,
    ideaId: projectData.ideaId || null,
    title: projectData.title,
    description: projectData.description,
    status: projectData.status || 'in-progress',
    siteLink: projectData.siteLink || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(projectsRef, projectDoc);
  return docRef.id;
};

export const getProjects = async (userId: string): Promise<Project[]> => {
  const projectsRef = collection(db, COLLECTIONS.PROJECTS);
  const q = query(
    projectsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    projectId: doc.id,
    ...doc.data(),
  })) as Project[];
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
  const projectSnap = await getDoc(projectRef);
  
  if (projectSnap.exists()) {
    return { projectId: projectSnap.id, ...projectSnap.data() } as Project;
  }
  return null;
};

export const updateProject = async (
  projectId: string,
  updates: UpdateProjectInput
): Promise<void> => {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
  await deleteDoc(projectRef);
};

// ============================================
// UTILITY: Convert Idea to Project
// ============================================

export const convertIdeaToProject = async (ideaId: string): Promise<string> => {
  const idea = await getIdea(ideaId);
  
  if (!idea) {
    throw new Error('Idea not found');
  }
  
  const projectData: CreateProjectInput = {
    userId: idea.userId,
    ideaId: ideaId,
    title: idea.title,
    description: idea.description,
    status: 'in-progress',
  };
  
  const projectId = await createProject(projectData);
  
  // Idea remains in graveyard as per your requirement
  
  return projectId;
};
