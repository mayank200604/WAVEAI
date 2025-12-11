import { 
  getUser, 
  getChatHistory, 
  getIdeas, 
  getProjects,
  saveChatMessage,
  saveIdea,
  createProject,
  updateUserLastLogin
} from '../firebase/db';
import type { User, ChatMessage, GraveyardIdea, Project } from '../firebase/types';

export interface UserData {
  profile: User | null;
  chatHistory: ChatMessage[];
  graveyardIdeas: GraveyardIdea[];
  projects: Project[];
  stats: {
    totalChats: number;
    totalIdeas: number;
    totalProjects: number;
    joinDate: string | null;
    lastLogin: string | null;
  };
}

export class UserDataService {
  /**
   * Load all user data from Firebase
   */
  static async loadUserData(userId: string): Promise<UserData> {
    try {
      console.log('Loading user data for:', userId);
      
      // Load user profile
      const profile = await getUser(userId);
      
      // Load user's data in parallel with better error handling for index issues
      const [chatHistory, graveyardIdeas, projects] = await Promise.all([
        getChatHistory(userId, undefined, 100).catch(err => {
          if (err.message?.includes('index')) {
            console.warn('Chat history requires Firestore index. Skipping for now.');
          } else {
            console.warn('Failed to load chat history:', err);
          }
          return [];
        }),
        getIdeas(userId).catch(err => {
          if (err.message?.includes('index')) {
            console.warn('Graveyard ideas require Firestore index. Skipping for now.');
          } else {
            console.warn('Failed to load graveyard ideas:', err);
          }
          return [];
        }),
        getProjects(userId).catch(err => {
          if (err.message?.includes('index')) {
            console.warn('Projects require Firestore index. Skipping for now.');
          } else {
            console.warn('Failed to load projects:', err);
          }
          return [];
        })
      ]);

      // Calculate stats
      const stats = {
        totalChats: chatHistory.length,
        totalIdeas: graveyardIdeas.length,
        totalProjects: projects.length,
        joinDate: profile?.createdAt ? new Date(profile.createdAt.toDate()).toLocaleDateString() : null,
        lastLogin: profile?.lastLogin ? new Date(profile.lastLogin.toDate()).toLocaleDateString() : null
      };

      console.log('User data loaded successfully:', {
        profile: !!profile,
        chatHistory: chatHistory.length,
        graveyardIdeas: graveyardIdeas.length,
        projects: projects.length
      });

      return {
        profile,
        chatHistory,
        graveyardIdeas,
        projects,
        stats
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Return empty data structure on error
      return {
        profile: null,
        chatHistory: [],
        graveyardIdeas: [],
        projects: [],
        stats: {
          totalChats: 0,
          totalIdeas: 0,
          totalProjects: 0,
          joinDate: null,
          lastLogin: null
        }
      };
    }
  }

  /**
   * Save a chat message for the user
   */
  static async saveChatMessage(userId: string, sessionId: string, prompt: string, response: string): Promise<string | null> {
    try {
      const chatId = await saveChatMessage({
        userId,
        sessionId,
        prompt,
        response
      });
      console.log('Chat message saved:', chatId);
      return chatId;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
  }

  /**
   * Save an idea to the graveyard
   */
  static async saveIdeaToGraveyard(userId: string, title: string, description: string, tags: string[] = []): Promise<string | null> {
    try {
      const ideaId = await saveIdea({
        userId,
        title,
        description,
        tags
      });
      console.log('Idea saved to graveyard:', ideaId);
      return ideaId;
    } catch (error) {
      console.error('Error saving idea to graveyard:', error);
      return null;
    }
  }

  /**
   * Save a project
   */
  static async saveProject(userId: string, title: string, description: string, ideaId?: string, siteLink?: string): Promise<string | null> {
    try {
      const projectId = await createProject({
        userId,
        title,
        description,
        ideaId,
        siteLink,
        status: 'in-progress'
      });
      console.log('Project saved:', projectId);
      return projectId;
    } catch (error) {
      console.error('Error saving project:', error);
      return null;
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await updateUserLastLogin(userId);
      console.log('Last login updated for user:', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string): Promise<UserData['stats']> {
    try {
      const userData = await this.loadUserData(userId);
      return userData.stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalChats: 0,
        totalIdeas: 0,
        totalProjects: 0,
        joinDate: null,
        lastLogin: null
      };
    }
  }

  /**
   * Initialize data for a new user
   */
  static getEmptyUserData(): UserData {
    return {
      profile: null,
      chatHistory: [],
      graveyardIdeas: [],
      projects: [],
      stats: {
        totalChats: 0,
        totalIdeas: 0,
        totalProjects: 0,
        joinDate: null,
        lastLogin: null
      }
    };
  }
}
