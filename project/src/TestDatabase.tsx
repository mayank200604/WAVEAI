/**
 * Test component to verify Firebase database connection
 * Add this to your app temporarily to test the database
 */

import { useState } from 'react';
import { 
  diagnoseFirebase, 
  saveIdea, 
  saveChatMessage,
  createProject,
  getIdeas,
  getProjects,
  getChatHistory,
  generateSessionId
} from './firebase';
import { getCurrentUser } from './firebase/auth';

export default function TestDatabase() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);

  const user = getCurrentUser();

  const runDiagnostics = async () => {
    setStatus('Running diagnostics...');
    await diagnoseFirebase();
    setStatus('✅ Check browser console for results');
  };

  const testSaveIdea = async () => {
    if (!user) {
      setStatus('❌ Please login first');
      return;
    }

    try {
      setStatus('Saving test idea...');
      const ideaId = await saveIdea({
        userId: user.uid,
        title: 'Test Idea - ' + new Date().toLocaleTimeString(),
        description: 'This is a test idea to verify database connection',
        tags: ['test', 'database']
      });
      setStatus(`✅ Idea saved! ID: ${ideaId}`);
      loadIdeas();
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  const testSaveChat = async () => {
    if (!user) {
      setStatus('❌ Please login first');
      return;
    }

    try {
      setStatus('Saving test chat...');
      const chatId = await saveChatMessage({
        userId: user.uid,
        sessionId: generateSessionId(),
        prompt: 'Test prompt - What is AI?',
        response: 'Test response - AI is Artificial Intelligence'
      });
      setStatus(`✅ Chat saved! ID: ${chatId}`);
      loadChats();
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  const testSaveProject = async () => {
    if (!user) {
      setStatus('❌ Please login first');
      return;
    }

    try {
      setStatus('Saving test project...');
      const projectId = await createProject({
        userId: user.uid,
        title: 'Test Project - ' + new Date().toLocaleTimeString(),
        description: 'This is a test project to verify database connection',
        status: 'in-progress'
      });
      setStatus(`✅ Project saved! ID: ${projectId}`);
      loadProjects();
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  const loadIdeas = async () => {
    if (!user) return;
    try {
      const data = await getIdeas(user.uid);
      setIdeas(data);
      setStatus(`✅ Loaded ${data.length} ideas`);
    } catch (error: any) {
      setStatus(`❌ Error loading ideas: ${error.message}`);
    }
  };

  const loadProjects = async () => {
    if (!user) return;
    try {
      const data = await getProjects(user.uid);
      setProjects(data);
      setStatus(`✅ Loaded ${data.length} projects`);
    } catch (error: any) {
      setStatus(`❌ Error loading projects: ${error.message}`);
    }
  };

  const loadChats = async () => {
    if (!user) return;
    try {
      const data = await getChatHistory(user.uid, undefined, 10);
      setChats(data);
      setStatus(`✅ Loaded ${data.length} chats`);
    } catch (error: any) {
      setStatus(`❌ Error loading chats: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Firebase Database Test</h1>
      
      {/* User Status */}
      <div style={{ 
        padding: '15px', 
        background: user ? '#d4edda' : '#f8d7da',
        border: `1px solid ${user ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>User Status:</strong> {user ? `✅ Logged in as ${user.email}` : '❌ Not logged in'}
        {!user && <p style={{ margin: '10px 0 0 0' }}>Please login first to test the database</p>}
      </div>

      {/* Status */}
      <div style={{ 
        padding: '15px', 
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {status}
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button 
          onClick={runDiagnostics}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          🔍 Run Diagnostics
        </button>
        
        <button 
          onClick={testSaveIdea}
          disabled={!user}
          style={{ padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed' }}
        >
          💡 Save Test Idea
        </button>
        
        <button 
          onClick={testSaveChat}
          disabled={!user}
          style={{ padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed' }}
        >
          💬 Save Test Chat
        </button>
        
        <button 
          onClick={testSaveProject}
          disabled={!user}
          style={{ padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed' }}
        >
          📁 Save Test Project
        </button>
      </div>

      {/* Load Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button 
          onClick={loadIdeas}
          disabled={!user}
          style={{ padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed' }}
        >
          📥 Load Ideas ({ideas.length})
        </button>
        
        <button 
          onClick={loadProjects}
          disabled={!user}
          style={{ padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed' }}
        >
          📥 Load Projects ({projects.length})
        </button>
        
        <button 
          onClick={loadChats}
          disabled={!user}
          style={{ padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed' }}
        >
          📥 Load Chats ({chats.length})
        </button>
      </div>

      {/* Data Display */}
      <div style={{ marginTop: '30px' }}>
        {ideas.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>💡 Ideas ({ideas.length})</h3>
            {ideas.map(idea => (
              <div key={idea.ideaId} style={{ 
                padding: '10px', 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                <strong>{idea.title}</strong>
                <p style={{ margin: '5px 0' }}>{idea.description}</p>
                <small>ID: {idea.ideaId}</small>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>📁 Projects ({projects.length})</h3>
            {projects.map(project => (
              <div key={project.projectId} style={{ 
                padding: '10px', 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                <strong>{project.title}</strong>
                <p style={{ margin: '5px 0' }}>{project.description}</p>
                <small>Status: {project.status} | ID: {project.projectId}</small>
              </div>
            ))}
          </div>
        )}

        {chats.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>💬 Chats ({chats.length})</h3>
            {chats.map(chat => (
              <div key={chat.chatId} style={{ 
                padding: '10px', 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                <strong>Q:</strong> {chat.prompt}
                <p style={{ margin: '5px 0' }}><strong>A:</strong> {chat.response}</p>
                <small>ID: {chat.chatId}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '30px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '5px'
      }}>
        <h3>📋 Instructions:</h3>
        <ol>
          <li>Make sure you're logged in</li>
          <li>Click "Run Diagnostics" and check browser console</li>
          <li>Click "Save Test..." buttons to create data</li>
          <li>Click "Load..." buttons to retrieve data</li>
          <li>Check Firebase Console: <a href="https://console.firebase.google.com/project/wave-ad270/firestore" target="_blank">Open Firestore</a></li>
        </ol>
      </div>
    </div>
  );
}
