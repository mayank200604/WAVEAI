import { useState, useEffect, useRef } from 'react';
import { Popup, usePopup } from './Popup';
import { onAuthChange } from './firebase/auth';
import { saveChatMessage } from './firebase/db';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'life_guidance' | 'wave_ai_info' | 'idea_analysis';
  category?: string;
};

type MessageAction = 'share' | 'copy' | 'reply' | 'rethink';

// Enhanced markdown renderer with proper paragraph formatting
const renderMarkdown = (text: string) => {
  if (!text) return '';
  
  // Split text into paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  const processedParagraphs = paragraphs.map(paragraph => {
    if (!paragraph.trim()) return '';
    
    // Convert markdown to HTML for each paragraph
    let html = paragraph
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 p-3 rounded-lg overflow-x-auto my-2"><code class="text-green-400">$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-green-400 text-sm">$1</code>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-gray-300 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-gray-300 mb-1">$1</li>')
      // Single line breaks within paragraphs
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if it's not already a header, list, or code block
    if (!html.match(/^<(h[1-6]|pre|ul|ol)/i)) {
      html = `<p class="mb-4 leading-relaxed text-gray-100">${html}</p>`;
    }
    
    return html;
  }).filter(p => p.trim());
  
  return <div dangerouslySetInnerHTML={{ __html: processedParagraphs.join('') }} />;
};

