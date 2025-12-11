// Landing Page Q&A Bot - Trained on Wave AI About Content
// Enhanced with human-like responses and streaming capabilities

import { StreamingService } from './streamingService';

interface QAMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class LandingPageBot {
  private waveAIKnowledge = {
    about: `Wave AI is the world's first resurrection engine for abandoned ideas. It's not just a tool — it's a philosophy. A platform where failure becomes fuel, and forgotten projects find new life through AI-powered insight, emotional intelligence, and real-time market data.`,
    
    mission: `Most ideas don't die — they get buried under doubt, timing, or lack of support. Wave AI exists to dig them up, dissect them, and rebuild them stronger. We believe failure is data. Emotion is signal. And resurrection is strategy.`,
    
    concept: `Resurrect. Reimagine. Revive.
    • Resurrect: Submit your failed idea to the Graveyard and reflect on its story.
    • Reimagine: Our AI performs an autopsy, analyzes your mindset, and fuses it with live market data.
    • Revive: You receive a viability score, mutated idea suggestions, and a blueprint to move forward.`,
    
    targetAudience: [
      'Entrepreneurs with shelved business ideas',
      'Startups seeking pivot opportunities',
      'Innovators looking to revive past projects',
      'Businesses exploring abandoned concepts',
      'Creators stuck in loops of self-doubt',
      'Anyone who\'s ever whispered, "maybe it wasn\'t such a bad idea…"'
    ],
    
    differentiators: [
      'Built for failure: The first platform designed to work with dead ideas, not just new ones',
      'Emotion-aware AI: Considers your mindset, not just your metrics',
      'Real-time market integration: Denodo connects to trends, funding, and news to enrich your idea',
      'Actionable blueprints: Not just feedback — strategic paths forward',
      'Viability scoring: A clear, data-backed rating of your idea\'s potential',
      'Decision Maker: A direct recommendation to pursue, pivot, or pause — no fluff'
    ],
    
    process: [
      'Submit: Enter your failed idea through a conversational form',
      'Autopsy: Reflect on why it failed, its value, and your emotional state',
      'Resurrect: Trigger the AI and Denodo to analyze and mutate the idea',
      'Revive: Get a viability score, new directions, and a blueprint to build again'
    ],
    
    benefits: {
      individuals: 'Organize personal projects, overcome creative blocks, and grow through reflection',
      teams: 'Share failures, learn collectively, and foster a culture of resilience',
      businesses: 'Analyze market trends, repurpose failed initiatives, and discover new opportunities',
      everyone: 'Because every great success story includes ideas that once failed'
    },
    
    philosophy: `Ideas don't die. They evolve. Wave AI isn't just innovation. It's resurrection. ChatGPT gives you answers. Wave AI gives you direction.`
  };

  /**
   * Generate Q&A response based on Wave AI knowledge with human-like tone
   */
  generateResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    
    // What is Wave AI
    if (this.matchesKeywords(lowerMessage, ['what is', 'what\'s', 'about wave', 'wave ai', 'explain wave'])) {
      response = `🌊 **What is Wave AI?**\n\nI'm so excited you asked! ${this.waveAIKnowledge.about}\n\nHonestly, whether you're an entrepreneur, part of a team, or just a curious creator, Wave AI is here to help you turn "what didn't work" into "what's next." It's pretty amazing what happens when we stop seeing failure as the end and start seeing it as data!`;
    }
    
    // Mission
    else if (this.matchesKeywords(lowerMessage, ['mission', 'purpose', 'why wave', 'goal'])) {
      response = `💡 **Our Mission**\n\nYou know what drives us? ${this.waveAIKnowledge.mission}\n\nIt's really about changing how we think about failure. Instead of burying our ideas, we're here to help you dig them up and make them stronger!`;
    }
    
    // How it works / Process
    else if (this.matchesKeywords(lowerMessage, ['how', 'work', 'process', 'steps', 'use'])) {
      response = `🧠 **How Wave AI Works**\n\nGreat question! Let me walk you through it:\n\n${this.waveAIKnowledge.process.map((step, i) => `${i + 1}. **${step.split(':')[0]}**: ${step.split(':')[1]}`).join('\n')}\n\nWhat I love about this process is that every step is designed to turn uncertainty into clarity — and hesitation into action. It's like having a conversation with your past self, but with AI superpowers!`;
    }
    
