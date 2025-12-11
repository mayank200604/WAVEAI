import { AdvancedWebElementsService } from './advancedWebElements';
import { aiService } from './ai';
import { PremiumTemplates } from './premiumTemplates';
import { ContentGenerator } from './contentGenerator';
import { SmartTemplateGenerator } from './smartTemplateGenerator';

export class CodeGeneratorFixed {
  /**
   * Generate premium website with fallback to templates
   */
  static async generateRobustCode(
    userRequest: string,
    stylePreferences: any = {},
    websiteType: string = 'business',
    companyName: string = 'Premium Company',
    maxRetries: number = 3,
    existingFiles?: { html: string; css: string; js: string }
  ): Promise<{ html: string; css: string; js: string }> {
    console.log('🎨 Using smart AI-powered template generation...');
    
    // Check if this is a follow-up request to modify existing website
    if (existingFiles && this.isModificationRequest(userRequest)) {
      console.log('🔄 Processing modification request...');
      return this.modifyExistingWebsite(userRequest, existingFiles, companyName);
    }
    
    // Generate completely unique website using AI
    try {
      console.log('🚀 Generating unique template with SmartTemplateGenerator...');
      return await SmartTemplateGenerator.generateUniqueTemplate(userRequest, companyName);
    } catch (error) {
      console.warn('⚠️ Smart template generation failed, falling back to premium templates:', error);
      return this.generatePremiumTemplate(userRequest, companyName);
    }
  }

  static buildPremiumPrompt(userRequest: string, stylePreferences: any = {}): string {
    return `You are a WORLD-CLASS web developer creating STUNNING, premium websites. Generate a COMPLETE HTML5 website that looks like it cost $100,000+ to develop.

USER REQUEST: ${userRequest}

🚨 CRITICAL REQUIREMENTS:

1. **MANDATORY STRUCTURE**:
   - Complete HTML5 document with DOCTYPE, head, meta tags
   - Fixed header with navigation and logo
   - Hero section with full viewport height
   - 2-3 content sections with premium styling
   - Comprehensive footer with multiple columns

2. **PREMIUM STYLING REQUIREMENTS**:
   - Use gradient backgrounds and glassmorphism effects
   - Apply backdrop-filter: blur(20px) for glass effects
   - Include hover animations with transform and scale
   - Use premium shadows: 0 8px 32px rgba(31, 38, 135, 0.37)
   - Apply SF Pro Display font family
   - Use CSS custom properties for consistency

3. **MANDATORY FILE FORMAT**:
   Generate EXACTLY this structure:

===== FILE: index.html =====
[Complete HTML with inline CSS and JS]

===== FILE: styles.css =====
[Premium CSS with gradients, animations, glassmorphism]

===== FILE: script.js =====
[Interactive JavaScript with smooth scrolling, animations]

4. **CONTENT REQUIREMENTS**:
   - NO Lorem ipsum - use realistic, professional content
   - Generate authentic company names, services, testimonials
   - Use industry-specific terminology
   - Create compelling headlines and descriptions

🚨 MAKE IT STUNNING - NO BASIC OR BORING DESIGNS!`;
  }

  static async generatePremiumTemplate(userRequest: string, companyName: string): Promise<{ html: string; css: string; js: string }> {
    console.log('🎨 Generating premium template with SEO content...');
    
    // Extract company name from request if possible
    const nameMatch = userRequest.match(/(?:for|called|named)\s+([A-Z][a-zA-Z\s]+)/i);
    if (nameMatch) {
      companyName = nameMatch[1].trim();
    }
    
    // Determine template type and description
    let templateType = 'saas';
    let description = 'Premium digital solutions for modern businesses';
    
    const request = userRequest.toLowerCase();
    if (request.includes('restaurant') || request.includes('food') || request.includes('dining')) {
      templateType = 'restaurant';
      description = 'Exceptional dining experience with world-class cuisine';
    } else if (request.includes('portfolio') || request.includes('designer') || request.includes('creative')) {
      templateType = 'portfolio';
      description = 'Creative professional showcasing innovative design solutions';
    } else if (request.includes('saas') || request.includes('software') || request.includes('platform')) {
      templateType = 'saas';
      description = 'Revolutionary SaaS platform that transforms how businesses operate';
    }
    
    // Generate SEO content using Groq
    console.log('🚀 Generating SEO content with Groq...');
    const seoContent = await ContentGenerator.generateSEOContent(companyName, templateType, description);
    
    // Add user request to content for dynamic template generation
    (seoContent as any).userRequest = userRequest;
    
    return PremiumTemplates.getTemplateWithContent(templateType, companyName, seoContent);
  }

