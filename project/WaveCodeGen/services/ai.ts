import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// API endpoints and keys from environment
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const FREEPIK_API_URL = 'https://api.freepik.com/v1';

export class AIService {
  private googleAI: GoogleGenerativeAI;
  private groqApiKey: string;
  private openRouterApiKey: string;
  private freepikApiKey: string;
  
  constructor() {
    // Use Vite's import.meta.env for environment variables
    this.googleAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || '');
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.freepikApiKey = import.meta.env.VITE_FREEPIK_API_KEY || '';
    
    // Diagnostic check on initialization
    this.checkApiKeys();
  }
  
  // Diagnostic function to check API keys
  private checkApiKeys() {
    console.log('🔍 Enhanced API Keys Diagnostic:');
    console.log('  🤖 Google (Gemini 2.5 Flash):', import.meta.env.VITE_GOOGLE_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('  🔄 OpenRouter (Multi-Model):', this.openRouterApiKey ? '✅ Present' : '❌ Missing');
    console.log('  ⚡ Groq (Fast Fallback):', this.groqApiKey ? '✅ Present' : '❌ Missing');
    console.log('  🎨 Freepik (Pro Images):', this.freepikApiKey ? '✅ Present' : '❌ Missing');
    
    // Test Freepik API key format
    if (this.freepikApiKey) {
      if (this.freepikApiKey.startsWith('FPSX')) {
        console.log('  📝 Freepik API key format: ✅ Valid format detected');
      } else {
        console.warn('  ⚠️ Freepik API key format: Unexpected format (should start with FPSX)');
      }
    }
    
    if (!import.meta.env.VITE_GOOGLE_API_KEY && !this.openRouterApiKey && !this.groqApiKey) {
      console.error('🚨 CRITICAL: No AI API keys found! WaveCodeGen will not work.');
      console.error('📋 Required .env configuration:');
      console.error('  VITE_GOOGLE_API_KEY=AIzaSy... (Primary - Gemini 2.5 Flash)');
      console.error('  VITE_OPENROUTER_API_KEY=sk-or-v1-... (Fallback - Multi-Model)');
      console.error('  VITE_FREEPIK_API_KEY=FPSX... (Professional Images)');
      console.error('  VITE_GROQ_API_KEY=gsk_... (Fast Fallback)');
      console.error('🔗 Get API keys from:');
      console.error('  • Google AI Studio: https://aistudio.google.com/app/apikey');
      console.error('  • OpenRouter: https://openrouter.ai/keys');
      console.error('  • Freepik API: https://www.freepik.com/api');
      console.error('  • Groq: https://console.groq.com/keys');
    } else if (!this.freepikApiKey) {
      console.warn('⚠️ Freepik API key missing - will use high-quality placeholders instead');
    }
  }

  // Groq for Text Generation (fast and efficient)
  async generateTextWithGroq(prompt: string): Promise<string> {
    try {
      if (!this.groqApiKey) {
        throw new Error('Groq API key is missing. Please check your .env file.');
      }
      
      const response = await axios.post(
        `${GROQ_API_URL}/chat/completions`,
        {
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      return response.data.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('❌ Groq Text Generation Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw new Error(`Groq API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Gemini 2.5 Flash for Primary Code Generation (industry-grade)
  async generateCodeWithGemini25Flash(prompt: string): Promise<string> {
    try {
      console.log('🔍 Checking Google API key...');
      if (!import.meta.env.VITE_GOOGLE_API_KEY) {
        throw new Error('Google API key is missing. Please check your .env file.');
      }
      
      console.log('🤖 Initializing Gemini model...');
      const model = this.googleAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',  // Latest Gemini 2.0 Flash model
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.3,  // Lower temperature for more consistent code generation
          topP: 0.8,
          topK: 40
        }
      });
      
      console.log('📝 Sending request to Gemini (prompt length:', prompt.length, 'chars)');
      const result = await model.generateContent(prompt);
      
      console.log('📥 Received response from Gemini');
      const text = result.response.text();
      console.log('✅ Response length:', text.length, 'chars');
      
      return text;
    } catch (error: any) {
      console.error('❌ Gemini 2.5 Flash Error Details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details || error,
        stack: error.stack
      });
      
      // More specific error messages
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Google API key. Please check your VITE_GOOGLE_API_KEY in .env file.');
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('Google API quota exceeded. Please try again later or check your billing.');
      } else if (error.message?.includes('SAFETY')) {
        throw new Error('Content was blocked by safety filters. Try a different prompt.');
      } else {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
    }
  }

  // OpenRouter with KatCoder/Qwen3-coder for Fallback Code Generation
  async generateCodeWithOpenRouter(prompt: string): Promise<string> {
    try {
      if (!this.openRouterApiKey) {
        throw new Error('OpenRouter API key is missing. Please check your .env file.');
      }
      
      // Best FREE coding models (Dec 2024) - Optimized for code generation
      const models = [
        'meta-llama/llama-3.1-70b-instruct',    // Best free model for coding
        'meta-llama/llama-3.1-8b-instruct',     // Fast and reliable for code
        'mistralai/mistral-7b-instruct',        // Excellent for code generation
        'microsoft/wizardlm-2-8x22b',           // Good coding capabilities
        'qwen/qwen-2.5-7b-instruct'             // Strong coding performance
      ];
      
      for (const model of models) {
        try {
          console.log(`🔄 Trying OpenRouter model: ${model}`);
          const response = await axios.post(
            `${OPENROUTER_API_URL}/chat/completions`,
            {
              model: model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.25,
              max_tokens: 8192,
              top_p: 0.85,
              frequency_penalty: 0.5
            },
            {
              headers: {
                'Authorization': `Bearer ${this.openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://wavecodegen.app',
                'X-Title': 'WaveCodeGen'
              },
              timeout: 120000
            }
          );
          console.log(`✅ OpenRouter model ${model} succeeded!`);
          return response.data.choices[0]?.message?.content || '';
        } catch (modelError: any) {
          console.warn(`❌ OpenRouter model ${model} failed:`, modelError.message);
          continue; // Try next model
        }
      }
      
      throw new Error('All OpenRouter models failed');
    } catch (error: any) {
      console.error('❌ OpenRouter Code Generation Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw new Error(`OpenRouter API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Legacy Google API method (kept for compatibility)
  async generateCodeWithGoogle(prompt: string): Promise<string> {
    // Redirect to Gemini 2.5 Flash for better performance
    return this.generateCodeWithGemini25Flash(prompt);
  }

  // Freepik API for Professional Image Generation (Fixed Implementation)
  async generateImageWithFreepik(prompt: string): Promise<string> {
    try {
      if (!this.freepikApiKey) {
        console.warn('⚠️ Freepik API key missing, using high-quality placeholder');
        return this.generatePlaceholderImage(prompt);
      }

      console.log('🎨 Generating professional image with Freepik API...');
      console.log('📝 Original prompt:', prompt);
      
      // Create contextual, professional prompt based on user request
      const enhancedPrompt = this.createContextualImagePrompt(prompt);
      console.log('✨ Enhanced prompt:', enhancedPrompt);
      
      const requestBody = {
        prompt: enhancedPrompt,
        negative_prompt: 'low quality, blurry, distorted, watermark, text overlay, logo, signature, cartoon, anime, sketch, drawing, painting, illustration, 3d render',
        guidance_scale: 1.5, // Better adherence to prompt
        num_images: 1,
        image: {
          size: 'landscape_16_9' // Better for website headers
        },
        styling: {
          style: 'photo', // Realistic photos
          effects: {
            color: 'vibrant',
            lightning: 'natural',
            framing: 'wide'
          }
        },
        filter_nsfw: true
      };
      
      console.log('📤 Sending request to Freepik API...');
      const response = await axios.post(
        `${FREEPIK_API_URL}/ai/text-to-image`,
        requestBody,
        {
          headers: {
            'x-freepik-api-key': this.freepikApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 90000 // Increased timeout for image generation
        }
      );

      console.log('📥 Freepik API response status:', response.status);
      console.log('📊 Response data structure:', Object.keys(response.data || {}));

      // Extract base64 image from response
      const imageData = response.data?.data?.[0];
      if (imageData?.base64) {
        console.log('✅ Freepik image generated successfully!');
        const base64Image = `data:image/jpeg;base64,${imageData.base64}`;
        return base64Image;
      } else {
        console.warn('⚠️ No base64 data in Freepik response:', response.data);
        throw new Error('No image data in Freepik response');
      }
    } catch (error: any) {
      console.error('❌ Freepik Image Generation Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? Object.keys(error.config.headers) : 'none'
        }
      });
      
      // Enhanced fallback with better error handling
      console.log('🔄 Freepik failed, using enhanced placeholder...');
      return this.generatePlaceholderImage(prompt);
    }
  }
  
  /**
   * Create contextual, professional image prompts based on user request and section
   */
  private createContextualImagePrompt(originalPrompt: string): string {
    const lowerPrompt = originalPrompt.toLowerCase();
    
    // Detect the type of website/app from the prompt
    let contextualElements = [];
    
    // Business/Corporate
    if (lowerPrompt.includes('business') || lowerPrompt.includes('corporate') || lowerPrompt.includes('company')) {
      contextualElements.push('professional office environment', 'modern business setting', 'corporate atmosphere');
    }
    
    // Technology/SaaS
    if (lowerPrompt.includes('tech') || lowerPrompt.includes('saas') || lowerPrompt.includes('software') || lowerPrompt.includes('app')) {
      contextualElements.push('modern technology', 'digital innovation', 'sleek tech environment', 'futuristic workspace');
    }
    
    // E-commerce/Shopping
    if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce') || lowerPrompt.includes('product')) {
      contextualElements.push('premium products', 'elegant retail environment', 'luxury shopping experience');
    }
    
    // Creative/Portfolio
    if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('creative') || lowerPrompt.includes('design') || lowerPrompt.includes('art')) {
      contextualElements.push('creative workspace', 'artistic environment', 'design studio', 'modern gallery');
    }
    
    // Healthcare/Medical
    if (lowerPrompt.includes('health') || lowerPrompt.includes('medical') || lowerPrompt.includes('doctor') || lowerPrompt.includes('clinic')) {
      contextualElements.push('modern medical facility', 'healthcare environment', 'clean clinical setting');
    }
    
    // Food/Restaurant
    if (lowerPrompt.includes('food') || lowerPrompt.includes('restaurant') || lowerPrompt.includes('cafe') || lowerPrompt.includes('dining')) {
      contextualElements.push('gourmet cuisine', 'elegant dining', 'modern restaurant interior', 'culinary excellence');
    }
    
    // Education
    if (lowerPrompt.includes('education') || lowerPrompt.includes('school') || lowerPrompt.includes('learning') || lowerPrompt.includes('course')) {
      contextualElements.push('modern learning environment', 'educational setting', 'contemporary classroom');
    }
    
    // Default professional elements
    if (contextualElements.length === 0) {
      contextualElements.push('professional environment', 'modern workspace', 'business setting');
    }
    
    // Combine original prompt with contextual elements
    const basePrompt = originalPrompt.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const contextualPrompt = `${basePrompt}, ${contextualElements.join(', ')}, professional photography, high resolution, commercial quality, natural lighting, modern composition, clean aesthetic, premium quality, website ready`;
    
    return contextualPrompt;
  }

  // Generate high-quality contextual placeholder images
  private generatePlaceholderImage(prompt: string): string {
    // Enhanced keyword extraction and categorization
    const lowerPrompt = prompt.toLowerCase();
    let keywords = [];
    
    // Smart keyword selection based on context
    if (lowerPrompt.includes('business') || lowerPrompt.includes('corporate')) {
      keywords = ['business', 'professional', 'office'];
    } else if (lowerPrompt.includes('tech') || lowerPrompt.includes('saas') || lowerPrompt.includes('software')) {
      keywords = ['technology', 'innovation', 'digital'];
    } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
      keywords = ['shopping', 'retail', 'products'];
    } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('creative') || lowerPrompt.includes('design')) {
      keywords = ['creative', 'design', 'portfolio'];
    } else if (lowerPrompt.includes('health') || lowerPrompt.includes('medical')) {
      keywords = ['healthcare', 'medical', 'wellness'];
    } else if (lowerPrompt.includes('food') || lowerPrompt.includes('restaurant')) {
      keywords = ['food', 'restaurant', 'culinary'];
    } else if (lowerPrompt.includes('education') || lowerPrompt.includes('learning')) {
      keywords = ['education', 'learning', 'academic'];
    } else {
      // Extract meaningful words from prompt
      const words = prompt.toLowerCase().replace(/[^a-z\s]/g, '').split(' ').filter(word => 
        word.length > 3 && !['website', 'page', 'site', 'create', 'build', 'make', 'design'].includes(word)
      );
      keywords = words.slice(0, 3);
      if (keywords.length === 0) keywords = ['modern', 'professional', 'business'];
    }
    
    const keywordString = keywords.join(',');
    
    // Use high-resolution Unsplash with better parameters
    return `https://source.unsplash.com/1600x900/?${keywordString}&professional&modern`;
  }

  // Enhanced Smart Router: OpenRouter (primary) → Gemini → Groq (fallback)
  async generateCode(prompt: string): Promise<string> {
    const strategies = [
      { name: 'OpenRouter (Best Free Models)', fn: () => this.generateCodeWithOpenRouter(prompt) },
      { name: 'Gemini 2.0 Flash', fn: () => this.generateCodeWithGemini25Flash(prompt) },
      { name: 'Groq (Final Fallback)', fn: () => this.generateTextWithGroq(prompt) }
    ];

    const errors: string[] = [];
    
    for (const strategy of strategies) {
      try {
        console.log(`🔄 Trying ${strategy.name} for code generation...`);
        const result = await strategy.fn();
        console.log(`✅ ${strategy.name} succeeded!`);
        return result;
      } catch (error: any) {
        const errorMsg = `${strategy.name}: ${error.message}`;
        console.error(`❌ ${strategy.name} failed:`, error);
        errors.push(errorMsg);
        continue;
      }
    }
    
    const fullError = `All code generation strategies failed:\n${errors.join('\n')}`;
    console.error('❌ All strategies exhausted:', errors);
    throw new Error(fullError);
  }

  // Smart router: use Groq for text
  async generateText(prompt: string): Promise<string> {
    const errors: string[] = [];
    
    try {
      console.log('🔄 Trying Groq for text...');
      const result = await this.generateTextWithGroq(prompt);
      console.log('✅ Groq succeeded!');
      return result;
    } catch (error: any) {
      console.error('❌ Groq failed:', error);
      errors.push(`Groq: ${error.message}`);
      
      try {
        console.log('🔄 Trying OpenRouter for text...');
        const result = await this.generateCodeWithOpenRouter(prompt);
        console.log('✅ OpenRouter succeeded!');
        return result;
      } catch (error2: any) {
        console.error('❌ OpenRouter failed:', error2);
        errors.push(`OpenRouter: ${error2.message}`);
        
        try {
          console.log('🔄 Trying Google for text...');
          const result = await this.generateCodeWithGoogle(prompt);
          console.log('✅ Google succeeded!');
          return result;
        } catch (error3: any) {
          console.error('❌ Google failed:', error3);
          errors.push(`Google: ${error3.message}`);
          throw new Error(`All text generation strategies failed:\n${errors.join('\n')}`);
        }
      }
    }
  }

  // Fallback mechanism with automatic retries
  async generateWithFallback(prompt: string, retries = 2): Promise<string> {
    // Detect if this is a code generation prompt (look for HTML/CSS/JS keywords)
    const isCodePrompt = /html|css|javascript|jsx|tsx|component|website|app|code/i.test(prompt);
    
    for (let i = 0; i < retries; i++) {
      try {
        if (isCodePrompt) {
          return await this.generateCode(prompt);
        } else {
          return await this.generateText(prompt);
        }
      } catch (error) {
        console.error(`Attempt ${i + 1}/${retries} failed:`, error);
        if (i === retries - 1) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    throw new Error('All generation attempts failed');
  }

  // Enhanced Image generation with Freepik API and intelligent fallback
  async generateImage(prompt: string): Promise<string> {
    console.log('🖼️ Starting image generation for:', prompt);
    
    try {
      // Try Freepik API first
      const freepikImage = await this.generateImageWithFreepik(prompt);
      if (freepikImage && freepikImage.startsWith('data:image')) {
        console.log('✅ Successfully generated image with Freepik API');
        return freepikImage;
      }
    } catch (error) {
      console.warn('⚠️ Freepik API failed, using fallback:', error.message);
    }
    
    // Fallback to high-quality placeholder
    console.log('🔄 Using enhanced placeholder image');
    return this.generatePlaceholderImage(prompt);
  }

  // Enhanced Gemini 2.5 Flash enhancement for production-ready code
  async enhanceCodeWithGemini(code: string, userRequest: string): Promise<string> {
    try {
      console.log('🚀 Enhancing code with Gemini 2.5 Flash for production-grade quality...');
      
      if (!import.meta.env.VITE_GOOGLE_API_KEY) {
        console.warn('⚠️ Google API key missing, skipping Gemini enhancement');
        return code;
      }

      const enhancementPrompt = `You are an expert web developer tasked with enhancing this website code to make it production-ready, professional, and SEO-optimized.

ORIGINAL USER REQUEST: "${userRequest}"

CURRENT CODE:
\`\`\`html
${code}
\`\`\`

YOUR TASK:
Enhance this code to be PRODUCTION-GRADE and DEPLOYMENT-READY with the following improvements:

1. **SEO OPTIMIZATION** (CRITICAL):
   - Add comprehensive meta tags (description, keywords, author, viewport)
   - Add Open Graph tags for social media (og:title, og:description, og:image, og:url)
   - Add Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
   - Add structured data (JSON-LD) for rich snippets
   - Ensure all images have descriptive alt text
   - Add proper heading hierarchy (h1, h2, h3)
   - Add canonical URL
   - Add robots meta tag
   - Optimize title tag (50-60 characters, keyword-rich)
   - Add meta description (150-160 characters, compelling)

2. **PERFORMANCE OPTIMIZATION**:
   - Add loading="lazy" to all images below the fold
   - Add fetchpriority="high" to hero images
   - Optimize CSS (remove unused styles, minify inline styles)
   - Add preconnect hints for external resources
   - Ensure efficient animations (use transform and opacity)
   - Add will-change hints for animated elements

3. **ACCESSIBILITY (WCAG 2.1 AA)**:
   - Ensure all interactive elements have proper ARIA labels
   - Add role attributes where needed
   - Ensure proper color contrast (4.5:1 for text)
   - Add skip navigation links
   - Ensure keyboard navigation works perfectly
   - Add aria-live regions for dynamic content
   - Ensure form labels are properly associated

4. **PROFESSIONAL POLISH**:
   - Add smooth scroll behavior
   - Add focus-visible styles for keyboard navigation
   - Improve error handling in forms
   - Add loading states for async operations
   - Add success/error toast notifications
   - Ensure all links open in appropriate targets
   - Add print styles

5. **SECURITY & BEST PRACTICES**:
   - Add Content Security Policy meta tag
   - Ensure external links have rel="noopener noreferrer"
   - Add proper form validation
   - Sanitize any user inputs
   - Add HTTPS-only references

6. **MOBILE OPTIMIZATION**:
   - Ensure touch targets are at least 48x48px
   - Add touch-friendly interactions
   - Optimize for mobile performance
   - Add mobile-specific meta tags
   - Ensure responsive images

7. **ANALYTICS & TRACKING READY**:
   - Add placeholder comments for Google Analytics
   - Add placeholder for Google Tag Manager
   - Add event tracking comments for key interactions

8. **ADDITIONAL ENHANCEMENTS**:
   - Add favicon link (with placeholder)
   - Add manifest.json link for PWA
   - Add theme-color meta tag
   - Improve typography (better line-height, letter-spacing)
   - Add smooth transitions between theme changes
   - Enhance hover effects and micro-interactions
   - Add more professional animations

IMPORTANT RULES:
- Return ONLY the complete, enhanced HTML code
- Keep ALL existing functionality and features
- Make it MORE dynamic and interactive, not less
- Ensure the code is 800-1200+ lines (comprehensive)
- Keep all inline CSS and JavaScript (no external files)
- Maintain the futuristic, modern design aesthetic
- Add detailed code comments for maintainability
- Ensure the code is ready for immediate deployment

OUTPUT FORMAT:
Return ONLY the complete HTML code, starting with <!DOCTYPE html> and ending with </html>. No explanations, no markdown fences, just the pure HTML code.`;

      const model = this.googleAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',  // Using Gemini 2.5 Flash equivalent
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.2,  // Lower temperature for more consistent enhancement
          topP: 0.8,
          topK: 40
        }
      });
      
      const result = await model.generateContent(enhancementPrompt);
      const enhancedCode = result.response.text();
      
      // Clean up the response
      let cleanedCode = enhancedCode.trim();
      
      // Remove markdown fences if present
      cleanedCode = cleanedCode.replace(/```html\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '').trim();
      
      // Ensure it starts with DOCTYPE
      if (!cleanedCode.startsWith('<!DOCTYPE')) {
        const doctypeMatch = cleanedCode.match(/<!DOCTYPE[\s\S]*?>/i);
        if (doctypeMatch) {
          cleanedCode = cleanedCode.substring(cleanedCode.indexOf('<!DOCTYPE'));
        } else {
          console.warn('⚠️ Enhanced code missing DOCTYPE, using original');
          return code;
        }
      }
      
      // Validate enhanced code is longer and more comprehensive
      if (cleanedCode.length < code.length * 0.8) {
        console.warn('⚠️ Enhanced code seems truncated, using original');
        return code;
      }
      
      console.log('✅ Gemini enhancement complete!');
      console.log(`📊 Code size: ${code.length} → ${cleanedCode.length} characters`);
      
      return cleanedCode;
      
    } catch (error: any) {
      console.error('❌ Gemini enhancement failed:', {
        message: error.message,
        status: error.status,
        details: error.details || error
      });
      console.warn('⚠️ Falling back to original code');
      return code;
    }
  }
}

export const aiService = new AIService();