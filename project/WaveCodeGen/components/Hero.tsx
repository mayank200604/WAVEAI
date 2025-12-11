import React, { useState, useRef, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Preview from './Preview';
import { CodeGeneratorFixed } from '../services/codeGeneratorFixed';

// Configure marked to avoid warnings
marked.setOptions({
  mangle: false,
  headerIds: false
});

interface Message {
  id: number;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp?: Date;
}

interface HeroProps {
  promptCredits: number;
  setPromptCredits: React.Dispatch<React.SetStateAction<number>>;
  isUnlimited?: boolean;
}

const Hero: React.FC<HeroProps> = ({ promptCredits, setPromptCredits, isUnlimited = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: 'ai', 
      text: "# Welcome to WaveCodeGen AI ✨\n\n*The world's most advanced AI website generator*\n\n---\n\n## 🚀 **What Makes Us Different**\n\n### **💎 Premium Quality**\n- **Award-winning designs** that rival $100K+ custom developments\n- **Production-ready code** with enterprise-level standards\n- **Pixel-perfect responsiveness** across all devices\n\n### **🧠 Content Intelligence**\n- **Zero Lorem Ipsum** - Only realistic, industry-specific content\n- **SEO-optimized copy** that ranks and converts\n- **Smart testimonials** with credible names and companies\n- **Compelling headlines** that drive engagement\n\n### **⚡ Technical Excellence**\n- **Lightning-fast performance** (60fps animations)\n- **Advanced SEO** with schema markup and meta optimization\n- **Full accessibility** (WCAG 2.1 compliant)\n- **Cross-browser compatibility** (Chrome, Firefox, Safari, Edge)\n\n### **🎨 Design Innovation**\n- **Unique layouts** - Never the same design twice\n- **Modern aesthetics** with glassmorphism and gradients\n- **Smooth animations** and micro-interactions\n- **Dark/Light mode** with system preference detection\n\n---\n\n## 💡 **Ready to Create Something Amazing?**\n\nSimply describe your business, and I'll generate a **stunning, professional website** with:\n- ✅ Smart, contextual content\n- ✅ SEO optimization\n- ✅ Mobile-first design\n- ✅ Premium animations\n- ✅ Production-ready code\n\n**Let's build your digital presence!** 🌟",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestCode, setLatestCode] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('cyan');
  const [fontPair, setFontPair] = useState('Inter_Inter');
  const [layoutDensity, setLayoutDensity] = useState(50);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<{html: string; css: string; js: string} | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isInitialGeneration = latestCode === '';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, thinkingSteps]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputValue]);

  const renderMarkdownToHtml = useCallback((text: string): string => {
    try {
      const html = marked(text);
      return DOMPurify.sanitize(html);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return text;
    }
  }, []);

  const addMessage = (sender: 'user' | 'ai' | 'system', text: string) => {
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      if (file.size > 50 * 1024) { // 50KB limit
        addMessage('system', '❌ File too large. Please upload a .txt file smaller than 50KB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
        setUploadedFile(file);
        setInputValue(content);
        addMessage('system', `✅ File "${file.name}" uploaded successfully! Content loaded into the input area.`);
      };
      reader.readAsText(file);
    } else {
      addMessage('system', '❌ Please upload a valid .txt file.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const currentInput = inputValue.trim();
    setInputValue('');
    
    // Add user message
    addMessage('user', currentInput);
    setIsLoading(true);
    
    // Quick test for ONLY specific test commands
    if (currentInput.toLowerCase() === 'test' || currentInput.toLowerCase() === 'hello' || currentInput.toLowerCase() === 'ping') {
      setThinkingSteps([]);
      addMessage('ai', '👋 **System Test Successful!**\n\nHello! WaveCodeGen is working perfectly and ready to create stunning websites.\n\n**Try these commands:**\n- *"Create a modern portfolio website"*\n- *"Build a luxury restaurant website"*\n- *"Make a professional business landing page"*\n- *"Design a creative agency website"*\n\n**I\'ll generate premium, production-ready websites with:**\n- 🎨 Luxury design and animations\n- 📱 Perfect mobile responsiveness\n- ⚡ Advanced interactions\n- 🌙 Dark/Light mode toggle');
      setIsLoading(false);
      return;
    }

    // Pre-generation message
    addMessage('ai', `🚀 **Starting Website Generation**\n\nI'm analyzing your request and preparing to create something extraordinary! Using advanced AI models (Gemini 2.5 Flash → OpenRouter → Groq) to ensure the highest quality.\n\n**What I'm creating:**\n- 🎨 Premium design with luxury animations\n- 📱 Perfect mobile responsiveness\n- ⚡ Advanced interactions and effects\n- 🌙 Dark/Light mode toggle\n- 🔥 Multi-file structure (HTML, CSS, JS)\n\n*Please wait while I craft your perfect website...*`);

    // Show thinking steps
    const thinkingSteps = [
      '🔍 Analyzing your request...',
      '🎨 Selecting optimal design patterns...',
      '⚡ Generating production-ready code...',
      '🎯 Applying iOS-level styling...',
      '✨ Adding advanced animations...',
      '🌙 Implementing dark mode toggle...',
      '📱 Optimizing for all devices...'
    ];
    setThinkingSteps(thinkingSteps);

    try {
      // Style preferences
      const stylePreferences = {
        primaryColor: primaryColor,
        headingFont: fontPair.split('_')[0],
        bodyFont: fontPair.split('_')[1],
        layoutDensity: layoutDensity
      };
      
      let finalCode = '';
      
      if (isInitialGeneration) {
        console.log('🚀 Creating UNIQUE world-class website...');
        const generatedResponse = await CodeGeneratorFixed.generateRobustCode(currentInput, stylePreferences);
        
        // The response is already extracted multi-file structure
        console.log('🔍 Generated files:', generatedResponse);
        const multiFiles = generatedResponse;
        console.log('📁 Extracted files:', { 
          hasHTML: !!multiFiles.html, 
          hasCSS: !!multiFiles.css, 
          hasJS: !!multiFiles.js,
          cssLength: multiFiles.css?.length || 0,
          jsLength: multiFiles.js?.length || 0
        });
        setGeneratedFiles(multiFiles);
        
        // Use combined code for preview
        finalCode = CodeGeneratorFixed.combineFilesForPreview(multiFiles);
      } else {
        // INTELLIGENT FOLLOW-UP EDITING
        console.log('🎯 Intelligently editing existing website...');
        
        if (generatedFiles) {
          // Edit existing multi-file structure
          const editedFiles = await CodeGeneratorFixed.generateRobustCode(
            currentInput, 
            stylePreferences,
            'business',
            'Premium Company',
            3,
            generatedFiles
          );
          setGeneratedFiles(editedFiles);
          finalCode = CodeGeneratorFixed.combineFilesForPreview(editedFiles);
        } else {
          // Fallback to full regeneration if no existing files
          const fallbackFiles = await CodeGeneratorFixed.generateRobustCode(currentInput, stylePreferences);
          setGeneratedFiles(fallbackFiles);
          finalCode = CodeGeneratorFixed.combineFilesForPreview(fallbackFiles);
        }
      }

      setLatestCode(finalCode);
      setThinkingSteps([]);
      
      // Enhanced post-generation message with analysis and refinement suggestions
      const websiteType = currentInput.toLowerCase().includes('portfolio') ? 'Portfolio' : 
                         currentInput.toLowerCase().includes('business') ? 'Business' :
                         currentInput.toLowerCase().includes('landing') ? 'Landing Page' :
                         currentInput.toLowerCase().includes('restaurant') ? 'Restaurant' :
                         'Professional Website';
      
      // Create personalized response based on whether it's initial or follow-up
      const responseMessage = isInitialGeneration 
        ? generateInitialSuccessMessage(websiteType, currentInput)
        : generateFollowUpSuccessMessage(currentInput, websiteType);
      
      addMessage('ai', responseMessage);
      
      
      // Generate intelligent, context-aware suggestions
      const newSuggestions = generateSmartSuggestions(currentInput, websiteType);
      setSuggestions(newSuggestions);
      
    } catch (error: any) {
      console.error('🚨 Generation error details:', {
        message: error.message,
        stack: error.stack,
        error: error,
        name: error.name,
        cause: error.cause
      });
      setThinkingSteps([]);
      
      // Enhanced error message with better diagnostics
      let errorMessage = '❌ **Website Generation Failed**\n\n';
      
      if (error.message?.includes('API key')) {
        errorMessage += '🔑 **API Key Issue**: One or more API keys are missing or invalid.\n\n';
        errorMessage += '**Check your .env file contains:**\n- `VITE_GOOGLE_API_KEY=AIzaSy...`\n- `VITE_OPENROUTER_API_KEY=sk-or-v1-...`\n- `VITE_GROQ_API_KEY=gsk_...`\n\n';
        errorMessage += '**Current API Key Status:**\n';
        errorMessage += `- Google: ${import.meta.env.VITE_GOOGLE_API_KEY ? '✅ Present' : '❌ Missing'}\n`;
        errorMessage += `- OpenRouter: ${import.meta.env.VITE_OPENROUTER_API_KEY ? '✅ Present' : '❌ Missing'}\n`;
        errorMessage += `- Groq: ${import.meta.env.VITE_GROQ_API_KEY ? '✅ Present' : '❌ Missing'}`;
      } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('ENOTFOUND')) {
        errorMessage += '🌐 **Network Issue**: Cannot connect to AI services.\n\n';
        errorMessage += '**Troubleshooting:**\n- Check your internet connection\n- Try again in a few moments\n- Verify firewall/proxy settings';
      } else if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('429')) {
        errorMessage += '⚡ **API Quota Exceeded**: Rate limit or usage limit reached.\n\n';
        errorMessage += '**Solutions:**\n- Wait a few minutes and try again\n- Check your API usage limits\n- Try a different prompt';
      } else if (error.message?.includes('All code generation strategies failed')) {
        errorMessage += '🔄 **All AI Services Failed**: None of the AI models could generate your website.\n\n';
        errorMessage += '**This usually means:**\n- Network connectivity issues\n- API service outages\n- Invalid API keys\n\n';
        errorMessage += '**Try:**\n- Check the browser console for detailed errors\n- Verify your internet connection\n- Try a simpler prompt like "Create a simple landing page"';
      } else {
        errorMessage += `🔍 **Technical Error**: ${error.message}\n\n`;
        errorMessage += '**Debug Information:**\n';
        errorMessage += `- Error Type: ${error.name || 'Unknown'}\n`;
        errorMessage += `- Timestamp: ${new Date().toISOString()}\n\n`;
        errorMessage += '**Troubleshooting:**\n- Check the browser console for detailed logs\n- Try refreshing the page\n- Try a different prompt\n- Contact support if the issue persists';
      }
      
      addMessage('ai', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Generate intelligent, context-aware suggestions based on user input and website type
  const generateSmartSuggestions = (userInput: string, websiteType: string): string[] => {
    const input = userInput.toLowerCase();
    const suggestions: string[] = [];

    // Base suggestions for all website types
    const baseSuggestions = [
      'Add a professional contact form',
      'Include customer testimonials',
      'Add social media integration',
      'Create a newsletter signup',
      'Add a FAQ section'
    ];

    // Context-specific suggestions based on website type
    if (websiteType === 'Business') {
      suggestions.push(
        'Add service pricing tables',
        'Include team member profiles',
        'Add client case studies',
        'Create a services overview',
        'Add business location map'
      );
    } else if (websiteType === 'Portfolio') {
      suggestions.push(
        'Add project gallery',
        'Include skills showcase',
        'Add resume/CV download',
        'Create project case studies',
        'Add client recommendations'
      );
    } else if (websiteType === 'Restaurant') {
      suggestions.push(
        'Add online menu with prices',
        'Include reservation system',
        'Add chef profiles',
        'Create food gallery',
        'Add delivery options'
      );
    } else if (websiteType === 'Landing Page') {
      suggestions.push(
        'Add conversion-focused CTA',
        'Include feature benefits',
        'Add pricing comparison',
        'Create urgency elements',
        'Add trust badges'
      );
    }

    // Industry-specific suggestions based on keywords
    if (input.includes('tech') || input.includes('software') || input.includes('app')) {
      suggestions.push('Add API documentation', 'Include feature roadmap', 'Add developer resources');
    }
    if (input.includes('health') || input.includes('medical') || input.includes('doctor')) {
      suggestions.push('Add appointment booking', 'Include service areas', 'Add insurance information');
    }
    if (input.includes('education') || input.includes('school') || input.includes('course')) {
      suggestions.push('Add course catalog', 'Include instructor profiles', 'Add enrollment form');
    }
    if (input.includes('ecommerce') || input.includes('shop') || input.includes('store')) {
      suggestions.push('Add product catalog', 'Include shopping cart', 'Add payment options');
    }

    // Combine and randomize suggestions
    const allSuggestions = [...suggestions, ...baseSuggestions];
    const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
    
    // Return 5 unique suggestions
    return shuffled.slice(0, 5);
  };

  // Generate personalized initial success message
  const generateInitialSuccessMessage = (websiteType: string, userInput: string): string => {
    const companyMatch = userInput.match(/(?:for|called|named)\s+([A-Z][a-zA-Z\s&]+)/i);
    const companyName = companyMatch ? companyMatch[1].trim() : 'your company';
    
    return `🎉 **Fantastic! Your ${websiteType} is Ready!**\n\nI've just crafted a stunning, professional website specifically for ${companyName}. This isn't just another template – it's a custom-designed digital experience that captures your unique vision.\n\n✨ **What makes this special:**\n- 🎨 **Bespoke Design**: Every element is tailored to your requirements\n- 🌟 **Premium Quality**: Enterprise-level code and design standards\n- 📱 **Perfect Responsiveness**: Looks amazing on every device\n- ⚡ **Lightning Fast**: Optimized for speed and performance\n- 🎭 **Unique Identity**: No generic templates – this is uniquely yours\n\n💡 **Want to make it even better?** Just tell me what you'd like to adjust:\n- *"Add a contact form"*\n- *"Change the color scheme to blue"*\n- *"Include customer testimonials"*\n- *"Add a pricing section"*\n\n**Your website is live and ready to impress!** 🚀`;
  };

  // Generate personalized follow-up success message
  const generateFollowUpSuccessMessage = (userRequest: string, websiteType: string): string => {
    const request = userRequest.toLowerCase();
    let changeType = 'modification';
    
    if (request.includes('add') || request.includes('include')) {
      changeType = 'addition';
    } else if (request.includes('change') || request.includes('modify')) {
      changeType = 'update';
    } else if (request.includes('remove') || request.includes('delete')) {
      changeType = 'removal';
    } else if (request.includes('color') || request.includes('style')) {
      changeType = 'styling update';
    }
    
    return `✅ **Perfect! Your ${changeType} is complete!**\n\nI've carefully integrated your request: *"${userRequest}"* into your existing website. The changes feel natural and maintain the premium quality you started with.\n\n🎯 **What I've done:**\n- Made targeted changes that address your specific request\n- Preserved the existing design language and branding\n- Ensured everything flows seamlessly together\n- Maintained mobile responsiveness and performance\n\n🔮 **Ready for more refinements?** I'm here to help you perfect every detail:\n- *"That looks great, now add..."*\n- *"Can you adjust the..."*\n- *"I'd also like to include..."*\n\n**Your website keeps getting better!** 🌟 What would you like to refine next?`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 max-h-full">
        
        {/* ChatGPT-Style Chat Panel */}
        <div className={`flex flex-col w-full lg:w-1/2 xl:w-2/5 bg-slate-900/95 border-r border-slate-700/30 shadow-2xl backdrop-blur-xl ${showMobilePreview ? 'hidden lg:flex' : 'flex'} h-full min-h-0 max-h-full overflow-hidden`}>
          
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-700/50 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-sm sm:text-base">W</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white font-semibold text-sm sm:text-base truncate">WaveCodeGen</h2>
                <p className="text-gray-400 text-xs truncate">AI Website Generator</p>
              </div>
              <div className="ml-auto flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Mobile Preview Toggle - Only visible on mobile/tablet */}
                <button
                  onClick={() => setShowMobilePreview(!showMobilePreview)}
                  className="lg:hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-1"
                >
                  {showMobilePreview ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  {showMobilePreview ? 'Back to Chat' : 'Preview'}
                </button>
                
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-slate-900/30 to-slate-800/30 chat-scrollbar min-h-0">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25'
                      : message.sender === 'system'
                      ? 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-200 border border-amber-500/30'
                      : 'bg-slate-800/80 backdrop-blur-xl text-gray-100 border border-slate-700/50 shadow-black/50'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium uppercase tracking-wide">WaveCodeGen AI</span>
                    </div>
                  )}
                  
                  {message.sender === 'ai' || message.sender === 'system' ? (
                    <div
                      className="prose prose-invert prose-sm max-w-none prose-headings:text-blue-300 prose-links:text-blue-400 prose-strong:text-white prose-code:bg-slate-700/50 prose-code:text-blue-300 prose-p:break-words prose-li:break-words overflow-wrap-anywhere"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownToHtml(message.text),
                      }}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed font-medium break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{message.text}</p>
                  )}
                  
                  {message.timestamp && (
                    <div className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Steps */}
            {thinkingSteps.length > 0 && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="bg-slate-800/80 backdrop-blur-xl text-gray-100 border border-slate-700/50 p-4 rounded-2xl shadow-lg max-w-[85%]">
                  <div className="flex items-center gap-2 mb-3 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium uppercase tracking-wide">Generating...</span>
                  </div>
                  <div className="space-y-2">
                    {thinkingSteps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && suggestions.length > 0 && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-medium">💡 Try these suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-700/60 hover:bg-blue-600/40 text-gray-200 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-blue-500/30 border border-slate-600/30 hover:border-blue-500/30"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ChatGPT-Style Input Area */}
          <div className="p-3 sm:p-4 border-t border-slate-700/30 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl flex-shrink-0">
            {/* File Upload Indicator */}
            {uploadedFile && (
              <div className="mb-3 p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setFileContent('');
                    setInputValue('');
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Premium Perplexity-Style Input Container */}
            <div className="relative group">
              {/* Enhanced Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-700 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/40 to-purple-600/40 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-all duration-500"></div>
              
              {/* Premium Main Container */}
              <div className="relative flex items-end gap-2 sm:gap-4 p-3 sm:p-5 bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-slate-600/40 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-2xl hover:border-blue-400/50 focus-within:border-blue-400/70 focus-within:bg-gradient-to-br focus-within:from-slate-700/98 focus-within:to-slate-600/98 focus-within:shadow-blue-500/20 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
                
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-shrink-0 p-2.5 sm:p-3.5 text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-400 transform hover:scale-110 disabled:hover:scale-100 hover:bg-gradient-to-r hover:from-blue-500/15 hover:to-purple-500/15 rounded-xl sm:rounded-2xl border border-transparent hover:border-blue-500/30 shadow-lg hover:shadow-blue-500/20"
                  title="Upload .txt file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Premium Perplexity-Style Textarea Container */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="🚀 Describe your business or website idea... I'll create something extraordinary! (e.g., 'Modern restaurant website for Italian cuisine' or 'SaaS platform for project management')"
                    className="w-full bg-transparent text-gray-100 placeholder-gray-400/60 resize-none outline-none min-h-[28px] max-h-[120px] sm:max-h-[180px] py-2 sm:py-3 px-1 sm:px-2 text-[16px] leading-6 sm:leading-7 font-medium placeholder:font-normal selection:bg-blue-500/30 focus:placeholder-gray-500/40 transition-all duration-300"
                    disabled={isLoading}
                    rows={1}
                    style={{
                      fontSize: '16px', // Prevents zoom on iOS
                      lineHeight: '1.75',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif',
                      letterSpacing: '0.01em'
                    }}
                  />
                  
                  {/* Character Count (iOS Style) */}
                  {inputValue.length > 0 && (
                    <div className="absolute bottom-1 right-1 text-xs text-gray-500 font-mono">
                      {inputValue.length}
                    </div>
                  )}
                </div>

                {/* Premium Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="flex-shrink-0 p-2.5 sm:p-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl sm:rounded-2xl transition-all duration-400 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-blue-500/40 active:scale-95 border border-blue-500/30 hover:border-blue-400/50"
                  title={isLoading ? "Generating..." : "Send message"}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Helper Text */}
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`flex-1 min-w-0 h-full max-h-full overflow-hidden flex flex-col ${showMobilePreview ? 'flex' : 'hidden lg:flex'}`}>
          <Preview 
            code={latestCode} 
            isLoading={isLoading} 
            thinkingSteps={thinkingSteps} 
            files={generatedFiles}
            showMobilePreview={showMobilePreview}
            onMobileToggle={() => setShowMobilePreview(!showMobilePreview)}
            autoSwitchToPreview={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