    // Core concept
    else if (this.matchesKeywords(lowerMessage, ['concept', 'resurrect', 'reimagine', 'revive', 'core'])) {
      response = `🔄 **The Core Concept**\n\nOh, this is my favorite part! **Resurrect. Reimagine. Revive.**\n\n${this.waveAIKnowledge.concept}\n\nWhat's beautiful about Wave AI is that it doesn't just ask "what went wrong?" — it asks "what's still possible?" It's like being an archaeologist for your own ideas!`;
    }
    
    // Who is it for / Target audience
    else if (this.matchesKeywords(lowerMessage, ['who', 'for', 'target', 'audience', 'users'])) {
      response = `🎯 **Who Is Wave AI For?**\n\nI'm so glad you asked! Wave AI is perfect for:\n\n${this.waveAIKnowledge.targetAudience.map(audience => `• ${audience}`).join('\n')}\n\nBasically, if you've ever had an idea that didn't work out the first time, Wave AI is for you. We're all about second chances and fresh perspectives!`;
    }
    
    // What makes it different
    else if (this.matchesKeywords(lowerMessage, ['different', 'unique', 'special', 'better', 'why choose'])) {
      response = `🚀 **What Makes Wave AI Different?**\n\nOh wow, where do I even start? If other bots are search engines, Wave AI is a compass. Here's what makes us special:\n\n${this.waveAIKnowledge.differentiators.map(diff => `• **${diff.split(':')[0]}**: ${diff.split(':')[1] || diff.split(':')[0]}`).join('\n')}\n\nThe thing is, Wave AI doesn't just analyze. It **advises**. It doesn't just respond. It **resurrects**. We're not here to give you generic answers – we're here to help you find your unique path forward!`;
    }
    
    // Benefits
    else if (this.matchesKeywords(lowerMessage, ['benefit', 'advantage', 'help', 'value'])) {
      response = `🌍 **Who Benefits from Wave AI?**\n\nThis is such a great question! Here's who really benefits:\n\n• **Individuals**: ${this.waveAIKnowledge.benefits.individuals}\n• **Teams**: ${this.waveAIKnowledge.benefits.teams}\n• **Businesses**: ${this.waveAIKnowledge.benefits.businesses}\n• **Everyone**: ${this.waveAIKnowledge.benefits.everyone}\n\nThe beautiful thing is, we all have ideas that didn't quite work out. Wave AI helps everyone find value in those experiences!`;
    }
    
    // Philosophy / Why not chatbot
    else if (this.matchesKeywords(lowerMessage, ['philosophy', 'chatbot', 'ai', 'direction', 'smart'])) {
      response = `💬 **Why Wave AI Isn't Just Another Chatbot**\n\nI love this question! ${this.waveAIKnowledge.philosophy}\n\nHere's the thing – Wave AI isn't here to sound smart, it's here to make your ideas smarter. It understands your intent, your emotion, and your ambition. It's not just smart — it's brave. Wave AI doesn't fear failure. It learns from it, and that makes all the difference!`;
    }
    
    // Pricing (general info)
    else if (this.matchesKeywords(lowerMessage, ['price', 'cost', 'free', 'plan', 'pricing'])) {
      response = `💰 **Wave AI Pricing**\n\nGreat question! We've designed our pricing to be as flexible as our approach to ideas:\n\n• **Free Tier** - Perfect for trying out the resurrection process (everyone should start here!)\n• **Pro Plan** - For serious entrepreneurs and teams who are ready to dive deep\n• **Enterprise** - Custom solutions for organizations with bigger ambitions\n\nHonestly, I'd recommend starting with the free tier to get a feel for how Wave AI works. Once you see your first idea come back to life, you'll understand why people upgrade!`;
    }
    
    // Features
    else if (this.matchesKeywords(lowerMessage, ['feature', 'capability', 'function', 'tool'])) {
      response = `⚡ **Wave AI Key Features**

Oh, you're going to love what we've built! Here are the key features that make Wave AI so powerful:

• **Idea Graveyard** - Store and organize your failed ideas (it's oddly therapeutic!)
• **AI Autopsy Engine** - Deep analysis of what went wrong (but in a constructive way)
• **Emotion Analysis** - Understands your mindset and motivation (because feelings matter)
• **Market Intelligence** - Real-time data integration (so you know what's happening now)
• **Viability Scoring** - Clear ratings of your idea's potential (no more guessing)
• **Revival Blueprints** - Actionable plans to move forward (the roadmap you've been waiting for)
• **Decision Recommendations** - Direct advice on next steps (pursue, pivot, or pause)

Each feature is designed to turn your "what ifs" into "what's next!"`;
    }
    
