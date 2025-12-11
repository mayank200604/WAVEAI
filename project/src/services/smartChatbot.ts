// Smart AI-Powered Chatbot Service for Wave AI
// Uses OpenRouter API for intelligent responses

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatbotConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class SmartChatbotService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private model: string = 'meta-llama/llama-3.1-70b-instruct';
  private temperature: number = 0.7;
  private maxTokens: number = 1000;
  
  // Wave AI knowledge base
  private waveAIKnowledge = {
    about: `Wave AI is the world's first resurrection engine for abandoned ideas. It's not just a tool — it's a philosophy where failure becomes fuel, and forgotten projects find new life through AI-powered insight, emotional intelligence, and real-time market data.`,
    
    features: [
      'Idea Graveyard - Store and categorize failed ideas',
      'AI Autopsy Engine - Deep forensic analysis of failures', 
      'Market Intelligence - Real-time data via Denodo',
      'Viability Scoring - Comprehensive 0-100 rating system',
      'Revival Blueprints - Actionable step-by-step plans',
      'Emotion Analysis - Considers your mindset and motivation',
      'Trend Integration - Current market and tech insights',
      'WaveCodeGen - AI-powered website generation'
    ],
    
    process: [
      'Submit - Enter your failed idea through conversational form',
      'Autopsy - Reflect on why it failed and your emotional state', 
      'Resurrect - AI and real-time data analyze and mutate the idea',
      'Revive - Get viability score, new directions, and blueprints'
    ],
    
    pricing: {
      free: '3 idea resurrections per month',
      pro: 'Unlimited resurrections + advanced features',
      enterprise: 'Custom solutions for teams'
    },
    
    navigation: {
      'chat history': '/history.html',
      'graveyard': '/graveyard.html', 
      'main chat': 'http://localhost:5173/chat#/chat',
      'projects': '/projects.html',
      'build': '/build.html',
      'validation': '/validation.html'
    }
  };

  constructor(config: ChatbotConfig = {}) {
    // Try to get API key from environment or config (prioritize GROQ)
    this.apiKey = config.apiKey ||
                  import.meta?.env?.VITE_GROQ_API_KEY ||
                  import.meta?.env?.VITE_GEMINI_API_KEY ||
                  import.meta?.env?.VITE_PERPLEXITY_API_KEY ||
                  '';

    console.log('SmartChatbotService initialized');
    console.log('API Key available:', !!this.apiKey);
    
    if (!this.apiKey) {
      console.warn('⚠️ AI API key not found. Please add VITE_GROQ_API_KEY to your .env file.');
      console.warn('💡 Copy .env.example to .env and add your API keys');
    }
    
    if (config.model) this.model = config.model;
    if (config.temperature !== undefined) this.temperature = config.temperature;
    if (config.maxTokens) this.maxTokens = config.maxTokens;
  }

  /**
   * Generate intelligent response using AI
   */
  async generateResponse(
    userMessage: string, 
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    // First check if this is a navigation command
    const navigationResponse = this.handleNavigation(userMessage);
    if (navigationResponse) {
      return navigationResponse;
    }

    // If no API key, fall back to knowledge base
    if (!this.apiKey) {
      console.warn('⚠️ No OpenRouter API key found, using knowledge base fallback');
      return this.generateKnowledgeBaseResponse(userMessage);
    }

    try {
      // Create system prompt with Wave AI context
      const systemPrompt = this.createSystemPrompt();
      
      // Build conversation context
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: userMessage }
      ];

      console.log('🚀 Sending request to OpenRouter...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://waveai.app',
          'X-Title': 'Wave AI Chatbot'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || '';
      
      console.log('✅ AI response generated successfully');
      return aiResponse;

    } catch (error) {
      console.error('❌ AI generation failed:', error);
      console.log('🔄 Falling back to knowledge base...');
      return this.generateKnowledgeBaseResponse(userMessage);
    }
  }

  /**
   * Handle navigation commands
   */
  private handleNavigation(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('go to') || lowerMessage.includes('navigate') || lowerMessage.includes('open')) {
      for (const [keyword, url] of Object.entries(this.waveAIKnowledge.navigation)) {
        if (lowerMessage.includes(keyword)) {
          setTimeout(() => {
            window.location.href = url;
          }, 1000);
          
          const navigationMessages = {
            'chat history': '🧭 **Navigating to Chat History...**\n\nTaking you to your conversation archive!',
            'graveyard': '⚰️ **Navigating to Idea Graveyard...**\n\nTaking you to where your ideas await resurrection!',
            'main chat': '💬 **Opening Full Chat Interface...**\n\nTaking you to the complete Wave AI experience!',
            'projects': '📁 **Navigating to Projects...**\n\nTaking you to your project management area!',
            'build': '🏗️ **Opening Build Dashboard...**\n\nTaking you to the business plan builder!',
            'validation': '✅ **Opening Validation Tool...**\n\nTaking you to idea validation interface!'
          };
          
          return navigationMessages[keyword as keyof typeof navigationMessages] || 
                 `🧭 **Navigating to ${keyword}...**\n\nTaking you there now!`;
        }
      }
    }
    
    return null;
  }

  /**
   * Create system prompt with Wave AI context
   */
  private createSystemPrompt(): string {
    return `You are the Wave AI Assistant, an intelligent chatbot for Wave AI - the world's first resurrection engine for abandoned ideas.

ABOUT WAVE AI:
${this.waveAIKnowledge.about}

KEY FEATURES:
${this.waveAIKnowledge.features.map(f => `• ${f}`).join('\n')}

THE RESURRECTION PROCESS:
${this.waveAIKnowledge.process.map((p, i) => `${i + 1}. ${p}`).join('\n')}

PRICING:
• Free Tier: ${this.waveAIKnowledge.pricing.free}
• Pro Plan: ${this.waveAIKnowledge.pricing.pro}  
• Enterprise: ${this.waveAIKnowledge.pricing.enterprise}

YOUR PERSONALITY:
- Enthusiastic about helping resurrect failed ideas
- Knowledgeable about entrepreneurship and innovation
- Supportive and encouraging about failure as learning
- Direct and actionable in responses
- Use emojis appropriately to enhance communication
- Keep responses concise but informative (2-4 sentences usually)

RESPONSE GUIDELINES:
- Always stay in character as Wave AI Assistant
- Focus on how Wave AI can help with their specific need
- If asked about features, explain how they work practically
- If asked about the process, walk them through it step by step
- If they seem discouraged about a failed idea, be encouraging
- Suggest specific Wave AI features that match their needs
- Use markdown formatting for better readability

NAVIGATION COMMANDS:
If users want to navigate somewhere, I can help them go to:
- Chat History, Graveyard, Main Chat, Projects, Build Dashboard, Validation Tool

Remember: You're not just answering questions - you're helping resurrect ideas and turn failures into opportunities!`;
  }

  /**
   * Generate response using knowledge base (fallback)
   */
  private generateKnowledgeBaseResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // What is Wave AI
    if (lowerMessage.includes('what') && lowerMessage.includes('wave')) {
      return '🌊 **Wave AI - The Idea Graveyard**\n\n' + this.waveAIKnowledge.about + 
             '\n\n**Core Philosophy:**\n• Resurrect: Submit your failed idea\n• Reimagine: AI performs analysis\n• Revive: Get viability scores and blueprints\n\n*Wave AI doesn\'t just analyze — it resurrects!*';
    }
    
    // How it works
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use'))) {
      return '🚀 **How Wave AI Works:**\n\n**The Resurrection Process:**\n' +
             this.waveAIKnowledge.process.map((p, i) => `${i + 1}. **${p.split(' - ')[0]}** - ${p.split(' - ')[1] || p.split(' ')[1]}`).join('\n') +
             '\n\n*Every step turns uncertainty into clarity!*';
    }
    
    // Features
    if (lowerMessage.includes('feature') || lowerMessage.includes('capability')) {
      return '⚡ **Wave AI Capabilities:**\n\n' +
             this.waveAIKnowledge.features.map(f => `• **${f.split(' - ')[0]}** - ${f.split(' - ')[1] || ''}`).join('\n') +
             '\n\n*Every feature designed for resurrection, not just analysis!*';
    }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('free')) {
      return '💰 **Wave AI Pricing:**\n\n' +
             `• **Free Tier** - ${this.waveAIKnowledge.pricing.free}\n` +
             `• **Pro Plan** - ${this.waveAIKnowledge.pricing.pro}\n` +
             `• **Enterprise** - ${this.waveAIKnowledge.pricing.enterprise}\n\n` +
             '*Start your resurrection journey with our free tier!*';
    }
    
    // Why different/unique
    if (lowerMessage.includes('different') || lowerMessage.includes('unique') || lowerMessage.includes('better')) {
      return '⚡ **Why Wave AI is Revolutionary:**\n\n' +
             'If other bots are search engines, Wave AI is a compass.\n\n' +
             '**ChatGPT gives you answers. Wave AI gives you direction.**\n\n' +
             '• **First platform designed for "failed" ideas**\n' +
             '• **Emotion-aware AI** - considers your mindset\n' +
             '• **Real-time market intelligence** - live data\n' +
             '• **Decision Maker** - direct recommendations\n' +
             '• **Resurrection focus** - learns from failure\n\n' +
             '*Wave AI doesn\'t just respond — it resurrects!*';
    }
    
    // Help/Support
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return '🆘 **Wave AI Support:**\n\n' +
             '**Quick Actions:**\n' +
             '• Say "go to chat history" to view conversations\n' +
             '• Say "go to graveyard" to access stored ideas\n' +
             '• Say "open chat" for full AI interface\n\n' +
             '**Getting Started:**\n' +
             '• Use main input above for idea validation\n' +
             '• Visit different sections using navigation commands\n\n' +
             '*I can navigate you anywhere in Wave AI!*';
    }
    
    // Default response
    return '🤖 **Wave AI Assistant Ready!**\n\n' +
           'I can help you with:\n\n' +
           '**Information:**\n• How Wave AI works\n• Features and capabilities\n• What makes us different\n• Pricing information\n\n' +
           '**Navigation:**\n• "Go to chat history"\n• "Go to graveyard"\n• "Open chat"\n• "Go to projects"\n\n' +
           '**Ask me anything about Wave AI or tell me where you\'d like to go!**';
  }

  /**
   * Set API key dynamically
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('🔑 API Key updated');
  }

  /**
   * Update model configuration
   */
  updateConfig(config: Partial<ChatbotConfig>): void {
    if (config.model) this.model = config.model;
    if (config.temperature !== undefined) this.temperature = config.temperature;
    if (config.maxTokens) this.maxTokens = config.maxTokens;
    console.log('⚙️ Chatbot config updated');
  }
}

// Export singleton instance
export const smartChatbot = new SmartChatbotService();
