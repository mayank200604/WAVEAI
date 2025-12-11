// Profile Service - Handles user profile data management
import { auth } from '../firebase/config';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export interface ProfileData {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
  };
  theme: string;
  language: string;
  apiKeys: {
    groq: string;
    gemini: string;
    perplexity: string;
  };
}

export class ProfileService {
  private static STORAGE_KEY = 'waveai_profile_data';

  /**
   * Load profile data from localStorage and Firebase
   */
  static loadProfileData(): ProfileData {
    const user = auth.currentUser;
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    
    const defaultData: ProfileData = {
      fullName: user?.displayName || 'Wave AI User',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      notifications: {
        email: true,
        push: false,
        updates: true
      },
      theme: 'dark',
      language: 'en',
      apiKeys: {
        groq: '',
        gemini: '',
        perplexity: ''
      }
    };

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return { ...defaultData, ...parsed };
      } catch (error) {
        console.error('Error parsing saved profile data:', error);
        return defaultData;
      }
    }

    return defaultData;
  }

  /**
   * Save profile data to localStorage
   */
  static saveProfileData(data: ProfileData): void {
    try {
      // Don't save passwords to localStorage
      const dataToSave = {
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw new Error('Failed to save profile data');
    }
  }

  /**
   * Update user profile in Firebase
   */
  static async updateUserProfile(data: ProfileData): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    try {
      // Update display name if changed
      if (data.fullName !== user.displayName) {
        await updateProfile(user, {
          displayName: data.fullName
        });
      }

      // Save other data to localStorage
      this.saveProfileData(data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Update user password
   */
  static async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak');
      } else {
        throw new Error('Failed to update password');
      }
    }
  }

  /**
   * Validate profile data
   */
  static validateProfileData(data: ProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate full name
    if (!data.fullName.trim()) {
      errors.push('Full name is required');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errors.push('Email is required');
    } else if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    // Validate password change if attempted
    if (data.newPassword || data.confirmPassword) {
      if (!data.currentPassword) {
        errors.push('Current password is required to change password');
      }
      if (data.newPassword.length < 6) {
        errors.push('New password must be at least 6 characters long');
      }
      if (data.newPassword !== data.confirmPassword) {
        errors.push('New passwords do not match');
      }
    }

    // Validate API keys format (basic validation)
    if (data.apiKeys.groq && !data.apiKeys.groq.startsWith('gsk_')) {
      errors.push('Groq API key should start with "gsk_"');
    }
    if (data.apiKeys.gemini && data.apiKeys.gemini.length < 20) {
      errors.push('Gemini API key appears to be invalid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get API keys for use in other services
   */
  static getApiKeys(): { groq: string; gemini: string; perplexity: string } {
    const data = this.loadProfileData();
    return data.apiKeys;
  }

  /**
   * Update specific API key
   */
  static updateApiKey(provider: 'groq' | 'gemini' | 'perplexity', key: string): void {
    const data = this.loadProfileData();
    data.apiKeys[provider] = key;
    this.saveProfileData(data);
  }

  /**
   * Get user preferences
   */
  static getUserPreferences(): { theme: string; language: string; notifications: any } {
    const data = this.loadProfileData();
    return {
      theme: data.theme,
      language: data.language,
      notifications: data.notifications
    };
  }

  /**
   * Clear all profile data (for logout)
   */
  static clearProfileData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
