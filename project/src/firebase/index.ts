// Firebase configuration and initialization
export { auth, db } from './config';
export { default as app } from './config';

// Database operations
export {
  // User operations
  createUser,
  getUser,
  updateUserLastLogin,
  
  // Chat operations
  saveChatMessage,
  getChatHistory,
  getChatSessions,
  deleteChatMessage,
  
  // Graveyard (Ideas) operations
  saveIdea,
  getIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  
  // Project operations
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  
  // Utility
  convertIdeaToProject,
} from './db';

// Types
export type {
  User,
  ChatMessage,
  GraveyardIdea,
  Project,
  ProjectStatus,
  CreateUserInput,
  CreateChatInput,
  CreateIdeaInput,
  CreateProjectInput,
  UpdateProjectInput,
} from './types';

// Utilities
export {
  generateSessionId,
  generateUniqueId,
  formatTimestamp,
  isValidEmail,
} from './utils';

// React Hooks
export {
  useChatHistory,
  useIdeas,
  useProjects,
  useCurrentUser,
} from './hooks';

// Diagnostics
export {
  diagnoseFirebase,
  checkPermissions,
} from './diagnose';