function Chat() {
  const [mode, setMode] = useState<'chat' | 'idea'>('idea'); // Set idea as default
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { popup, showPopup, hidePopup } = usePopup();

  const BACKEND_URL = 'http://localhost:5000';

  // Function to generate idea name from message
  const generateIdeaName = (message: string): string => {
    const words = message.split(' ').slice(0, 4);
    return words.join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Untitled Idea';
  };

  // Function to save chat to history (both localStorage and Firebase)
  const saveChatToHistory = async (messages: Message[], mode: string) => {
    if (messages.length < 2) return; // Don't save if no real conversation

    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;

    const ideaName = generateIdeaName(userMessages[0].content);
    const chatId = crypto.randomUUID();
    
    const chatHistory = {
      id: chatId,
      name: ideaName,
      mode: mode,
      messages: messages,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Get existing chat history
    const existingHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // Add new chat to beginning of array
    existingHistory.unshift(chatHistory);
    
    // Keep only last 50 chats
    if (existingHistory.length > 50) {
      existingHistory.splice(50);
    }
    
    // Save back to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(existingHistory));
    
    // Save to Firebase if user is logged in
    if (currentUser && messages.length >= 2) {
      try {
        // Get the last user message and assistant response
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
        
        if (lastUserMessage && lastAssistantMessage) {
          const currentSessionId = sessionId || `chat-${currentUser.uid}-${Date.now()}`;
          if (!sessionId) {
            setSessionId(currentSessionId);
          }
          
          await saveChatMessage({
            userId: currentUser.uid,
            sessionId: currentSessionId,
            prompt: lastUserMessage.content,
            response: lastAssistantMessage.content
          });
        }
      } catch (error) {
        console.error('Failed to save chat to Firebase:', error);
      }
    }
  };

  // Check backend connection on component mount and get current user
  useEffect(() => {
    checkBackendConnection();
    loadPreviousChat();
    
    // Get current user for Firebase
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        // Generate new session ID for this chat session
        setSessionId(`chat-${user.uid}-${Date.now()}`);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Load previous chat if continuing from history
  const loadPreviousChat = () => {
    try {
      const autoMessage = localStorage.getItem('autoMessage');
      const autoMode = localStorage.getItem('autoMode');
      const loadChatId = localStorage.getItem('loadChatId');
      
      // Handle loading existing chat from history
      if (loadChatId) {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chat = chatHistory.find((c: any) => c.id === loadChatId);
        
        if (chat) {
          setMode(chat.mode);
          setMessages(chat.messages);
          localStorage.removeItem('loadChatId');
          return;
        }
      }
      
      // Only handle auto-message from Generate button, not previous chats
      if (autoMessage && autoMode) {
        // Handle auto-message from Generate button
        setMode(autoMode as 'chat' | 'idea');
        
        // Clear auto-message data
        localStorage.removeItem('autoMessage');
        localStorage.removeItem('autoMode');
        
        // Auto-send the message
        setTimeout(() => {
          setInput(autoMessage);
          void sendMessage(autoMessage);
        }, 500);
      }
    } catch (error) {
      console.error('Error loading previous chat:', error);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollResponder();
  }, [messages]);

  const scrollResponder = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const handleModeChange = async (newMode: 'chat' | 'idea') => {
    if (newMode === mode) return;
    
    setIsTransitioning(true);
    
    // Add a futuristic transition effect
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    setMode(newMode);
    setMessages([]); // Clear messages when switching modes
    
    // Add a welcome message for the new mode
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: newMode === 'idea' 
        ? "**Idea Analysis Mode Activated**\n\nI'm ready to analyze your ideas! Share any concept, and I'll provide detailed insights about its potential, strengths, and actionable next steps."
        : "**Casual Chat & WAVE AI Mode Activated**\n\nI'm here for casual conversations, general questions, or anything about WAVE AI. What would you like to chat about?",
      type: newMode === 'idea' ? 'idea_analysis' : 'life_guidance',
      category: 'system'
    };
    
    setMessages([welcomeMessage]);
    setIsTransitioning(false);
  };

  // Handle message actions
  const handleMessageAction = async (action: MessageAction, message: Message) => {
    switch (action) {
      case 'copy':
        await navigator.clipboard.writeText(message.content);
        showPopup('Copied!', 'Message copied to clipboard', 'success', 2000);
        break;
      
      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'WAVE AI Chat',
              text: message.content,
            });
          } catch (err) {
            // User cancelled or share failed
            console.log('Share cancelled');
          }
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(message.content);
          showPopup('Copied!', 'Message copied to clipboard (share not supported)', 'success', 2500);
        }
        break;
      
      case 'reply':
        setInput(`Regarding: "${message.content.substring(0, 50)}..."\n\n`);
        break;
      
      case 'rethink':
        if (message.role === 'assistant') {
          setIsLoading(true);
          setIsStreaming(true);
          try {
            // Find the previous user message
            const messageIndex = messages.findIndex(m => m.id === message.id);
            const previousUserMessage = messages.slice(0, messageIndex).reverse().find(m => m.role === 'user');
            
            if (previousUserMessage) {
              const response = await fetch(`${BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: previousUserMessage.content,
                  mode: mode,
                  use_rag: true,
                  rethink: true,
                }),
              });

              if (response.ok) {
                const data = await response.json();
                let content = '';
                
                if (mode === 'idea' && data.success && data.analysis) {
                  content = formatIdeaAnalysis(data.analysis);
                } else if (data.success && data.response) {
                  content = extractResponseContent(data.response);
                } else {
                  content = data.error || data.message || 'Unable to rethink response.';
                }

                const newMessage: Message = {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: `🔄 **Rethought Response:**\n\n${content}`,
                  type: message.type,
                  category: message.category,
                };

                setMessages(prev => [...prev, newMessage]);
                showPopup('Rethink Complete', 'Generated a new perspective on your question', 'success', 2500);
              }
            }
          } catch (error) {
            showPopup('Error', 'Failed to rethink response', 'error', 2500);
          } finally {
            setIsLoading(false);
            setIsStreaming(false);
          }
        }
        break;
    }
  };

  // Helper function to format idea analysis
  const formatIdeaAnalysis = (analysis: any): string => {
    let content = `# 💡 Comprehensive Idea Analysis\n\n`;
    
    if (analysis.validation_score) {
      const score = analysis.validation_score.validation_score;
      const confidence = analysis.validation_score.confidence_level;
      content += `## 📊 Validation Score: ${score}/100\n`;
      content += `**Confidence Level:** ${confidence}\n`;
      content += `**Market Readiness:** ${score > 75 ? 'High - Ready for market entry' : score > 55 ? 'Medium - Needs refinement' : 'Low - Requires significant development'}\n\n`;
    }
    
    if (analysis.ai_analysis && analysis.ai_analysis.analysis) {
      content += `## 🤖 AI-Powered Analysis\n${analysis.ai_analysis.analysis}\n\n`;
    }
    
    return content;
  };

  // Helper function to extract response content
  const extractResponseContent = (responseData: any): string => {
    if (responseData.response && typeof responseData.response === 'object') {
      responseData = responseData.response;
    }
    
    if (typeof responseData === 'string') {
      return responseData;
    } else if (responseData.guidance) {
      return responseData.guidance + (responseData.follow_up ? '\n\n' + responseData.follow_up : '');
    } else if (responseData.response) {
      return responseData.response;
    } else if (responseData.content) {
      return responseData.content;
    } else if (responseData.message) {
      return responseData.message;
    }
    
    return 'Response received but format was unexpected.';
  };

  const sendMessage = async (messageText?: string) => {
    const trimmed = messageText ?? input.trim();
    if (!trimmed || isLoading || isStreaming) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          mode: mode,
          use_rag: true, // Enable RAG system for enhanced responses
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      
      let content = '';
      let messageType: 'life_guidance' | 'wave_ai_info' | 'idea_analysis' = mode === 'idea' ? 'idea_analysis' : 'life_guidance';
      let category = 'general';

      if (mode === 'idea' && data.success && data.analysis) {
        // Handle idea analysis response
        const analysis = data.analysis;
        content = `# 💡 Comprehensive Idea Analysis\n\n`;
        
        // Validation Score Section
        if (analysis.validation_score) {
          const score = analysis.validation_score.validation_score;
          const confidence = analysis.validation_score.confidence_level;
          content += `## 📊 Validation Score: ${score}/100\n`;
          content += `**Confidence Level:** ${confidence}\n`;
          content += `**Market Readiness:** ${score > 75 ? 'High - Ready for market entry' : score > 55 ? 'Medium - Needs refinement' : 'Low - Requires significant development'}\n\n`;
          
          if (analysis.validation_score.detailed_breakdown) {
            const breakdown = analysis.validation_score.detailed_breakdown;
            content += `### Score Breakdown:\n`;
            content += `• **Market Volatility Impact:** ${breakdown.market_volatility || 'N/A'}\n`;
            content += `• **Tech Expertise Ratio:** ${(breakdown.tech_expertise_ratio * 100).toFixed(1)}%\n`;
            content += `• **Idea Complexity:** ${breakdown.idea_word_count} words (${breakdown.idea_word_count > 50 ? 'Detailed' : breakdown.idea_word_count > 20 ? 'Moderate' : 'Brief'})\n`;
            content += `• **Technology Keywords Found:** ${breakdown.tech_keywords_found}\n`;
            content += `• **Business Indicators:** ${breakdown.business_indicators}\n\n`;
          }
        }
        
        // AI Analysis Section
        if (analysis.ai_analysis && analysis.ai_analysis.analysis) {
          content += `## 🤖 AI-Powered Analysis\n${analysis.ai_analysis.analysis}\n\n`;
          
          if (analysis.ai_analysis.recommendations) {
            content += `### Key Recommendations:\n`;
            analysis.ai_analysis.recommendations.forEach((rec: string, index: number) => {
              content += `${index + 1}. ${rec}\n`;
            });
            content += `\n`;
          }
        }
        
        // Business Model Section
        if (analysis.business_plan) {
          content += `## 📈 Business Model Analysis\n`;
          content += `**Primary Model:** ${analysis.business_plan.business_model}\n`;
          
          if (analysis.business_plan.revenue_projections) {
            content += `**Revenue Projections:**\n`;
            content += `• Year 1: $${analysis.business_plan.revenue_projections.year_1?.toLocaleString() || 'TBD'}\n`;
            content += `• Year 2: $${analysis.business_plan.revenue_projections.year_2?.toLocaleString() || 'TBD'}\n`;
            content += `• Year 3: $${analysis.business_plan.revenue_projections.year_3?.toLocaleString() || 'TBD'}\n\n`;
          }
          
          if (analysis.business_plan.key_strategies) {
            content += `**Key Strategies:**\n`;
            analysis.business_plan.key_strategies.forEach((strategy: string, index: number) => {
              content += `${index + 1}. ${strategy}\n`;
            });
            content += `\n`;
          }
        }
        
        // Market Analysis Section
        if (analysis.market_analysis && !analysis.market_analysis.error) {
          content += `## 🌍 Market Analysis\n`;
          content += `**Market Volatility:** ${analysis.market_analysis.market_volatility || 'Moderate'}\n`;
          content += `**Sector Performance:** ${analysis.market_analysis.sector_performance || 'Stable'}\n`;
          content += `**Growth Potential:** ${analysis.market_analysis.growth_potential || 'Moderate'}\n\n`;
        }
        
        // Technology Trends
        if (analysis.tech_analysis && !analysis.tech_analysis.error) {
          content += `## 💻 Technology Trends\n`;
          content += `**Tech Readiness:** ${analysis.tech_analysis.tech_readiness || 'Moderate'}\n`;
          content += `**Innovation Score:** ${analysis.tech_analysis.innovation_score || 'N/A'}\n`;
          content += `**Implementation Complexity:** ${analysis.tech_analysis.complexity || 'Moderate'}\n\n`;
        }
        
        // Success Factors
        if (analysis.validation_score && analysis.validation_score.factors_analyzed) {
          content += `## ✅ Success Factors Analyzed\n`;
          analysis.validation_score.factors_analyzed.forEach((factor: string) => {
            content += `• ${factor.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}\n`;
          });
          content += `\n`;
        }
        
        // Next Steps
        content += `## 🚀 Recommended Next Steps\n`;
        content += `1. **Market Validation:** Conduct customer interviews and surveys\n`;
        content += `2. **Prototype Development:** Create a minimum viable product (MVP)\n`;
        content += `3. **Competitive Analysis:** Research direct and indirect competitors\n`;
        content += `4. **Resource Planning:** Identify required skills, funding, and timeline\n`;
        content += `5. **Risk Assessment:** Evaluate potential challenges and mitigation strategies\n\n`;
        
        content += `*Analysis completed on ${new Date().toLocaleDateString()} using real-time market data and AI insights.*`;
        
        messageType = 'idea_analysis';
        category = analysis.category || 'general';
        
      } else if (data.success && data.response) {
        // Handle chat response - the backend returns nested response structure
        let responseData = data.response;
        
        // If response has another nested response, extract it
        if (responseData.response && typeof responseData.response === 'object') {
          responseData = responseData.response;
        }
        
        if (typeof responseData === 'string') {
          content = responseData;
        } else if (responseData.guidance) {
          content = responseData.guidance;
          if (responseData.follow_up) {
            content += '\n\n' + responseData.follow_up;
          }
        } else if (responseData.response) {
          content = responseData.response;
        } else if (responseData.content) {
          content = responseData.content;
        } else if (responseData.message) {
          content = responseData.message;
        } else {
          // Try to extract any text content from the response
          const textContent = JSON.stringify(responseData);
          content = textContent.length > 10 ? 
            'I received your message and processed it, but the response format was unexpected. Please try rephrasing your question.' :
            'I received your message but had trouble processing it. Please try again.';
        }
        
        // Handle different response types
        if (responseData.type) {
          if (responseData.type === 'ai_response') {
            messageType = 'life_guidance';
          } else if (['life_guidance', 'wave_ai_info', 'idea_analysis'].includes(responseData.type)) {
            messageType = responseData.type as 'life_guidance' | 'wave_ai_info' | 'idea_analysis';
          }
        }
        
        if (responseData.category) {
          category = responseData.category;
        }
      } else {
        content = data.error || data.message || 'I am not sure how to respond to that.';
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: content,
        type: messageType,
        category: category,
      };

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, assistantMessage];
        // Save chat to history after assistant responds
        saveChatToHistory(updatedMessages, mode);
        return updatedMessages;
      });

      if (mode === 'idea') {
        showPopup(
          'Idea Analysis Ready',
          'Review the assistant insights below for your idea.',
          'success',
          2800,
        );
      }

      const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      history.unshift({
        id: Date.now().toString(),
        content: assistantMessage.content,
        type: mode === 'idea' ? 'Idea Analysis' : 'WAVE AI Chat',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('chatHistory', JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error('Error sending message:', error);
      setBackendStatus('error');
      showPopup(
        'Connection Issue',
        'Unable to reach the assistant backend. Please ensure the server is running and try again.',
        'error',
        3200,
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414] text-white flex flex-col overflow-hidden">
      {/* Dynamic Popup */}
      <Popup
        isOpen={popup.isOpen}
        onClose={hidePopup}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        duration={popup.duration}
      />
      {/* Futuristic background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>


      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Switching Modes...
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {mode === 'chat' ? 'Activating Idea Analysis' : 'Activating Casual Chat'}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1e1e1e] border-b border-[#3a3a3a]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-all duration-300 hover:text-cyan-400"
              title="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
              <span className="text-sm">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                WAVE AI Chatbot
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-green-400 animate-pulse'
                    : backendStatus === 'error'
                      ? 'bg-red-400'
                      : 'bg-yellow-400 animate-pulse'
                }`}
              />
              <span>
                {backendStatus === 'connected'
                  ? 'Connected'
                  : backendStatus === 'error'
                    ? 'Disconnected'
                    : 'Connecting...'}
              </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300" htmlFor="chat-mode">
              Mode
            </label>
            <select
              id="chat-mode"
              value={mode}
              onChange={(e) => void handleModeChange(e.target.value as 'chat' | 'idea')}
              disabled={isTransitioning}
              className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-1 text-sm transition-all duration-300 hover:border-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              <option value="chat">Casual Chat & WAVE AI</option>
              <option value="idea">Idea Analysis</option>
            </select>
          </div>
        </div>

        {/* Mode Description - Compact */}
        <div className="flex-shrink-0 p-3 bg-[#1e1e1e] border-b border-[#3a3a3a]">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${mode === 'idea' ? 'bg-green-400 animate-pulse' : 'bg-blue-400 animate-pulse'}`}></div>
            <h3 className="text-sm font-semibold text-white">
              {mode === 'idea' ? 'Idea Analysis Mode' : 'Casual Chat Mode'}
            </h3>
            <span className="text-xs text-gray-400">
              {mode === 'chat'
                ? "Ask me anything! I'm here for casual conversations, general questions, or anything about WAVE AI!"
                : "Share your idea and I'll analyze its potential, strengths, and provide actionable next steps."}
            </span>
          </div>
        </div>

        {/* Main Chat Area - Takes remaining height */}
        <div className="flex-1 bg-[#1e1e1e] overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((m, index) => (
            <div
              key={m.id}
              className={`group flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  AI
                </div>
              )}

              <div className={`flex-1 max-w-[80%] ${m.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white ml-auto'
                      : 'bg-[#2a2a2a] border border-[#3a3a3a] text-gray-100'
                  }`}
                >
                  {m.role === 'assistant' && m.type && (
                    <div className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          m.type === 'idea_analysis'
                            ? 'bg-green-500/20 text-green-400'
                            : m.type === 'wave_ai_info'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {m.type === 'idea_analysis'
                          ? 'Idea Analysis'
                          : m.type === 'wave_ai_info'
                            ? 'WAVE AI Info'
                            : 'Casual Chat'}
                      </span>
                      {isStreaming && index === messages.length - 1 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="leading-relaxed prose prose-invert max-w-none">
                    {renderMarkdown(m.content)}
                    {isStreaming && index === messages.length - 1 && m.role === 'assistant' && (
                      <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse"></span>
                    )}
                  </div>
                </div>
                
                {/* Message Action Buttons */}
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleMessageAction('copy', m)}
                    className="p-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-cyan-400 transition-all duration-200 text-xs flex items-center gap-1"
                    title="Copy message"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                  </button>
                  
                  <button
                    onClick={() => handleMessageAction('share', m)}
                    className="p-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-cyan-400 transition-all duration-200 text-xs flex items-center gap-1"
                    title="Share message"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Share</span>
                  </button>
                  
                  <button
                    onClick={() => handleMessageAction('reply', m)}
                    className="p-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-cyan-400 transition-all duration-200 text-xs flex items-center gap-1"
                    title="Reply to message"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 14 4 9 9 4"></polyline>
                      <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                    </svg>
                    <span>Reply</span>
                  </button>
                  
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleMessageAction('rethink', m)}
                      className="p-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-purple-400 transition-all duration-200 text-xs flex items-center gap-1"
                      title="Rethink response"
                      disabled={isLoading || isStreaming}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                      <span>Rethink</span>
                    </button>
                  )}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  U
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                  🤖
                </div>
                <div className="text-xl font-bold mb-2">Welcome to WAVE AI Chatbot!</div>
                <div className="text-sm max-w-md">
                  {mode === 'chat'
                    ? "Ask me anything about life, career, relationships, or WAVE AI. I'm here to provide guidance and support."
                    : "Share your idea and I'll provide detailed analysis and guidance. Let's turn your concept into reality!"}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 bg-[#1e1e1e] border-t border-[#3a3a3a] p-4">
          <form
            className="flex gap-3 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
                placeholder={mode === 'idea' ? 'Describe your idea in detail...' : 'Ask me anything...'}
                disabled={isLoading || isTransitioning || isStreaming}
                rows={1}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition-all duration-300 disabled:opacity-50 resize-none min-h-[48px] max-h-[120px]"
                style={{ minHeight: '48px', maxHeight: '120px', height: 'auto' }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || isTransitioning || isStreaming || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 flex items-center gap-2 font-medium"
            >
              {isLoading || isStreaming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isStreaming ? 'Thinking...' : 'Sending...'}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                  </svg>
                  Send
                </>
              )}
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
              {isStreaming ? 'AI is responding...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;


