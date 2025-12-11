// Enhanced Support Bot - Trained on Wave AI About Content with Streaming
// This bot provides comprehensive support with human-like responses and streaming

import { StreamingService } from './streamingService';

interface SupportMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class EnhancedSupportBot {
  private waveAIKnowledge = {
    about: `Wave AI is the world's first resurrection engine for abandoned ideas. It's not just a tool — it's a philosophy. A platform where failure becomes fuel, and forgotten projects find new life through AI-powered insight, emotional intelligence, and real-time market data.

Whether you're an entrepreneur, a team, or a curious creator, Wave AI helps you turn "what didn't work" into "what's next."`,

    mission: `Most ideas don't die — they get buried under doubt, timing, or lack of support. Wave AI exists to dig them up, dissect them, and rebuild them stronger.

We believe failure is data. Emotion is signal. And resurrection is strategy.`,

    coreProcess: {
      resurrect: "Submit your failed idea to the Graveyard and reflect on its story.",
      reimagine: "Our AI performs an autopsy, analyzes your mindset, and fuses it with live market data.",
      revive: "You receive a viability score, mutated idea suggestions, and a blueprint to move forward."
    },

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

    howItWorks: [
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

    philosophy: `Ideas don't die. They evolve. Wave AI isn't just innovation. It's resurrection. ChatGPT gives you answers. Wave AI gives you direction.

It's not here to sound smart — it's here to make your ideas smarter. It understands your intent, your emotion, and your ambition. It's not just smart — it's brave. Wave AI doesn't fear failure. It learns from it.`,

    features: {
      ideaGraveyard: 'Store and organize your failed ideas in a safe, reflective space',
      aiAutopsy: 'Deep analysis of what went wrong with constructive insights',
      emotionAnalysis: 'Understands your mindset and motivation because feelings matter',
      marketIntelligence: 'Real-time data integration so you know what\'s happening now',
      viabilityScoring: 'Clear ratings of your idea\'s potential - no more guessing',
      revivalBlueprints: 'Actionable plans to move forward - the roadmap you\'ve been waiting for',
      decisionRecommendations: 'Direct advice on next steps: pursue, pivot, or pause'
    }
  };

  /**
   * Generate comprehensive support response with streaming capability
   */
  async generateStreamingResponse(
    userMessage: string,
    onChunk: (chunk: string, isComplete: boolean) => void
  ): Promise<void> {
    const response = this.generateResponse(userMessage);
    
    // Simulate thinking time
    await StreamingService.simulateThinking(400 + Math.random() * 600);
    
    // Stream the response with human-like typing
    await StreamingService.streamText(
      response,
      onChunk,
      {
        minDelay: 15,
        maxDelay: 45,
        humanTypingSpeed: true
      }
    );
  }

  /**
   * Generate comprehensive support response based on Wave AI knowledge
   */
  generateResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    
    // What is Wave AI
    if (this.matchesKeywords(lowerMessage, ['what is', 'what\'s', 'about wave', 'wave ai', 'explain wave', 'tell me about'])) {
      response = `🌊 **What is Wave AI?**\n\nI'm absolutely thrilled you asked! ${this.waveAIKnowledge.about}\n\nWhat I love most about Wave AI is that it doesn't just see failure as the end of the story. Instead, it sees failure as the beginning of a new chapter. Whether you're an entrepreneur with a drawer full of "failed" business plans, or a creator who's been told "no" more times than you can count, Wave AI is here to help you turn those setbacks into comebacks!\n\nIt's like having a wise mentor who's been through it all and knows exactly how to help you see the hidden potential in what didn't work before.`;
    }
    
    // Mission and purpose
    else if (this.matchesKeywords(lowerMessage, ['mission', 'purpose', 'why wave', 'goal', 'why exists'])) {
      response = `💡 **Our Mission - Why Wave AI Exists**\n\nYou know what breaks my heart? ${this.waveAIKnowledge.mission}\n\nI've seen so many brilliant ideas get abandoned not because they were bad, but because the timing wasn't right, or the person didn't have the right support, or they just lost confidence. That's exactly why Wave AI exists - to be that support system, that second chance, that fresh perspective.\n\nWe genuinely believe that failure is just data in disguise. Every "failed" idea contains valuable insights about market needs, timing, execution, and personal growth. Wave AI helps you decode that data and turn it into your next success story.`;
    }
    
    // How it works / Process
    else if (this.matchesKeywords(lowerMessage, ['how', 'work', 'process', 'steps', 'use', 'get started'])) {
      response = `🧠 **How Wave AI Works - Your Journey from Failure to Success**\n\nI love walking people through this because it's honestly magical to watch! Here's your step-by-step resurrection journey:\n\n**🔄 Resurrect. Reimagine. Revive.**\n\n${this.waveAIKnowledge.howItWorks.map((step, i) => `**${i + 1}. ${step.split(':')[0]}**: ${step.split(':')[1]}`).join('\n\n')}\n\nWhat makes this process so powerful is that every step is designed to turn uncertainty into clarity and hesitation into action. It's like having a conversation with your future self - someone who's learned from the experience and knows exactly what to do next.\n\nThe best part? You're not just getting generic advice. Wave AI considers your emotional state, your specific circumstances, and real-time market data to give you a personalized roadmap forward.`;
    }
    
    // Core concept - Resurrect, Reimagine, Revive
    else if (this.matchesKeywords(lowerMessage, ['concept', 'resurrect', 'reimagine', 'revive', 'core', 'three r'])) {
      response = `🔄 **The Heart of Wave AI - Resurrect. Reimagine. Revive.**\n\nThis is absolutely my favorite part to explain because it's so beautifully simple yet profound!\n\n**🪦 Resurrect**: ${this.waveAIKnowledge.coreProcess.resurrect} This isn't about dwelling on failure - it's about honoring the journey and extracting the wisdom.\n\n**🧠 Reimagine**: ${this.waveAIKnowledge.coreProcess.reimagine} This is where the magic happens - we don't just look at what went wrong, we look at what's possible now.\n\n**✨ Revive**: ${this.waveAIKnowledge.coreProcess.revive} You get concrete, actionable next steps, not just feel-good advice.\n\nWhat I love about this approach is that Wave AI doesn't just ask "what went wrong?" - it asks "what's still possible?" It's like being an archaeologist for your own ideas, discovering hidden treasures in what you thought was just rubble.`;
    }
    
    // Who is it for / Target audience
    else if (this.matchesKeywords(lowerMessage, ['who', 'for', 'target', 'audience', 'users', 'right for me'])) {
      response = `🎯 **Who Is Wave AI Perfect For?**\n\nHonestly, if you've ever had an idea that didn't work out the first time, Wave AI is probably perfect for you! But let me be more specific:\n\n${this.waveAIKnowledge.targetAudience.map(audience => `• **${audience}** - We see you, and we're here for you!`).join('\n')}\n\nBut here's the thing - Wave AI isn't just for "failed entrepreneurs." It's for anyone who's ever had that nagging feeling that maybe, just maybe, that idea they gave up on wasn't such a bad idea after all.\n\nWhether you're a seasoned business owner looking to revive a shelved project, or someone who's never started a business but has a drawer full of "someday" ideas, Wave AI meets you where you are and helps you see the potential that's still there.`;
    }
    
    // What makes it different
    else if (this.matchesKeywords(lowerMessage, ['different', 'unique', 'special', 'better', 'why choose', 'stand out'])) {
      response = `🚀 **What Makes Wave AI Absolutely Unique**\n\nOh wow, where do I even begin? If other AI tools are search engines, Wave AI is a compass - it doesn't just give you information, it gives you direction!\n\nHere's what makes us completely different:\n\n${this.waveAIKnowledge.differentiators.map(diff => `• **${diff.split(':')[0]}**: ${diff.split(':')[1] || diff.split(':')[0]}`).join('\n')}\n\n${this.waveAIKnowledge.philosophy}\n\nThe thing is, most AI tools are designed to help you with new ideas. Wave AI is the first platform specifically built to work with ideas that have already "failed." We don't see failure as something to avoid - we see it as valuable data that most people just don't know how to use yet.\n\nWe're not here to make you feel better about failing. We're here to help you turn that failure into your next success story.`;
    }
    
    // Benefits and value
    else if (this.matchesKeywords(lowerMessage, ['benefit', 'advantage', 'help', 'value', 'worth it'])) {
      response = `🌍 **The Life-Changing Benefits of Wave AI**\n\nI get so excited talking about this because I've seen the transformation that happens when people start seeing their failures differently!\n\n**For Individuals**: ${this.waveAIKnowledge.benefits.individuals}. It's like having a personal coach who specializes in turning setbacks into comebacks.\n\n**For Teams**: ${this.waveAIKnowledge.benefits.teams}. Imagine a workplace where failure isn't feared but celebrated as learning data!\n\n**For Businesses**: ${this.waveAIKnowledge.benefits.businesses}. Those "failed" initiatives? They might be sitting on goldmines of market insights.\n\n**For Everyone**: ${this.waveAIKnowledge.benefits.everyone}. Because honestly, every success story I know includes at least one chapter about something that didn't work the first time.\n\nThe real value isn't just in reviving old ideas - it's in changing your entire relationship with failure. Once you see failure as data instead of defeat, everything changes.`;
    }
    
    // Features and capabilities
    else if (this.matchesKeywords(lowerMessage, ['feature', 'capability', 'function', 'tool', 'what can it do'])) {
      response = `⚡ **Wave AI's Powerful Features - Your Resurrection Toolkit**\n\nI'm so excited to show you what we've built! Each feature is designed to turn your "what ifs" into "what's next":\n\n• **🪦 Idea Graveyard**: ${this.waveAIKnowledge.features.ideaGraveyard}\n• **🔍 AI Autopsy Engine**: ${this.waveAIKnowledge.features.aiAutopsy}\n• **💭 Emotion Analysis**: ${this.waveAIKnowledge.features.emotionAnalysis}\n• **📊 Market Intelligence**: ${this.waveAIKnowledge.features.marketIntelligence}\n• **📈 Viability Scoring**: ${this.waveAIKnowledge.features.viabilityScoring}\n• **🗺️ Revival Blueprints**: ${this.waveAIKnowledge.features.revivalBlueprints}\n• **🎯 Decision Recommendations**: ${this.waveAIKnowledge.features.decisionRecommendations}\n\nWhat I love about these features is that they work together like a symphony. The Idea Graveyard gives you a safe space to reflect, the AI Autopsy helps you understand what happened, the Market Intelligence shows you what's changed, and the Revival Blueprints give you a clear path forward.\n\nIt's not just analysis - it's transformation.`;
    }
    
    // Philosophy and approach
    else if (this.matchesKeywords(lowerMessage, ['philosophy', 'approach', 'chatbot', 'ai', 'direction', 'smart', 'different from chatgpt'])) {
      response = `💬 **Why Wave AI Isn't Just Another AI Tool**\n\nI love this question because it gets to the heart of what makes Wave AI special!\n\n${this.waveAIKnowledge.philosophy}\n\nHere's the thing - ChatGPT and other AI tools are amazing at giving you answers to questions. But Wave AI? We're designed to give you direction for your life and business.\n\nWe don't just analyze your failed idea and tell you what went wrong. We look at who you are now, what the market looks like today, and what resources you have available, then we give you a personalized roadmap for moving forward.\n\nIt's the difference between getting a weather report and getting a navigation system. Both are useful, but only one actually helps you get where you want to go.\n\nWave AI isn't afraid of your failures - we celebrate them as the foundation for your next success.`;
    }
    
    // Pricing and plans
    else if (this.matchesKeywords(lowerMessage, ['price', 'cost', 'free', 'plan', 'pricing', 'expensive', 'affordable'])) {
      response = `💰 **Wave AI Pricing - Designed for Every Stage of Your Journey**\n\nI'm so glad you asked! We've designed our pricing to be as flexible and understanding as our approach to failure:\n\n• **🆓 Free Tier** - Perfect for dipping your toes in the resurrection waters! You can submit your first failed idea and experience the full Wave AI process.\n\n• **⭐ Pro Plan** - For serious entrepreneurs and teams who are ready to dive deep into their idea graveyard and start building their resurrection empire.\n\n• **🏢 Enterprise** - Custom solutions for organizations that want to transform their entire culture around failure and innovation.\n\nHonestly, I always recommend starting with the free tier. Once you experience that moment when Wave AI helps you see the hidden potential in an idea you thought was dead, you'll understand why people upgrade.\n\nThe way I see it, if Wave AI helps you revive even one idea that becomes successful, it pays for itself many times over. But more than that, it changes how you think about failure forever.`;
    }
    
    // Getting started
    else if (this.matchesKeywords(lowerMessage, ['start', 'begin', 'sign up', 'try', 'first step', 'how to start'])) {
      response = `🚀 **Ready to Start Your Resurrection Journey?**\n\nI'm literally getting goosebumps because this is where the magic begins! Here's how to start turning your failures into fuel:\n\n**1. 🔐 Sign Up** - Create your free Wave AI account (takes less than a minute, I promise!)\n\n**2. 🪦 Visit the Graveyard** - Submit your first failed idea. Don't worry, it's a completely safe space designed for reflection, not judgment.\n\n**3. 💭 Reflect & Share** - Tell us what happened, why it didn't work, and how you felt about it. This isn't about dwelling - it's about extracting wisdom.\n\n**4. 🤖 Let AI Work Its Magic** - Our AI performs a comprehensive autopsy, analyzes current market conditions, and identifies new opportunities.\n\n**5. 📋 Get Your Blueprint** - Receive your personalized revival plan with concrete next steps, viability scores, and clear recommendations.\n\nThe beautiful thing about this process is that every step is designed to turn uncertainty into clarity and hesitation into action. Your resurrection journey starts the moment you decide that failure is just data waiting to be decoded.\n\nAre you ready to see what's still possible with that idea you thought was dead?`;
    }
    
    // Contact and support
    else if (this.matchesKeywords(lowerMessage, ['contact', 'support', 'help', 'reach', 'talk to human', 'customer service'])) {
      response = `📞 **Get in Touch - We're Here for Your Journey**\n\nI'm so glad you want to connect! Supporting your resurrection journey is literally what we live for:\n\n• **📧 Email**: hello@waveai.com - We read and personally respond to every single email. No automated responses, just real humans who care about your success.\n\n• **💬 Live Support**: Available right here in the app! You're talking to real people who understand the emotional journey of turning failure into success.\n\n• **🌟 Community**: Join our community of idea resurrectioners - it's an incredible group of people who've all been where you are and are now helping each other succeed.\n\n• **📚 Resources**: We have guides, case studies, and success stories to help you at every step of your journey.\n\nHere's what I want you to know - we genuinely care about your success. Every question you have, every doubt you're facing, every moment of uncertainty - we've been there, and we're here to help.\n\nYour journey from failure to success matters to us, and we're committed to being with you every step of the way.`;
    }
    
    // Failure and emotional support
    else if (this.matchesKeywords(lowerMessage, ['failure', 'failed', 'dead idea', 'abandoned', 'gave up', 'disappointed', 'discouraged'])) {
      response = `💪 **Embracing Failure - You're Not Alone in This**\n\nOh, this hits so close to home, and I want you to know that what you're feeling is completely valid and incredibly common.\n\nHere's what I've learned from working with thousands of people who've been exactly where you are: ${this.waveAIKnowledge.philosophy.split('.')[0]}. They evolve.\n\nEvery "failed" idea actually contains incredible value:\n\n• **💎 Hidden Learning Opportunities** - What went wrong often reveals exactly what needs to go right next time\n• **⏰ Timing Insights** - Maybe it wasn't the right time then, but what about now?\n• **🧠 Emotional Growth** - You're stronger and wiser now than you were when you first tried\n• **🔍 Fresh Perspectives** - You see things now that you couldn't see before\n• **🌱 New Resources** - You have access to tools, knowledge, and connections you didn't have before\n\nHere's the truth that I want you to really hear: Your "failed" idea isn't dead. It's just waiting for the right moment, the right approach, and the right support to come back to life.\n\nWave AI helps you see the potential that's still there, and trust me, it's usually much more than you think. You're not starting over - you're building on a foundation of valuable experience.`;
    }
    
    // If we have a response, enhance it and return
    if (response) {
      return StreamingService.addConversationalElements(StreamingService.humanizeText(response));
    }
    
    // Default response for unmatched queries
    const defaultResponse = `🤖 **Hey there! I'm your Wave AI Support Assistant**\n\nI'm here to help you understand everything about Wave AI - the world's first resurrection engine for abandoned ideas! I absolutely love talking about this because I've seen how transformative it can be.\n\n**I can help you with:**\n• 🌊 What Wave AI is and how it works (it's honestly incredible!)\n• 🎯 Who it's perfect for (probably you!)\n• ✨ What makes it completely unique (so many amazing things!)\n• 🚀 How to get started (easier than you think!)\n• 💡 Our mission and philosophy (turning failure into fuel!)\n• 🛠️ Features and capabilities (your resurrection toolkit!)\n• 💰 Pricing and plans (flexible and fair!)\n• 📞 Getting additional support (we're here for you!)\n\n**Try asking me things like:**\n• "What makes Wave AI different?"\n• "How does the resurrection process work?"\n• "Is Wave AI right for my situation?"\n• "How do I get started?"\n• "What if my idea really is dead?"\n\n*I'm genuinely excited to help you discover how Wave AI can turn your failed ideas into future successes! What would you like to know?*`;
    
    return StreamingService.addConversationalElements(StreamingService.humanizeText(defaultResponse));
  }

