/**
 * React hooks for Firebase database operations
 * Use these in your components for easy data access
 */

import { useState, useEffect } from 'react';
import { getCurrentUser, onAuthChange } from './auth';
import type { User } from 'firebase/auth';
import {
  getChatHistory,
  getIdeas,
  getProjects,
  type ChatMessage,
  type GraveyardIdea,
  type Project,
} from './index';

/**
 * Hook to get current user's chat history
 * @param sessionId - Optional: filter by session ID
 * @param limit - Number of messages to fetch (default: 50)
 */
export const useChatHistory = (sessionId?: string, limit: number = 50) => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      const user = getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getChatHistory(user.uid, sessionId, limit);
        setChats(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [sessionId, limit]);

  return { chats, loading, error, refetch: () => {} };
};

/**
 * Hook to get current user's ideas from graveyard
 */
export const useIdeas = () => {
  const [ideas, setIdeas] = useState<GraveyardIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIdeas = async () => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getIdeas(user.uid);
      setIdeas(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  return { ideas, loading, error, refetch: fetchIdeas };
};

/**
 * Hook to get current user's projects
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getProjects(user.uid);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
};

/**
 * Hook to get current user data
 */
export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return user;
};