    // Getting started
    else if (this.matchesKeywords(lowerMessage, ['start', 'begin', 'get started', 'sign up', 'try'])) {
      response = `🚀 **Getting Started with Wave AI**\n\nI'm so excited you're ready to begin! Here's your step-by-step resurrection journey:\n\n1. **Sign up** for your free Wave AI account (takes less than a minute!)\n2. **Submit** your first failed idea to the Graveyard (don't worry, it's a safe space)\n3. **Reflect** on what happened and why it didn't work (this part is actually healing)\n4. **Let AI analyze** and provide insights (this is where the magic happens)\n5. **Get your blueprint** for moving forward (your personalized roadmap to success)\n\nHere's what I love about this process – every great success story includes ideas that once failed. Your resurrection journey starts the moment you decide that failure is just data. Ready to turn your setbacks into comebacks?`;
    }
    
    // Contact / Support
    else if (this.matchesKeywords(lowerMessage, ['contact', 'support', 'help', 'reach'])) {
      response = `📞 **Get in Touch**\n\nI'm so glad you want to connect! We're absolutely here to support your resurrection journey:\n\n• **Email**: hello@waveai.com (we actually read and respond to every email!)\n• **Support**: Available through the main application (real humans, not just bots)\n• **Community**: Join our community of idea resurrectioners (it's an amazing group)\n\nHonestly, we love hearing from people who are on this journey. Every question you have is a step closer to bringing your ideas back to life, and we're here to help with every single one!`;
    }
    
    // Failure / Ideas
    else if (this.matchesKeywords(lowerMessage, ['failure', 'failed', 'dead idea', 'abandoned', 'gave up'])) {
      response = `💪 **Embracing Failure**\n\nOh, this hits close to home! At Wave AI, we believe failure is not the end — it's data. And honestly? Some of the best ideas I've seen started as "failures." Here's what every failed idea actually contains:\n\n• **Learning opportunities** hidden in what went wrong (these are gold mines!)\n• **Market timing** that might be different now (timing is everything, right?)\n• **Emotional blocks** that can be overcome (we all have them)\n• **New perspectives** that can transform the concept (fresh eyes change everything)\n\nHere's the truth: your failed idea isn't dead — it's just waiting to be revived. Wave AI helps you see the potential that's still there, and trust me, it's usually more than you think!`;
    }
    
    // If we have a response, apply human-like enhancements and return it
    if (response) {
      return StreamingService.addConversationalElements(StreamingService.humanizeText(response));
    }
    
    // Default response for unmatched queries
    const defaultResponse = `🤖 **Hey there! I'm your Wave AI Assistant**\n\nI'm here to chat about Wave AI - the world's first resurrection engine for abandoned ideas! I love talking about this stuff.\n\n**I can help you learn about:**\n• What Wave AI is and how it works (it's pretty amazing!)\n• Who it's designed for (spoiler: probably you!)\n• What makes it different (so many cool things)\n• How to get started (easier than you think)\n• Our mission and philosophy (it's all about turning failure into fuel)\n\n**Try asking me things like:**\n• "What is Wave AI?"\n• "How does it work?"\n• "Who is it for?"\n• "What makes it different?"\n• "How do I get started?"\n\n*I'm genuinely excited to help you discover how Wave AI can resurrect your ideas! What would you like to know?*`;
    
    return StreamingService.addConversationalElements(StreamingService.humanizeText(defaultResponse));
  }

  /**
   * Check if message matches any of the given keywords
   */
  private matchesKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get a random encouraging message
   */
  getEncouragingMessage(): string {
    const messages = [
      "🌟 Every great idea starts with a question!",
      "💡 Your curiosity is the first step to resurrection!",
      "🚀 Ready to turn failure into fuel?",
      "⚡ Let's explore what makes Wave AI special!",
      "🔄 Questions lead to insights, insights lead to revival!"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// Export singleton instance
export const landingPageBot = new LandingPageBot();
