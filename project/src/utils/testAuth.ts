import { signUp, signIn } from '../firebase/auth';

// Test credentials for development
const TEST_USER = {
  email: 'test@wave.ai',
  password: 'test123456',
  fullName: 'Test User'
};

/**
 * Create a test user for development/testing
 */
export const createTestUser = async () => {
  try {
    console.log('Creating test user...');
    const user = await signUp(TEST_USER.email, TEST_USER.password, TEST_USER.fullName);
    console.log('✅ Test user created successfully:', user.email);
    return user;
  } catch (error: any) {
    if (error.message.includes('email-already-in-use')) {
      console.log('ℹ️ Test user already exists, trying to sign in...');
      try {
        const user = await signIn(TEST_USER.email, TEST_USER.password);
        console.log('✅ Test user signed in successfully:', user.email);
        return user;
      } catch (signInError: any) {
        console.error('❌ Failed to sign in test user:', signInError.message);
        throw signInError;
      }
    } else {
      console.error('❌ Failed to create test user:', error.message);
      throw error;
    }
  }
};

/**
 * Test authentication with the test user
 */
export const testAuthentication = async () => {
  try {
    console.log('Testing authentication...');
    const user = await signIn(TEST_USER.email, TEST_USER.password);
    console.log('✅ Authentication test successful:', user.email);
    return true;
  } catch (error: any) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
};

export { TEST_USER };
