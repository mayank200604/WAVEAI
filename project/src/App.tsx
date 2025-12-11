import { useState, useEffect } from 'react';
import { Menu, Home, Clock, Folder, User, LogOut, AlertTriangle, X } from 'lucide-react';
import './App.css';
import './responsive.css';
import { smartChatbot } from './services/smartChatbot';
import { onAuthChange, handleGoogleRedirectResult, logOut } from './firebase/auth';
import { UserDataService } from './services/userDataService';
import type { UserData } from './services/userDataService';
import { saveChatMessage } from './firebase/db';

// Tutorial removed as per user request

type RevenuePotential = 'High' | 'Medium' | 'Low' | string;

interface Idea {
  id: string;
  title: string;
  description: string;
  target_market: string;
  revenue_potential: RevenuePotential;
  scalability_score: number;
  initial_investment: string;
  category: string;
  time_to_market: string;
  key_features: string[];
  [key: string]: unknown;
}

function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [popup, setPopup] = useState({ show: false, title: '', message: '', type: 'info' });
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showIdeasScreen, setShowIdeasScreen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Check authentication and load user data
  useEffect(() => {
    // Handle Google redirect result first
    const handleRedirect = async () => {
      try {
        const user = await handleGoogleRedirectResult();
        if (user) {
          console.log('Google redirect sign-in completed:', user.email);
          // User data will be loaded by the auth state change listener
        }
      } catch (error) {
        console.error('Error handling Google redirect:', error);
      }
    };
    
    handleRedirect();
    
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        setLoadingUserData(true);
        try {
          // Update last login
          await UserDataService.updateLastLogin(user.uid);
          
          // Load all user data
          const data = await UserDataService.loadUserData(user.uid);
          setUserData(data);
          
          console.log('User data loaded:', data);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserData(UserDataService.getEmptyUserData());
        } finally {
          setLoadingUserData(false);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [showSupportBot, setShowSupportBot] = useState(false);
  const [supportBotMessages, setSupportBotMessages] = useState([
    { id: '1', role: 'assistant', content: '👋 Hi! I\'m here to help with questions about Wave AI.\n\nFor idea validation, please use the main input above and click "Generate Ideas".' }
  ]);
  const [supportBotInput, setSupportBotInput] = useState('');
  const [supportBotSessionId, setSupportBotSessionId] = useState<string>('');

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const toggleSupportBot = () => {
    setShowSupportBot(!showSupportBot);
  };

  const handleSupportBotMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = { id: Date.now().toString(), role: 'user', content: message };
    setSupportBotMessages(prev => [...prev, userMessage]);
    setSupportBotInput('');

    // Add loading message
    const loadingMessage = { id: 'loading', role: 'assistant' as const, content: '🤖 Thinking...' };
    setSupportBotMessages(prev => [...prev, loadingMessage]);

    try {
      // Use smart AI chatbot for response
      const conversationHistory = supportBotMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      
      const response = await smartChatbot.generateResponse(message, conversationHistory);
      const assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: response };
      
      // Replace loading message with actual response
      setSupportBotMessages(prev => prev.filter(msg => msg.id !== 'loading').concat(assistantMessage));
      
      // Save chat to Firebase
      if (currentUser) {
        try {
          const currentSessionId = supportBotSessionId || `support-bot-${currentUser.uid}-${Date.now()}`;
          if (!supportBotSessionId) {
            setSupportBotSessionId(currentSessionId);
          }
          await saveChatMessage({
            userId: currentUser.uid,
            sessionId: currentSessionId,
            prompt: message,
            response: response
          });
        } catch (error) {
          console.error('Failed to save support bot chat to Firebase:', error);
        }
      }
    } catch (error) {
      console.error('Smart chatbot failed:', error);
      // Fallback to original response system
      const response = getWaveAIResponse(message);
      const assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: response };
      
      setSupportBotMessages(prev => prev.filter(msg => msg.id !== 'loading').concat(assistantMessage));
      
      // Save chat to Firebase even for fallback
      if (currentUser) {
        try {
          const currentSessionId = supportBotSessionId || `support-bot-${currentUser.uid}-${Date.now()}`;
          if (!supportBotSessionId) {
            setSupportBotSessionId(currentSessionId);
          }
          await saveChatMessage({
            userId: currentUser.uid,
            sessionId: currentSessionId,
            prompt: message,
            response: response
          });
        } catch (error) {
          console.error('Failed to save support bot chat to Firebase:', error);
        }
      }
    }
  };

  const getWaveAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Navigation commands
    if (lowerMessage.includes('go to') || lowerMessage.includes('navigate') || lowerMessage.includes('open')) {
      if (lowerMessage.includes('chat history') || lowerMessage.includes('history')) {
        setTimeout(() => {
          window.location.href = '/history.html';
        }, 1000);
        return '🧭 **Navigating to Chat History...**\n\nTaking you to your conversation archive where you can view and continue previous chats!';
      }
      
      if (lowerMessage.includes('graveyard')) {
        setTimeout(() => {
          window.location.href = '/graveyard.html';
        }, 1000);
        return '⚰️ **Navigating to Idea Graveyard...**\n\nTaking you to the graveyard where your ideas await resurrection!';
      }
      
      if (lowerMessage.includes('chat') || lowerMessage.includes('main chat')) {
        setTimeout(() => {
          window.location.href = 'http://localhost:5173/chat#/chat';
        }, 1000);
        return '💬 **Opening Full Chat Interface...**\n\nTaking you to the complete Wave AI chat experience!';
      }
      
      if (lowerMessage.includes('projects')) {
        setTimeout(() => {
          window.location.href = '/projects.html';
        }, 1000);
        return '📁 **Navigating to Projects...**\n\nTaking you to your project management area!';
      }
    }
    
    // Enhanced Wave AI information with RAG-like responses
    if (lowerMessage.includes('what') && lowerMessage.includes('wave')) {
      return '🌊 **Wave AI - The Idea Graveyard**\n\nWave AI is the world\'s first resurrection engine for abandoned ideas. It\'s not just a tool — it\'s a philosophy where failure becomes fuel, and forgotten projects find new life through AI-powered insight, emotional intelligence, and real-time market data.\n\n**Core Philosophy:**\n• Resurrect: Submit your failed idea to the Graveyard\n• Reimagine: AI performs autopsy and analysis\n• Revive: Get viability scores and revival blueprints\n\n*Wave AI doesn\'t just analyze — it resurrects!*';
    }
    
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use'))) {
      return '🚀 **How Wave AI Works:**\n\n**The Resurrection Process:**\n1. **Submit** - Enter your failed idea through conversational form\n2. **Autopsy** - Reflect on why it failed and your emotional state\n3. **Resurrect** - AI and real-time data analyze and mutate the idea\n4. **Revive** - Get viability score, new directions, and blueprints\n\n**What Makes Us Different:**\n• Built for failure, not just success\n• Emotion-aware AI that considers your mindset\n• Real-time market integration via Denodo\n• Actionable blueprints, not just feedback\n\n*Every step turns uncertainty into clarity!*';
    }
    
    if (lowerMessage.includes('different') || lowerMessage.includes('unique') || lowerMessage.includes('better')) {
      return '⚡ **Why Wave AI is Revolutionary:**\n\nIf other bots are search engines, Wave AI is a compass.\n\n**ChatGPT gives you answers.**\n**Wave AI gives you direction.**\n\n• **First platform designed for "failed" ideas**\n• **Emotion-aware AI** - considers your mindset, not just metrics\n• **Real-time market intelligence** - live data integration\n• **Decision Maker** - direct recommendations to pursue, pivot, or pause\n• **Resurrection focus** - doesn\'t fear failure, learns from it\n\n*Wave AI doesn\'t just respond — it resurrects!*';
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('free')) {
      return '💰 **Wave AI Pricing:**\n\n• **Free Tier** - 3 idea resurrections per month\n• **Pro Plan** - Unlimited resurrections + advanced features\n• **Enterprise** - Custom solutions for teams\n\n*Start your resurrection journey with our free tier!*';
    }
    
    if (lowerMessage.includes('feature') || lowerMessage.includes('capability')) {
      return '⚡ **Wave AI Capabilities:**\n\n• **Idea Graveyard** - Store and categorize failed ideas\n• **AI Autopsy Engine** - Deep forensic analysis of failures\n• **Market Intelligence** - Real-time data via Denodo\n• **Viability Scoring** - Comprehensive 0-100 rating system\n• **Revival Blueprints** - Actionable step-by-step plans\n• **Emotion Analysis** - Considers your mindset and motivation\n• **Trend Integration** - Current market and tech insights\n\n*Every feature designed for resurrection, not just analysis!*';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return '🆘 **Wave AI Support:**\n\n**Quick Actions:**\n• Say "go to chat history" to view past conversations\n• Say "go to graveyard" to access stored ideas\n• Say "open chat" for full AI interface\n\n**Getting Started:**\n• Use main input above for idea validation\n• Check our "How It Works" section on landing page\n• Visit different sections using navigation commands\n\n*I can navigate you anywhere in Wave AI!*';
    }
    
    return '🤖 **Wave AI Assistant Ready!**\n\nI can help you with:\n\n**Information:**\n• How Wave AI works\n• Features and capabilities\n• What makes us different\n• Pricing information\n\n**Navigation:**\n• "Go to chat history"\n• "Go to graveyard"\n• "Open chat"\n• "Go to projects"\n\n**Ask me anything about Wave AI or tell me where you\'d like to go!**';
  };

  // Tutorial removed as per user request

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await logOut();
      
      // Clear any stored data
      localStorage.clear();
      
      // Reset app state
      setCurrentUser(null);
      setUserData(null);
      
      // Redirect to landing page
      window.location.href = '/landing';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase logout fails, clear local data and redirect
      localStorage.clear();
      setCurrentUser(null);
      setUserData(null);
      window.location.href = '/landing';
    }
  };

  const showDynamicPopup = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setPopup({ show: true, title, message, type });
  };

  const hidePopup = () => {
    setPopup({ show: false, title: '', message: '', type: 'info' });
  };

  const generateIdeas = async (input: string) => {
    setIsGeneratingIdeas(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setIdeas(data.ideas);
        setShowIdeasScreen(true);
        showDynamicPopup('Ideas Generated!', `Successfully generated ${data.count} scalable business ideas.`, 'success');
      } else {
        throw new Error(data.error || 'Failed to generate ideas');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      showDynamicPopup('Generation Error', 'Failed to generate ideas. Please try again.', 'error');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleIdeaAction = async (idea: Idea, action: 'resurrect' | 'store' | 'build') => {
    localStorage.setItem('selectedIdea', JSON.stringify(idea));

    switch (action) {
      case 'resurrect': {
        window.location.href = 'resurrect.html';
        break;
      }
      case 'store': {
        // Store to Firebase if user is logged in
        if (currentUser) {
          try {
            await UserDataService.saveIdeaToGraveyard(
              currentUser.uid,
              idea.title,
              idea.description,
              idea.key_features || []
            );
            
            // Reload user data to reflect changes
            const updatedData = await UserDataService.loadUserData(currentUser.uid);
            setUserData(updatedData);
            
            showDynamicPopup('Idea Stored!', 'Your idea has been saved to the graveyard.', 'success');
          } catch (error) {
            console.error('Error storing idea:', error);
            showDynamicPopup('Storage Error', 'Failed to store idea. Please try again.', 'error');
          }
        }
        
        // Also store to localStorage for compatibility
        const stored = JSON.parse(localStorage.getItem('graveyard') || '[]') as Idea[];
        const updatedGraveyard = [
          {
            id: idea.id,
            title: idea.title,
            description: idea.description,
            date: new Date().toISOString().split('T')[0],
            type: 'Generated Idea',
            originalIdea: idea.description,
            metadata: idea
          },
          ...stored,
        ];
        localStorage.setItem('graveyard', JSON.stringify(updatedGraveyard));
        showDynamicPopup('Idea Stored!', 'The idea has been saved to your graveyard.', 'success');
        break;
      }
      case 'build': {
        localStorage.setItem('buildIdea', JSON.stringify(idea));
        window.location.href = 'build.html';
        break;
      }
    }
  };

  const closeIdeasScreen = () => {
    setShowIdeasScreen(false);
    setIdeas([]);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white relative futuristic-bg">
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[1001] md:hidden flex items-center justify-center w-12 h-12 bg-[#009DFF] hover:bg-[#0891b2] rounded-lg text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#009DFF]/40"
        title="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] md:hidden"
          onClick={() => setSidebarExpanded(false)}
        />
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 backdrop-blur-sm"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Logout</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-[1000] flex flex-col justify-between py-5 border-r border-[#2a2a2a] ${
          sidebarExpanded
            ? 'w-[220px] bg-[#1E1E1E] md:translate-x-0'
            : 'w-[60px] bg-[#141414] md:translate-x-0'
        } ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top Section */}
        <div className="flex flex-col items-start space-y-2 px-2.5">
          <button
            onClick={toggleSidebar}
            className="w-full h-12 flex items-center gap-3 px-3 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 hover:text-cyan-400 hover:shadow-cyan text-white border-b border-[#2a2a2a] pb-4 mb-4"
            title="Toggle Menu"
          >
            <Menu className="w-6 h-6 min-w-[24px]" />
            {sidebarExpanded && <span className="text-sm font-medium">Menu</span>}
          </button>

          <a
            href="/main"
            className="w-full h-12 flex items-center gap-3 px-3 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 hover:text-cyan-400 hover:shadow-cyan text-white no-underline"
            title="Home"
          >
            <Home className="w-6 h-6 min-w-[24px]" />
            {sidebarExpanded && <span className="text-sm font-medium">Home</span>}
          </a>

          <a
            href="history.html"
            className="w-full h-12 flex items-center gap-3 px-3 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 hover:text-cyan-400 hover:shadow-cyan text-white no-underline"
            title="Chat History"
          >
            <Clock className="w-6 h-6 min-w-[24px]" />
            {sidebarExpanded && <span className="text-sm font-medium">Chat History</span>}
          </a>

          <a
            href="graveyard.html"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors duration-200"
            title="Graveyard"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Enhanced Tombstone */}
              <path d="M8 22 L8 14 Q8 10 12 10 Q16 10 16 14 L16 22 Z" fill="currentColor" opacity="0.8"/>
              {/* Tombstone top arch */}
              <path d="M8 14 Q8 8 12 8 Q16 8 16 14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              {/* Cross on tombstone */}
              <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2"/>
              {/* Ground line */}
              <line x1="6" y1="22" x2="18" y2="22" stroke="currentColor" strokeWidth="1"/>
              {/* Ghost effect */}
              <circle cx="12" cy="6" r="2" fill="currentColor" opacity="0.3"/>
              <path d="M10 4 Q12 2 14 4 Q14 6 12 6 Q10 6 10 4" fill="currentColor" opacity="0.2"/>
            </svg>
            {sidebarExpanded && <span className="text-sm font-medium">Graveyard</span>}
          </a>

          <a
            href="/projects"
            className="w-full h-12 flex items-center gap-3 px-3 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 hover:text-cyan-400 hover:shadow-cyan text-white no-underline"
            title="Projects"
          >
            <Folder className="w-6 h-6 min-w-[24px]" />
            {sidebarExpanded && <span className="text-sm font-medium">Projects</span>}
          </a>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-center px-2.5">
          <a
            href="/profile"
            className="w-10 h-10 bg-gradient-to-br from-[#009DFF] to-[#0891b2] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(0,157,255,0.6)] transition-all duration-300 hover:scale-110 no-underline"
            title="Profile Settings"
          >
            <User className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999] md:hidden"
          onClick={toggleSidebar}
        />
      )}

        {/* Futuristic Background Elements */}
        <div className="floating-shapes">
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
        </div>
        
        <div className="drifting-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        {/* Main Content */}
        <div
          className={`transition-all duration-300 flex flex-col min-h-screen pt-16 md:pt-0 px-4 md:px-0 ${
            sidebarExpanded ? 'md:ml-[220px]' : 'md:ml-[60px]'
          }`}
        >
        {/* Header Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12 animate-fadeInUp">
            {/* Animated Logo */}
            <div className="mb-6 flex justify-center">
              <img 
                src="/no_bg_wave_logo.png" 
                alt="Wave AI Logo" 
                className="h-24 w-24 md:h-32 md:w-32 object-contain"
                style={{
                  animation: 'logoFloat 3s ease-in-out infinite'
                }}
              />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-wider font-necosmic animate-fadeInScale">
              <span className="text-white">WAVE</span>
              <span className="text-cyan-400 neon-glow"> AI</span>
            </h1>
            <div className="space-y-2 animate-slideInLeft">
              <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 font-hk-modular">
                The Idea Graveyard
              </h2>
              <p className="text-gray-300 text-lg md:text-xl max-w-md mx-auto leading-relaxed font-courier">
                Resurrect. Reimagine. Revive.
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="pb-8 md:pb-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-4 items-center animate-slideInRight">
              <div className="w-full">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter Your Idea ..."
                  className="w-full px-8 py-4 bg-[#2a2a2a] border-2 border-transparent rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:shadow-input-glow transition-all duration-300 hover:scale-105"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2 animate-fadeInUp">
                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      const idea = inputValue.trim();
                      localStorage.setItem('ideaText', idea);
                      // also push into graveyard collection
                      const graveyard = JSON.parse(localStorage.getItem('graveyard') || '[]');
                      graveyard.unshift({
                        id: Date.now().toString(),
                        title: 'Stored Idea',
                        description: idea,
                        date: new Date().toISOString().split('T')[0],
                        type: 'Idea',
                        originalIdea: idea
                      });
                      localStorage.setItem('graveyard', JSON.stringify(graveyard));
                      window.location.href = 'graveyard.html';
                    } else {
                      showDynamicPopup('Input Required', 'Please enter an idea before storing.', 'warning');
                      return;
                    }
                  }}
                  className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition-all duration-300 hover:shadow-button-glow hover:border hover:border-cyan-400 font-medium text-sm"
                >
                  Store
                </button>

                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      generateIdeas(inputValue.trim());
                    } else {
                      showDynamicPopup('Input Required', 'Please enter some keywords or description to generate ideas.', 'warning');
                      return;
                    }
                  }}
                  disabled={isGeneratingIdeas}
                  className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition-all duration-300 hover:shadow-button-glow hover:border hover:border-cyan-400 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingIdeas ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>

                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      localStorage.setItem('ideaText', inputValue.trim());
                      window.location.href = 'resurrect.html';
                    } else {
                      showDynamicPopup('Input Required', 'Please enter an idea before resurrecting.', 'warning');
                      return;
                    }
                  }}
                  className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition-all duration-300 hover:shadow-button-glow hover:border hover:border-cyan-400 font-medium text-sm"
                >
                  Resurrect
                </button>

                <button
                  onClick={() => {
                    // Clear any previous chat data to start fresh
                    localStorage.removeItem('chatMessages');
                    localStorage.removeItem('chatMode');
                    localStorage.removeItem('autoMessage');
                    localStorage.removeItem('autoMode');
                    window.location.href = 'http://localhost:5173/chat#/chat';
                  }}
                  className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition-all duration-300 hover:shadow-button-glow hover:border hover:border-cyan-400 font-medium text-sm"
                >
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex justify-center py-4 px-4">
          <p className="text-gray-400 text-xs text-center max-w-md">
            Wave AI might make mistakes
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-center py-6 px-4">
          <p className="text-gray-500 text-sm">
            2025 Wave AI
          </p>
        </div>
      </div>

      {/* Ideas Display Screen */}
      {showIdeasScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
              <h2 className="text-2xl font-bold text-white">Generated Business Ideas</h2>
              <button
                onClick={closeIdeasScreen}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid gap-6">
                {ideas.map((idea) => (
                  <div key={idea.id} className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl p-6 hover:border-cyan-400 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{idea.title}</h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">{idea.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-400">Target Market</span>
                            <p className="text-white font-medium">{idea.target_market}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Revenue Potential</span>
                            <p className={`font-medium ${
                              idea.revenue_potential === 'High' ? 'text-green-400' :
                              idea.revenue_potential === 'Medium' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>{idea.revenue_potential}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Scalability</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(idea.scalability_score / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-white font-medium">{idea.scalability_score}/10</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Investment</span>
                            <p className="text-white font-medium">{idea.initial_investment}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-sm text-gray-400">Key Features</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {idea.key_features.map((feature: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Category: <span className="text-white">{idea.category}</span></span>
                          <span>Time to Market: <span className="text-white">{idea.time_to_market}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4 border-t border-[#3a3a3a]">
                      <button
                        onClick={() => handleIdeaAction(idea, 'resurrect')}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all duration-300 font-medium"
                      >
                        Resurrect
                      </button>
                      <button
                        onClick={() => handleIdeaAction(idea, 'store')}
                        className="flex-1 px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition-all duration-300 font-medium"
                      >
                        Store
                      </button>
                      <button
                        onClick={() => handleIdeaAction(idea, 'build')}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-lg transition-all duration-300 font-medium"
                      >
                        Build
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  popup.type === 'warning' ? 'bg-yellow-500/20' :
                  popup.type === 'error' ? 'bg-red-500/20' :
                  popup.type === 'success' ? 'bg-green-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${
                    popup.type === 'warning' ? 'text-yellow-400' :
                    popup.type === 'error' ? 'text-red-400' :
                    popup.type === 'success' ? 'text-green-400' :
                    'text-blue-400'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{popup.title}</h3>
              </div>
              <button
                onClick={hidePopup}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">{popup.message}</p>
            <div className="flex justify-end">
              <button
                onClick={hidePopup}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  popup.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                  popup.type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' :
                  popup.type === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' :
                  'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Support Bot - Enhanced */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] support-bot-trigger">
        {/* Support Bot Chat Window */}
        {showSupportBot && (
          <div className="mb-4 w-[calc(100vw-2rem)] max-w-[420px] h-[calc(100vh-8rem)] max-h-[580px] sm:w-[420px] sm:h-[580px] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#009DFF] rounded-2xl shadow-[0_20px_60px_rgba(0,157,255,0.4)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl flex flex-col">
            {/* Header with Wave AI Branding */}
            <div className="relative bg-gradient-to-r from-[#009DFF] to-[#0891b2] p-3 sm:p-4 text-white overflow-hidden flex-shrink-0">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                  animation: 'slide 20s linear infinite'
                }}></div>
              </div>
              
              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Animated Wave Logo */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg viewBox="0 0 200 200" className="w-6 h-6 sm:w-8 sm:h-8">
                      <defs>
                        <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{stopColor:'#009DFF'}} />
                          <stop offset="100%" style={{stopColor:'#00d4ff'}} />
                        </linearGradient>
                      </defs>
                      <path d="M60 100 Q80 70, 100 100 T140 100" stroke="url(#botGradient)" strokeWidth="8" fill="none" strokeLinecap="round">
                        <animate attributeName="d" values="M60 100 Q80 70, 100 100 T140 100;M60 100 Q80 130, 100 100 T140 100;M60 100 Q80 70, 100 100 T140 100" dur="3s" repeatCount="indefinite"/>
                      </path>
                    </svg>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse ring-2 ring-white"></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg font-['Orbitron'] tracking-wide truncate">Wave AI Agent</h3>
                    <p className="text-xs opacity-90 flex items-center gap-1 sm:gap-2 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                        <span>Online</span>
                      </span>
                      <span className="opacity-60">•</span>
                      <span>RAG-Powered</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleSupportBot}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 sm:p-2 transition-all duration-200 hover:rotate-90 flex-shrink-0"
                  aria-label="Close chat"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0a0a0a] space-y-3 custom-scrollbar min-h-0">
                {supportBotMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    style={{animationDelay: `${index * 50}ms`}}
                  >
                    <div
                      className={`rounded-2xl p-3 sm:p-4 max-w-[90%] sm:max-w-[85%] shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-[#009DFF] to-[#0891b2] text-white ml-2 sm:ml-8'
                          : 'bg-[#1a1a1a] text-gray-200 mr-2 sm:mr-8 border border-[#2a2a2a]'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2 text-[#009DFF] text-xs font-semibold">
                          <svg viewBox="0 0 200 200" className="w-4 h-4">
                            <path d="M60 100 Q80 70, 100 100 T140 100" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
                          </svg>
                          Wave AI
                        </div>
                      )}
                      <div className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t-2 border-[#009DFF]/20 bg-[#0a0a0a]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={supportBotInput}
                    onChange={(e) => setSupportBotInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && supportBotInput.trim()) {
                        handleSupportBotMessage(supportBotInput);
                      }
                    }}
                    placeholder="Ask me anything about Wave AI..."
                    className="flex-1 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-[#009DFF] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    onClick={() => supportBotInput.trim() && handleSupportBotMessage(supportBotInput)}
                    className="bg-gradient-to-r from-[#009DFF] to-[#0891b2] hover:from-[#0891b2] hover:to-[#009DFF] text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#009DFF]/50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px]"
                    disabled={!supportBotInput.trim()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Powered by Wave AI • Always here to help</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Toggle Button */}
        <button
          onClick={toggleSupportBot}
          className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#009DFF] to-[#0891b2] hover:from-[#0891b2] hover:to-[#009DFF] rounded-full shadow-[0_8px_32px_rgba(0,157,255,0.4)] flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_48px_rgba(0,157,255,0.6)] group"
        >
          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-full bg-[#009DFF] animate-ping opacity-20"></div>
          
          {/* Icon */}
          <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
            {showSupportBot ? (
              <X size={24} className="sm:w-7 sm:h-7 transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <svg viewBox="0 0 200 200" className="w-6 h-6 sm:w-8 sm:h-8">
                <path d="M60 100 Q80 70, 100 100 T140 100" stroke="white" strokeWidth="12" fill="none" strokeLinecap="round">
                  <animate attributeName="d" values="M60 100 Q80 70, 100 100 T140 100;M60 100 Q80 130, 100 100 T140 100;M60 100 Q80 70, 100 100 T140 100" dur="2s" repeatCount="indefinite"/>
                </path>
              </svg>
            )}
          </div>
          
          {/* Notification Badge */}
          {!showSupportBot && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
              !
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