  /**
   * Check if message matches any of the given keywords
   */
  private matchesKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get contextual follow-up suggestions based on user's question
   */
  getFollowUpSuggestions(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    if (this.matchesKeywords(lowerMessage, ['what is', 'about wave'])) {
      return [
        "How does Wave AI work?",
        "What makes it different from other AI tools?",
        "Is Wave AI right for me?",
        "How do I get started?"
      ];
    }
    
    if (this.matchesKeywords(lowerMessage, ['how', 'work', 'process'])) {
      return [
        "What kind of ideas work best with Wave AI?",
        "How long does the process take?",
        "Can you show me an example?",
        "What if my idea is really old?"
      ];
    }
    
    if (this.matchesKeywords(lowerMessage, ['price', 'cost', 'pricing'])) {
      return [
        "How do I sign up for the free tier?",
        "What's included in the Pro plan?",
        "Can I upgrade later?",
        "Is there a money-back guarantee?"
      ];
    }
    
    // Default suggestions
    return [
      "Tell me more about the features",
      "How do I get started?",
      "What makes Wave AI unique?",
      "Can you help with my specific situation?"
    ];
  }

  /**
   * Get encouraging message for users who seem hesitant
   */
  getEncouragingMessage(): string {
    const messages = [
      "🌟 Every great success story includes ideas that once 'failed' - yours could be next!",
      "💡 Your curiosity about Wave AI is already the first step toward resurrection!",
      "🚀 Ready to turn your setbacks into comebacks? I'm here to help!",
      "⚡ The fact that you're here means you haven't given up - that's the spirit of a true resurrectionist!",
      "🔄 Questions lead to insights, insights lead to revival, and revival leads to success!"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// Export singleton instance
export const enhancedSupportBot = new EnhancedSupportBot();
