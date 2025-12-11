/**
 * Test file to verify Firebase database connection
 * Run this after logging in to test all database operations
 */

import {
  saveChatMessage,
  saveIdea,
  createProject,
  getChatHistory,
  getIdeas,
  getProjects,
  generateSessionId,
} from './index';

// Test function - call this from your component after user logs in
export const testDatabaseConnection = async (userId: string) => {
  console.log('🧪 Starting database tests...\n');

  try {
    // Test 1: Save a chat message
    console.log('1️⃣ Testing chat message save...');
    const sessionId = generateSessionId();
    const chatId = await saveChatMessage({
      userId: userId,
      sessionId: sessionId,
      prompt: 'Test prompt - What is AI?',
      response: 'Test response - AI stands for Artificial Intelligence',
    });
    console.log('✅ Chat message saved with ID:', chatId);

    // Test 2: Get chat history
    console.log('\n2️⃣ Testing chat history retrieval...');
    const chats = await getChatHistory(userId, sessionId, 10);
    console.log('✅ Retrieved', chats.length, 'chat messages');
    console.log('Latest chat:', chats[0]);

    // Test 3: Save an idea
    console.log('\n3️⃣ Testing idea save...');
    const ideaId = await saveIdea({
      userId: userId,
      title: 'Test Idea - AI Resume Builder',
      description: 'An app that generates professional resumes using AI',
      tags: ['AI', 'Career', 'Web'],
    });
    console.log('✅ Idea saved with ID:', ideaId);

    // Test 4: Get ideas
    console.log('\n4️⃣ Testing ideas retrieval...');
    const ideas = await getIdeas(userId);
    console.log('✅ Retrieved', ideas.length, 'ideas');
    console.log('Latest idea:', ideas[0]);

    // Test 5: Create a project
    console.log('\n5️⃣ Testing project creation...');
    const projectId = await createProject({
      userId: userId,
      title: 'Test Project - Portfolio Website',
      description: 'A modern portfolio website built with React',
      status: 'in-progress',
    });
    console.log('✅ Project created with ID:', projectId);

    // Test 6: Get projects
    console.log('\n6️⃣ Testing projects retrieval...');
    const projects = await getProjects(userId);
    console.log('✅ Retrieved', projects.length, 'projects');
    console.log('Latest project:', projects[0]);

    console.log('\n🎉 All tests passed! Database is working correctly.');
    console.log('\n📊 Check Firebase Console to see the data:');
    console.log('https://console.firebase.google.com/project/wave-ad270/firestore');

    return {
      success: true,
      chatId,
      ideaId,
      projectId,
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error,
    };
  }
};

// Quick test - just save one item of each type
export const quickTest = async (userId: string) => {
  try {
    console.log('🚀 Quick database test...');

    // Save chat
    await saveChatMessage({
      userId,
      sessionId: generateSessionId(),
      prompt: 'Hello',
      response: 'Hi there!',
    });
    console.log('✅ Chat saved');

    // Save idea
    await saveIdea({
      userId,
      title: 'Quick Test Idea',
      description: 'Testing database',
    });
    console.log('✅ Idea saved');

    // Save project
    await createProject({
      userId,
      title: 'Quick Test Project',
      description: 'Testing database',
    });
    console.log('✅ Project saved');

    console.log('🎉 Quick test complete!');
    return true;
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return false;
  }
};