  static extractMultiFileFromResponse(response: string): { html: string; css: string; js: string } {
    console.log('🔍 Extracting multi-file structure...');
    
    const htmlMatch = response.match(/===== FILE: index\.html =====\s*([\s\S]*?)(?===== FILE:|$)/);
    const cssMatch = response.match(/===== FILE: styles\.css =====\s*([\s\S]*?)(?===== FILE:|$)/);
    const jsMatch = response.match(/===== FILE: script\.js =====\s*([\s\S]*?)(?===== FILE:|$)/);
    
    if (htmlMatch) {
      return {
        html: htmlMatch[1].trim(),
        css: cssMatch ? cssMatch[1].trim() : '',
        js: jsMatch ? jsMatch[1].trim() : ''
      };
    }
    
    // Fallback: treat entire response as HTML
    return {
      html: response,
      css: '',
      js: ''
    };
  }

  static combineFilesForPreview(files: { html: string; css: string; js: string }): string {
    let html = files.html;
    
    // Inject CSS
    if (files.css) {
      const cssTag = `<style>${files.css}</style>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${cssTag}\n</head>`);
      } else {
        html = `<style>${files.css}</style>\n${html}`;
      }
    }
    
    // Inject JS
    if (files.js) {
      const jsTag = `<script>${files.js}</script>`;
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${jsTag}\n</body>`);
      } else {
        html = `${html}\n<script>${files.js}</script>`;
      }
    }
    
    return html;
  }

  static isModificationRequest(userRequest: string): boolean {
    const modificationKeywords = [
      // Direct modification words
      'add', 'remove', 'change', 'modify', 'update', 'edit', 'include', 'delete', 'replace',
      'insert', 'append', 'prepend', 'swap', 'switch', 'toggle', 'adjust', 'tweak',
      
      // Request patterns
      'make it', 'can you', 'please', 'also add', 'i want', 'i need', 'could you',
      'would you', 'how about', 'what if', 'instead of', 'rather than',
      
      // Style modifications
      'color', 'font', 'background', 'style', 'theme', 'design', 'layout',
      'size', 'width', 'height', 'margin', 'padding', 'border',
      
      // Content modifications
      'section', 'feature', 'page', 'content', 'text', 'image', 'button',
      'menu', 'navigation', 'header', 'footer', 'sidebar',
      
      // Functional modifications
      'form', 'contact', 'gallery', 'testimonial', 'pricing', 'about',
      'service', 'product', 'team', 'blog', 'news', 'faq'
    ];
    
    const request = userRequest.toLowerCase();
    
    // Check for modification keywords
    const hasModificationKeyword = modificationKeywords.some(keyword => request.includes(keyword));
    
    // Check for follow-up patterns (short requests often indicate modifications)
    const isShortFollowUp = request.length < 50 && (
      request.includes('more') || 
      request.includes('different') || 
      request.includes('better') ||
      request.includes('another')
    );
    
    // Check for comparative language (indicates modification)
    const hasComparativeLanguage = request.includes('instead') || 
                                   request.includes('rather') || 
                                   request.includes('but') ||
                                   request.includes('however');
    
    return hasModificationKeyword || isShortFollowUp || hasComparativeLanguage;
  }

  static async modifyExistingWebsite(
    userRequest: string, 
    existingFiles: { html: string; css: string; js: string },
    companyName: string
  ): Promise<{ html: string; css: string; js: string }> {
    console.log('🔄 Intelligently modifying existing website based on request...');
    
    try {
      // Use AI to intelligently modify the existing code
      const modificationPrompt = this.buildModificationPrompt(userRequest, existingFiles, companyName);
      
      // Try to get AI modification first
      const aiResponse = await aiService.generateCode(modificationPrompt, 'modification');
      
      if (aiResponse) {
        const modifiedFiles = this.extractMultiFileFromResponse(aiResponse);
        
        // Validate that we got meaningful modifications
        if (modifiedFiles.html && modifiedFiles.html.length > 1000) {
          console.log('✅ AI successfully modified the existing website');
          return modifiedFiles;
        }
      }
      
      console.log('⚠️ AI modification failed, using smart template approach...');
      
      // Fallback: Generate with context of existing website
      const contextualRequest = this.buildContextualRequest(userRequest, existingFiles, companyName);
      return this.generatePremiumTemplate(contextualRequest, companyName);
      
    } catch (error) {
      console.warn('⚠️ Modification failed, falling back to template generation:', error);
      const modifiedRequest = `Modify the existing website: ${userRequest}`;
      return this.generatePremiumTemplate(modifiedRequest, companyName);
    }
  }

  static buildModificationPrompt(userRequest: string, existingFiles: { html: string; css: string; js: string }, companyName: string): string {
    return `You are a WORLD-CLASS web developer making INTELLIGENT modifications to an existing premium website.

USER REQUEST: ${userRequest}
COMPANY NAME: ${companyName}

EXISTING WEBSITE CODE:
===== CURRENT HTML =====
${existingFiles.html.substring(0, 3000)}...

===== CURRENT CSS =====
${existingFiles.css.substring(0, 2000)}...

===== CURRENT JS =====
${existingFiles.js.substring(0, 1000)}...

🚨 CRITICAL REQUIREMENTS:

1. **INTELLIGENT MODIFICATION**:
   - Analyze the user's request carefully
   - Make TARGETED changes that address the specific request
   - Preserve the existing design language and branding
   - Maintain the premium quality and styling
   - Keep the existing structure unless specifically asked to change it

2. **PERSONALIZATION FOCUS**:
   - Make changes feel custom and personal to the user's request
   - Don't just add generic sections - make them contextual
   - Use the company name and existing content as context
   - Ensure new content flows naturally with existing content

3. **MODIFICATION TYPES**:
   - Adding sections: Integrate seamlessly with existing design
   - Changing colors: Update CSS variables and maintain consistency
   - Adding features: Use existing JavaScript patterns
   - Content changes: Keep the tone and style consistent
   - Layout changes: Preserve responsive design principles

4. **MANDATORY FILE FORMAT**:
   Generate EXACTLY this structure:

===== FILE: index.html =====
[Modified HTML with your changes integrated]

===== FILE: styles.css =====
[Modified CSS with your changes integrated]

===== FILE: script.js =====
[Modified JavaScript with your changes integrated]

5. **QUALITY STANDARDS**:
   - Maintain premium visual quality
   - Ensure all animations and interactions still work
   - Keep responsive design intact
   - Use realistic, professional content (NO Lorem Ipsum)
   - Make changes feel intentional and designed, not added as an afterthought

🚨 MAKE THE CHANGES FEEL PERSONAL AND CUSTOM-DESIGNED FOR THIS USER!`;
  }

  static buildContextualRequest(userRequest: string, existingFiles: { html: string; css: string; js: string }, companyName: string): string {
    // Extract key elements from existing website
    const hasHero = existingFiles.html.includes('hero') || existingFiles.html.includes('banner');
    const hasTestimonials = existingFiles.html.includes('testimonial') || existingFiles.html.includes('review');
    const hasServices = existingFiles.html.includes('service') || existingFiles.html.includes('feature');
    const hasContact = existingFiles.html.includes('contact') || existingFiles.html.includes('form');
    
    // Extract color scheme
    const colorMatch = existingFiles.css.match(/--primary-color:\s*([^;]+)/);
    const primaryColor = colorMatch ? colorMatch[1].trim() : 'cyan';
    
    return `Create a premium website for ${companyName} that incorporates this specific request: "${userRequest}".

CONTEXT FROM EXISTING WEBSITE:
- Company: ${companyName}
- Has hero section: ${hasHero}
- Has testimonials: ${hasTestimonials}
- Has services: ${hasServices}
- Has contact form: ${hasContact}
- Primary color scheme: ${primaryColor}

SPECIFIC REQUIREMENTS:
- Make the website feel personally designed for this request
- Incorporate the user's specific requirements naturally
- Use ${companyName} as the company name throughout
- Maintain premium quality and modern design
- Ensure the new elements feel integrated, not added on
- Make it feel custom-built, not template-based`;
  }
}
