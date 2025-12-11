import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { BrainCircuitIcon, SendIcon, SettingsIcon, MagicWandIcon } from './IconComponents';
import Preview from './Preview';
import { aiService } from '../services/ai';
import { CodeGenerator } from '../services/codeGenerator';

// Configure marked to remove deprecation warnings
marked.setOptions({
  mangle: false,
  headerIds: false
});

// Use marked + DOMPurify for robust markdown -> HTML rendering
const renderMarkdownToHtml = (md: string) => {
  if (!md) return '';
  const html = marked.parse(md || '');
  return DOMPurify.sanitize(html);
};

// Enhanced fallback summary builder with industry-grade features
const buildFallbackSummary = (htmlCode: string) => {
  const features: string[] = [];
  
  // Detect advanced features
  if (/<form[\s>]/i.test(htmlCode)) features.push('✅ Real-time form validation');
  if (/(theme|dark mode|dark-mode|darkmode)/i.test(htmlCode)) features.push('🌙 Multi-theme system with persistence');
  if (/<modal|role=["']dialog["']/i.test(htmlCode)) features.push('📱 Accessible modal dialogs');
  if (/<nav/i.test(htmlCode)) features.push('🧭 Responsive navigation with smooth scrolling');
  if (/<hero/i.test(htmlCode) || /class="[^"]*hero[^"]*"/i.test(htmlCode)) features.push('🎨 Hero section with professional imagery');
  if (/<script/i.test(htmlCode)) features.push('⚡ Interactive animations and micro-interactions');
  if (/fetch\(|axios|XMLHttpRequest/i.test(htmlCode)) features.push('🔄 Dynamic data loading');
  if (/loading=["']lazy["']/i.test(htmlCode)) features.push('🚀 Performance optimized images');
  if (/aria-/i.test(htmlCode)) features.push('♿ WCAG 2.1 AA accessibility compliance');
  if (/transition|animation/i.test(htmlCode)) features.push('✨ Smooth animations and transitions');
  
  if (features.length === 0) features.push('🏗️ Industry-grade responsive layout and architecture');

  return `🎉 **Industry-Grade Website Complete!**\n\nI've generated a production-ready website using **Gemini 2.5 Flash** with:\n${features.join('\n')}\n\n🚀 **Key Highlights:**\n- Built with modern web standards\n- Optimized for performance and SEO\n- Ready for immediate deployment\n- Includes professional imagery integration\n\n💡 **Try the preview** to experience the smooth interactions, theme switching, and responsive design!`;
};

const VibeControl: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold text-cyan-400 mb-1">{label}</label>
        {children}
    </div>
);

interface Message {
  id: number;
  sender: 'user' | 'ai' | 'system';
  text: string;
}

interface HeroProps {
  promptCredits: number;
  setPromptCredits: React.Dispatch<React.SetStateAction<number>>;
  isUnlimited?: boolean;
}

const Hero: React.FC<HeroProps> = ({ promptCredits, setPromptCredits, isUnlimited = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: "**Welcome to WaveCodeGen**\n\nI create production-ready websites that match the quality of Bolt.new, Claude Artifacts, and Google AI Studio.\n\n**New Features:**\n- Upload .txt files with your prompts\n- Production-ready code generation\n- Perfect mobile experience\n- Lightning-fast generation\n\n**Get Started:** Describe your website idea or upload a .txt file with your detailed requirements!" }
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInitialGeneration = latestCode === '';

  // This effect ensures that the view scrolls down only when a new message is added, not during streaming.
  // Scroll when messages change (includes streaming updates)
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const constructPrompt = (userRequest: string, currentCode: string | null) => {
    const densityDesc = layoutDensity < 33 ? 'Compact layout with smaller spacing.' : layoutDensity < 66 ? 'Default, balanced spacing.' : 'Spacious layout with generous whitespace.';
    const [headingFont, bodyFont] = fontPair.split('_');
    const fontLink = `https://fonts.googleapis.com/css2?family=${headingFont}:wght@700;900&family=${bodyFont}:wght@400;600&display=swap`;
    const fontStyling = `h1,h2,h3 { font-family: '${headingFont}', sans-serif; } body { font-family: '${bodyFont}', sans-serif; }`;

    const commonInstructions = `
- **Process:** As you build, insert special comment markers \`<!-- WAVE_STEP: [Your current step] -->\` right before each major section.
- **Functionality:** If the request implies interactivity, you MUST write modern vanilla JavaScript (ES6+) in an embedded <script> tag with proper error handling.
- **Output Separators:** After all code, you MUST include a separator: '---SUGGESTIONS---'. After this, provide a JSON array of 3 short, creative follow-up prompts for the user.
- **Mandate:** All CSS and JS must be internally embedded. Use Tailwind CSS via CDN.
- **Fonts:** ALWAYS import fonts from Google Fonts: <link href="${fontLink}" rel="stylesheet">. Apply fonts in a <style> tag: ${fontStyling}.
- **Content:** Generate rich, relevant content. NO "Lorem Ipsum". Use https://placehold.co/ for placeholder images.
- **Quality:** Code must be responsive, accessible, and well-formatted. Add subtle animations and transitions for a premium feel.
- **Vibe Preferences:**
  - **Primary Color:** ${primaryColor}. Use for buttons, links, highlights.
  - **Layout Density:** ${densityDesc}
`;

    // ENHANCED: Industry-grade best practices for production-ready websites with INTERACTIVE JAVASCRIPT & CSS
    const enhancedTail = `
- **INTERACTIVE JAVASCRIPT FEATURES (CRITICAL):**
  - Implement event listeners for all interactive elements: click, hover, focus, input, change, scroll.
  - Add smooth scroll behavior and page anchor navigation with active state tracking.
  - Include form validation with real-time feedback (input validation, error messages, success states).
  - Implement modal/popup functionality with backdrop click detection and escape key handling.
  - Add smooth transitions and animations on page load (fade-in, slide-in, bounce effects).
  - Implement lazy loading for images and content sections (Intersection Observer API).
  - Add dark/light mode toggle with localStorage persistence for theme preference.
  - Implement navbar sticky behavior with scroll-to-top button.
  - Add interactive counters, carousels/sliders, and tabbed content with smooth transitions.
  - Include tooltips, popovers, and floating elements with smooth animations.
  - Implement real-time search/filter functionality if applicable.
  - Add keyboard navigation support for all interactive elements (Tab, Enter, Esc keys).
  - Implement smooth hover effects on cards, buttons, and links with scale/color transitions.
  - Add progress indicators for multi-step forms or process flows.
  - Include notification/toast messages with auto-dismiss functionality.
  - Implement parallax scrolling effects for visual depth.
  - Add smooth number counting animations for statistics or metrics.
  - Include copy-to-clipboard functionality for code snippets or shareable content.

- **ADVANCED CSS ANIMATIONS & EFFECTS (CRITICAL):**
  - Use CSS transitions for all hover/focus states (smooth 0.3s transitions).
  - Implement keyframe animations: fade-in (opacity), slide-in (transform), bounce, pulse, shimmer.
  - Add gradient backgrounds with animated direction changes or color shifts.
  - Use box-shadow transitions for depth effects on hover.
  - Implement CSS variables (--primary, --secondary, --spacing) for easy theming and dynamic updates via JS.
  - Add backdrop filters (backdrop-blur) for modern glassmorphism effects.
  - Use transform: scale, rotate, translate for performant animations (not position/top/left).
  - Implement custom scrollbars with CSS for visual consistency.
  - Add text shadow and glow effects for emphasis.
  - Use clip-path for creative shape masks and animations.
  - Implement smooth text transitions with letter-spacing and line-height changes.
  - Add 3D transforms (rotateX, rotateY, perspective) for depth effects.
  - Include SVG animations if logos or icons are used (animate, morph effects).
  - Add underline/border animations on link hover (expand, slide effects).
  - Implement animated backgrounds (gradients, patterns) with @keyframes.
  - Use CSS grid and flexbox animations for smooth layout transitions.
  - Add loading spinners, skeletons, and shimmer effects during data fetching.

- **INTERACTIVE COMPONENT REQUIREMENTS:**
  - **Buttons:** All buttons must have hover (scale 1.05, color shift), active (scale 0.95), and focus (outline/ring) states.
  - **Forms:** Include real-time validation feedback with color-coded success/error states, placeholder guidance, and accessible labels.
  - **Cards/Sections:** Add hover lift effects (box-shadow increase, transform: translateY), smooth transitions.
  - **Navigation:** Implement active state highlighting, smooth scroll anchors, mobile hamburger menu with animation.
  - **Modals:** Include fade backdrop, smooth scale/slide animations on open/close, escape key handling.
  - **Carousels:** Add smooth auto-slide transitions, prev/next buttons with smooth scrolling, dot indicators.
  - **Tabs/Accordion:** Smooth content transitions, animated underline/border indicators, keyboard navigation.
  - **Images:** Include lazy loading, smooth fade-in on load, optional hover zoom effects.
  - **Text:** Smooth fade-in animations, staggered paragraph reveals, gradient text effects.

- **Code Quality & Performance:**
  - Write clean, semantic HTML with proper structure (header, nav, main, article, section, aside, footer).
  - Minimize JavaScript bundle; use event delegation and lazy loading where appropriate.
  - Optimize images: use srcset for responsive images, webp format when possible, and proper aspect ratios.
  - Implement performant CSS animations using transform and opacity only (avoid layout thrashing).
  - Prefetch DNS for third-party APIs and defer non-critical scripts.
  
- **Accessibility (WCAG 2.1 AA Compliance):**
  - Use semantic HTML elements (nav, main, article, section, aside, footer, h1-h6).
  - Add ARIA labels, roles, and live regions for dynamic content.
  - Ensure keyboard navigation: all interactive elements must be focusable and keyboard-operable.
  - Provide meaningful alt text for all images and icons.
  - Maintain minimum 4.5:1 contrast ratio for text against backgrounds.
  - Use focus indicators and avoid focus traps.
  - Include skip-to-main-content link for screen readers.
  - Test keyboard TAB navigation; document in comments.
  
- **SEO & Meta Tags:**
  - Include <title>, <meta name="description">, <meta name="viewport">.
  - Add Open Graph and Twitter Card meta tags (og:title, og:description, og:image, twitter:card).
  - Use structured data (JSON-LD) for rich snippets (e.g., for articles, products, organizations).
  - Ensure mobile-first, responsive design with proper viewport settings.
  - Use rel="canonical" if needed for duplicate content management.
  
- **Security & Best Practices:**
  - Sanitize any user input before rendering to the DOM.
  - Use Content Security Policy (CSP) headers via meta tag if applicable.
  - Avoid inline event handlers; use addEventListener for JavaScript events.
  - Include a robots meta tag if needed (robots, noindex directives).
  - Use HTTPS links and externalize sensitive APIs (never expose API keys).
  
- **Mobile-First & Responsive Design:**
  - Design mobile-first, then progressively enhance for larger screens.
  - Use CSS media queries for breakpoints (sm, md, lg, xl).
  - Ensure touch targets are at least 44x44px for mobile accessibility.
  - Test on multiple devices and orientations.
  
- **UX & Visual Design:**
  - Prioritize clean, modern aesthetics with glassmorphism, neumorphism, or minimal brutalism as appropriate.
  - Use consistent color palettes and spacing (implement CSS variables for design tokens).
  - Provide visual feedback for all interactive elements (hover, active, focus, disabled states).
  - Include smooth micro-interactions and page transitions for engagement.
  - Ensure proper loading states and error messages for user clarity.
  - Use whitespace effectively to reduce cognitive load.
  
- **Forms & User Input:**
  - Include client-side validation with clear, actionable error messages.
  - Use proper HTML form elements (<input>, <select>, <textarea>) with associated <label> tags.
  - Provide visual feedback on form state (valid, invalid, pristine, touched).
  - Support form submission with keyboard (Enter key).
  - Use appropriate input types (email, tel, date) to leverage browser UI.
  
- **Developer Experience & Maintainability:**
  - Add HTML comments at major section boundaries (WAVE_STEP markers).
  - Use CSS custom properties (--primary-color, --spacing-unit, etc.) for easy theming.
  - Structure JavaScript into reusable functions and modules.
  - Include TODO comments for future enhancements or known limitations.
  - At the end, include a "Developer Notes" section with:
    * How to customize colors, fonts, and spacing.
    * Dark mode toggle implementation (if applicable).
    * Recommended production steps: bundling, minification, build process.
    * Where to add backend API integration.
    * Performance optimization checklist (image CDN, lazy loading, caching).
  
- **Output Stability:**
  - Ensure all HTML tags are properly closed and valid.
  - Validate CSS for syntax errors; use proper vendor prefixes if needed.
  - Test JavaScript for runtime errors (check console).
  - Ensure the file is self-contained and copy-paste-ready as a single HTML file.
  - Include a baseline print stylesheet to ensure readability in print.
  
- **Advanced Features (When Applicable):**
  - Implement smooth scrolling anchor links with active state highlighting.
  - Add breadcrumb navigation for multi-page flows.
  - Use data attributes (data-*) for dynamic interactivity and DOM manipulation.
  - Include a "back to top" button with smooth scroll for long pages.
  - Provide theme toggle (light/dark) with localStorage persistence if appropriate.
  - Add interactive statistics counters with animation on scroll.
  - Implement smooth page transitions between sections.
  - Add particle effects, SVG animations, or canvas-based graphics if design calls for it.
  - Include social media sharing buttons with working links.
  - Add newsletter subscription form with email validation and success feedback.
`;

    const fullCommonInstructions = commonInstructions + enhancedTail;

  if (currentCode) {
    return `You are WaveCodeGen, an elite AI prototyper specializing in production-grade, industry-standard websites and applications. Your task is to modify the provided HTML code based on the user's request while maintaining the highest quality standards.

- **User Request:** "${userRequest}"
- **Current Code:**
\`\`\`html
${currentCode}
\`\`\`

${fullCommonInstructions}

- **Output:** Adhere strictly to the format: Full Modified Code with WAVE_STEP comments → ---SUGGESTIONS--- → JSON array of 3 follow-up prompts. No other conversation.`;
  }

  return `You are WaveCodeGen, an elite AI prototyper specializing in production-grade, industry-standard websites and applications. Your task is to generate a single, self-contained HTML file from scratch based on the user's request while maintaining the highest quality standards.

- **User Request:** "${userRequest}"

${fullCommonInstructions}

- **Output:** Adhere strictly to the format: Code with WAVE_STEP comments → ---SUGGESTIONS--- → JSON array of 3 follow-up prompts. No other conversation.`;
  };
  
  // Generate response and stream it into the UI (simulate streaming by chunking)
  const generateResponse = async (prompt: string, messageId: number) => {
    try {
      const full = await aiService.generateWithFallback(prompt);
      // stream the response by revealing chunks
      const chunkSize = 40;
      let idx = 0;
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: '' } : m));
      while (idx < full.length) {
        const next = full.slice(0, idx + chunkSize);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: next } : m));
        // small delay to simulate streaming
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 40));
        idx += chunkSize;
      }
      return full;
    } catch (error: any) {
      console.error("❌ AI Generation Error:", error);
      
      // Enhanced error messages with specific guidance
      let errorMessage = "I encountered an issue generating your website. ";
      
      if (error.message?.includes('API key') || error.message?.includes('Google API key')) {
        errorMessage += "🔑 **API Key Issue**: Please check your .env file and ensure your Google API key (VITE_GOOGLE_API_KEY) is valid and has Gemini API access enabled.";
      } else if (error.message?.includes('OpenRouter')) {
        errorMessage += "🔄 **Fallback Issue**: The primary Gemini service and OpenRouter fallback both failed. Please check your OpenRouter API key (VITE_OPENROUTER_API_KEY).";
      } else if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
        errorMessage += "⏱️ **Timeout**: The request took too long. Try a simpler request or check your internet connection.";
      } else if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        errorMessage += "🌐 **Network Error**: Please check your internet connection and try again.";
      } else if (error.response?.status === 401) {
        errorMessage += "🚫 **Authentication Failed**: Your API key may be invalid or expired. Please check your .env file.";
      } else if (error.response?.status === 429) {
        errorMessage += "⏳ **Rate Limit**: Too many requests. Please wait a moment and try again.";
      } else if (error.response?.status === 500) {
        errorMessage += "🔧 **Service Issue**: The AI service is experiencing issues. Please try again in a few minutes.";
      } else if (error.message?.includes('Freepik')) {
        errorMessage += "🖼️ **Image Generation**: Image generation failed, but I'll use high-quality placeholders instead.";
      } else {
        errorMessage += `❌ **Error**: ${error.message || 'Unknown error'}. Check the browser console for technical details.`;
      }
      
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sender: 'system', text: errorMessage } : m));
      return '';
    }
  };

  const handleEnhancePrompt = async () => {
    if (!inputValue.trim() || isLoading) return;
    setIsLoading(true);
    const enhancePrompt = `You are an expert prompt engineer. Take the user's idea for a website and make it more detailed and descriptive for an AI website generator. Return only the improved prompt, nothing else. User Idea: "${inputValue}"`;
    try {
      const enhancedPrompt = await aiService.generateWithFallback(enhancePrompt);
      setInputValue(enhancedPrompt);
    } catch (error) {
      console.error("Enhancement Error:", error);
      setInputValue("Sorry, couldn't enhance the prompt.");
    }
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/plain') {
      alert('Please upload a .txt file only');
      return;
    }
    
    if (file.size > 50000) { // 50KB limit
      alert('File size must be less than 50KB');
      return;
    }
    
    try {
      const content = await file.text();
      setUploadedFile(file);
      setFileContent(content);
      setInputValue(content);
      
      // Show success message
      const successMessage = `File uploaded: "${file.name}" (${Math.round(file.size / 1024)}KB)`;
      const newMessage: Message = { id: Date.now(), sender: 'ai', text: successMessage };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };
  
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    const messageContent = inputValue.trim() || fileContent.trim();
    if (!messageContent || isLoading) return;

    const userMessageId = Date.now();
    const userMessage: Message = { id: userMessageId, sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = messageContent;
    setInputValue('');
    handleRemoveFile(); // Clear uploaded file after sending
    setIsLoading(true);
    setSuggestions([]);

    if(isInitialGeneration && !isUnlimited) {
      const newCredits = promptCredits - 1;
      setPromptCredits(newCredits);
      localStorage.setItem('waveCodeGenCredits', JSON.stringify(newCredits));
    }

  try {
  // Step 1: Conversational Acknowledgement (streamed in chat)
  const ackPrompt = `The user wants to: "${currentInput}". Briefly acknowledge this in a friendly, conversational tone and say you're getting started.`;
  const ackMessageId = userMessageId + 10000; // Ensure unique ID
  setMessages(prev => [...prev, { id: ackMessageId, sender: 'ai', text: '' }]);
  await generateResponse(ackPrompt, ackMessageId);

      // Step 2: Enhanced Code Generation (HIDDEN from chat, only shown in preview)
  // NOTE: We do NOT show "Building..." in the chat. The generation happens silently.
  // The Preview component shows thinking steps in the preview area instead.
  // Using enhanced CodeGenerator for robust 500+ line code with internal CSS and JavaScript
  const buildingMessageId = userMessageId + 10001; // Ensure unique ID
  
  // Show thinking steps in preview
  const thinkingSteps = [
    'Analyzing your request...',
    'Selecting optimal architecture...',
    'Generating production-ready code...',
    'Applying modern design patterns...',
    'Optimizing for performance...'
  ];
  setThinkingSteps(thinkingSteps);
  
  let finalCode = '';
  let suggestionsPart = '';
  
  try {
    // Generate robust code using enhanced CodeGenerator
    const stylePreferences = {
      primaryColor: primaryColor,
      headingFont: fontPair.split('_')[0],
      bodyFont: fontPair.split('_')[1],
      layoutDensity: layoutDensity
    };
    
    if (isInitialGeneration) {
      // Generate new code from scratch with enhanced industry-grade generation
      console.log('🚀 Using enhanced industry-grade generation with Gemini 2.5 Flash...');
      const generatedResponse = await CodeGenerator.generateRobustCode(currentInput, stylePreferences);
      
      // Extract multi-file structure from the response
      console.log('🔍 Raw AI response length:', generatedResponse.length);
      const multiFiles = CodeGenerator.extractMultiFileFromResponse(generatedResponse);
      console.log('📁 Extracted files:', { 
        hasHTML: !!multiFiles.html, 
        hasCSS: !!multiFiles.css, 
        hasJS: !!multiFiles.js,
        cssLength: multiFiles.css?.length || 0,
        jsLength: multiFiles.js?.length || 0
      });
      setGeneratedFiles(multiFiles);
      
      // Use combined code for preview
      finalCode = CodeGenerator.combineFilesForPreview(multiFiles);
    } else {
      // Use the full prompt for modifications to existing code
      console.log('🔄 Modifying existing code with enhanced AI...');
      const fullPrompt = constructPrompt(currentInput, latestCode);
      const response = await generateResponse(fullPrompt, buildingMessageId);
      
      const codeDelimiter = '---SUGGESTIONS---';
      const [codePart, suggestionsPartRaw] = response.split(codeDelimiter);
      
      finalCode = codePart.replace(/<!-- WAVE_STEP: (.*?) -->/g, '').trim();
      suggestionsPart = suggestionsPartRaw || '';
    }
    
    // Validate and ensure code is robust
    finalCode = CodeGenerator.validateAndFixHtml(finalCode);
    
    // Enhanced: Production-grade enhancement with Gemini 2.5 Flash
    console.log('🎨 Enhancing code with Gemini 2.5 Flash for production-ready quality...');
    try {
      const enhancedCode = await aiService.enhanceCodeWithGemini(finalCode, currentInput);
      if (enhancedCode && enhancedCode.length > finalCode.length * 0.8) {
        finalCode = enhancedCode;
        console.log('✅ Code successfully enhanced for production deployment!');
      } else {
        console.warn('⚠️ Enhancement returned shorter code, using original');
      }
    } catch (enhanceError) {
      console.warn('⚠️ Enhancement failed, using original code:', enhanceError);
    }
    
    setLatestCode(finalCode);
  } catch (error) {
    console.error('❌ Enhanced code generation failed:', error);
    
    // Intelligent fallback strategy
    try {
      console.log('🔄 Attempting fallback generation strategy...');
      
      if (isInitialGeneration) {
        // Fallback to basic robust generation without images
        console.log('📝 Using basic robust generation...');
        const basicPrompt = constructPrompt(currentInput, null);
        const response = await generateResponse(basicPrompt, buildingMessageId);
        
        // Try to extract multi-file structure from fallback response
        const multiFiles = CodeGenerator.extractMultiFileFromResponse(response);
        if (multiFiles.css || multiFiles.js) {
          setGeneratedFiles(multiFiles);
          finalCode = CodeGenerator.combineFilesForPreview(multiFiles);
        } else {
          // Single file fallback
          const codeDelimiter = '---SUGGESTIONS---';
          const [codePart, suggestionsPartRaw] = response.split(codeDelimiter);
          finalCode = codePart.replace(/<!-- WAVE_STEP: (.*?) -->/g, '').trim();
          suggestionsPart = suggestionsPartRaw || '';
        }
      } else {
        // For modifications, use simpler approach
        const fullPrompt = constructPrompt(currentInput, latestCode);
        const response = await generateResponse(fullPrompt, buildingMessageId);
        
        const codeDelimiter = '---SUGGESTIONS---';
        const [codePart, suggestionsPartRaw] = response.split(codeDelimiter);
        
        finalCode = codePart.replace(/<!-- WAVE_STEP: (.*?) -->/g, '').trim();
        suggestionsPart = suggestionsPartRaw || '';
      }
      
      // Validate fallback code
      finalCode = CodeGenerator.validateAndFixHtml(finalCode);
      
      // Still try to enhance even in fallback
      try {
        console.log('🎨 Attempting enhancement on fallback code...');
        const enhancedCode = await aiService.enhanceCodeWithGemini(finalCode, currentInput);
        if (enhancedCode && enhancedCode.length > finalCode.length * 0.5) {
          finalCode = enhancedCode;
          console.log('✅ Fallback code successfully enhanced!');
        }
      } catch (enhanceError) {
        console.warn('⚠️ Enhancement failed on fallback, using basic code');
      }
      
    } catch (fallbackError) {
      console.error('❌ All generation strategies failed:', fallbackError);
      // Last resort: show error to user
      const errorMessage = "I encountered an issue generating your website. Please try a simpler request or check your API keys.";
      setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: errorMessage }]);
      return;
    }
    
    setLatestCode(finalCode);
  }
    
        // Parse suggestions if available
        if (suggestionsPart) {
          try {
            const parsedSuggestions = JSON.parse(suggestionsPart.trim());
            if (Array.isArray(parsedSuggestions)) {
              setSuggestions(parsedSuggestions);
            }
          } catch (e) { /* JSON parse error, ignore */ }
        }

        // Step 3: Enhanced Summary with generation details
        const summaryPrompt = `You just built/updated an industry-grade website based on: "${currentInput}". 
        
        In a friendly, professional tone, briefly summarize what you created, highlighting:
        - The modern technologies and features implemented
        - The production-ready enhancements added
        - The accessibility and performance optimizations
        
        Then, under "🚀 **Next Steps**:", list three actionable follow-up suggestions as a bulleted list using markdown.`;
        
        const summaryMessageId = userMessageId + 10002;
        setMessages(prev => [...prev, { id: summaryMessageId, sender: 'ai', text: '' }]);
        
        try {
          const aiSummary = await generateResponse(summaryPrompt, summaryMessageId);
          if (!aiSummary || !aiSummary.trim()) {
            const fallback = buildFallbackSummary(finalCode);
            setMessages(prev => prev.map(m => m.id === summaryMessageId ? { ...m, text: fallback } : m));
          }
        } catch (e) {
          console.warn('Summary generation failed, using fallback');
          const enhancedFallback = `✅ **Website Generated Successfully!**

I've created an industry-grade website using **Gemini 2.5 Flash** with:
- 🎨 Professional images integrated seamlessly
- ⚡ Real-time interactions and animations
- 📱 Mobile-first responsive design
- ♿ WCAG 2.1 AA accessibility compliance
- 🚀 Production-ready code structure

🚀 **Next Steps**:
- Test the interactive features and animations
- Customize colors and content to match your brand
- Deploy to your hosting platform of choice`;
          setMessages(prev => prev.map(m => m.id === summaryMessageId ? { ...m, text: enhancedFallback } : m));
        }
        
        // Clear thinking steps after generation is complete
        setThinkingSteps([]);

    } catch (error) {
      console.error('❌ Critical error in website generation:', error);
      
      const errorMessage = `🚨 **Generation Failed**\n\nI encountered a critical error while generating your website. This might be due to:\n\n- 🔑 **API Configuration**: Check your .env file has valid API keys\n- 🌐 **Network Issues**: Verify your internet connection\n- ⚡ **Service Overload**: Try again in a few minutes\n\n💡 **Quick Fix**: Try a simpler request like "Create a simple landing page" to test the system.`;
      
      setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: errorMessage }]);
    } finally {
      setIsLoading(false);
      // Clear thinking steps on completion or error
      setThinkingSteps([]);
    }
  };

  // Helper function to extract WAVE_STEP comments and return thinking steps
  const extractThinkingSteps = (text: string): string[] => {
    const matches = [...text.matchAll(/<!-- WAVE_STEP: (.*?) -->/g)];
    return matches.map(m => m[1]);
  };

  // IMPROVED: Filter ALL code-related content from messages (aggressive filtering)
  const filterCodeFromMessage = (text: string): string => {
    let filtered = text;
    
    // Remove code blocks (all variants)
    filtered = filtered.replace(/```[\s\S]*?```/g, '');
    
    // Remove HTML tags/snippets that look like code examples
    filtered = filtered.replace(/<[^>]*>/g, '');
    
    // Remove WAVE_STEP comments
    filtered = filtered.replace(/<!-- WAVE_STEP:.*?-->/g, '');
    
    // Remove any lines that are just whitespace or dashes
    filtered = filtered.split('\n').filter(line => line.trim().length > 0).join('\n');
    
    return filtered.trim();
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex flex-col w-full md:w-1/3 lg:w-1/3 bg-slate-900/80 border-r border-blue-500/15 shadow-2xl shadow-black/50 backdrop-blur-sm overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-slate-900/50 to-slate-800/30">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] p-4 sm:p-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-4 sm:ml-8 shadow-blue-500/25'
                    : 'bg-slate-800/80 backdrop-blur-xl text-gray-100 mr-4 sm:mr-8 border border-slate-700/50 shadow-black/50'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-3 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium uppercase tracking-wide">WaveCodeGen AI</span>
                  </div>
                )}
                {message.sender === 'ai' ? (
                  <div
                    className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-blue-300 prose-links:text-blue-400 prose-strong:text-white prose-code:bg-slate-700/50 prose-code:text-blue-300"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdownToHtml(message.text),
                    }}
                  />
                ) : (
                  <p className="text-sm sm:text-base leading-relaxed font-medium">{message.text}</p>
                )}
              </div>
            </div>
          ))}
              {!isLoading && suggestions.length > 0 && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex flex-wrap gap-2 suggestion-chip">
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => handleSuggestionClick(s)} className="px-3 py-1.5 text-xs font-medium bg-slate-700/60 hover:bg-blue-600/40 text-gray-200 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-blue-500/30 border border-slate-600/30 hover:border-blue-500/30">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-slate-700/30 p-3 sm:p-4 bg-slate-800/30">
            {/* File Upload Indicator */}
            {uploadedFile && (
              <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                  <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">({Math.round(uploadedFile.size / 1024)}KB)</span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 hover:bg-emerald-500/20 rounded"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Input Area with Responsive Layout */}
            <div className="relative">
              <div className="p-4 sm:p-6 border-t border-slate-700/30 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl">
                <div className="flex gap-2 sm:gap-3 items-end">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="✨ Describe your dream website... I'll make it stunning!"
                      className="relative w-full p-4 sm:p-5 bg-slate-800/80 border border-slate-600/30 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-300 backdrop-blur-sm hover:bg-slate-700/80 focus:bg-slate-700/80 shadow-lg"
                      rows={uploadedFile ? 6 : 4}
                      style={{
                        minHeight: '60px',
                        maxHeight: '140px',
                        fontSize: 'clamp(14px, 2.5vw, 16px)'
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {/* Mobile-Optimized Button Layout */}
                  <div className="absolute right-2 top-2 flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
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
                      className="p-2.5 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 border border-slate-600/30 shadow-sm hover:shadow-md"
                      title="Upload .txt file with prompt"
                    >
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2.5 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 border border-slate-600/30 shadow-sm hover:shadow-md"
                  title="Upload .txt file with prompt"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </button>
                
                {/* Generate Button - Responsive */}
                <button
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !fileContent.trim()) || isLoading}
                  className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Generating...</span>
                      <span className="sm:hidden">Gen...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Generate</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            {/* Mobile Helper Text */}
            <div className="mt-2 text-xs text-gray-500 sm:hidden flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upload .txt files or type your prompt above
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <Preview code={latestCode} isLoading={isLoading} thinkingSteps={thinkingSteps} files={generatedFiles} />
      </div>
      </div>
    </div>
  );
};

export default Hero;