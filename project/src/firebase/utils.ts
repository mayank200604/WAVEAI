/**
 * Utility functions for Firebase operations
 */

/**
 * Generate a unique session ID for chat grouping
 * Format: session_timestamp_randomString
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `session_${timestamp}_${random}`;
};

/**
 * Generate a unique ID (alternative to auto-generated Firestore IDs)
 */
export const generateUniqueId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Format Firestore timestamp to readable date string
 */
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  
  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  
  // Handle regular Date
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  }
  
  return '';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
