import { aiService } from './ai';
import { ContentIntelligence } from './contentIntelligence';

interface TemplateVariation {
  layout: 'modern' | 'minimal' | 'creative' | 'corporate' | 'startup' | 'portfolio';
  colorScheme: 'black' | 'gold' | 'silver' | 'dark-purple' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'red' | 'indigo';
  style: 'glassmorphism' | 'neumorphism' | 'gradient' | 'flat' | 'material' | 'brutalist';
  animation: 'subtle' | 'dynamic' | 'playful' | 'professional' | 'minimal';
  typography: 'modern' | 'classic' | 'bold' | 'elegant' | 'tech' | 'creative';
}

export class SmartTemplateGenerator {
  private static usedCombinations: Set<string> = new Set();
  private static generationCount: number = 0;
  
  /**
   * Generate a completely unique template using AI and dynamic variations
   */
  static async generateUniqueTemplate(
    userRequest: string,
    companyName: string = 'Your Company'
  ): Promise<{ html: string; css: string; js: string }> {
    console.log('🎨 Generating unique template with AI...');
    
    // Get a unique variation combination with rotation
    this.generationCount++;
    let variation = this.getUniqueVariation();
    
    // Rotate color schemes to ensure variety - prioritize premium schemes
    const premiumSchemes: TemplateVariation['colorScheme'][] = ['black', 'gold', 'silver', 'dark-purple', 'blue', 'purple', 'green', 'indigo'];
    const rotatedScheme = premiumSchemes[this.generationCount % premiumSchemes.length];
    
    // Force rotation every generation to ensure variety
    // Use modulo to cycle through premium schemes
    variation.colorScheme = rotatedScheme;
    
    // Also rotate layout and style for maximum variety
    const layouts: TemplateVariation['layout'][] = ['modern', 'minimal', 'creative', 'corporate', 'startup', 'portfolio'];
    const styles: TemplateVariation['style'][] = ['glassmorphism', 'neumorphism', 'gradient', 'flat', 'material', 'brutalist'];
    
    variation.layout = layouts[(this.generationCount + Math.floor(this.generationCount / 3)) % layouts.length];
    variation.style = styles[(this.generationCount + Math.floor(this.generationCount / 2)) % styles.length];
    
    console.log(`🎨 Template rotation: ${variation.colorScheme} + ${variation.layout} + ${variation.style}`);
    
    // Create AI prompt for unique template generation
    const prompt = this.createSmartPrompt(userRequest, companyName, variation);
    
    try {
      // Use OpenRouter for the most creative and diverse results
      const generatedCode = await aiService.generateCodeWithOpenRouter(prompt);
      const cleanedCode = this.cleanGeneratedCode(generatedCode);
      
      // Parse the generated code into HTML, CSS, and JS
      const parsedCode = this.parseGeneratedCode(cleanedCode);
      
      // Enhance with dynamic elements
      const enhancedCode = this.addDynamicElements(parsedCode, variation);
      
      if (!this.isValidGeneratedCode(enhancedCode)) {
        console.warn('⚠️ Generated template did not meet premium quality standards. Falling back to premium template.');
        return await this.generatePremiumTemplate(userRequest, companyName);
      }
      
      console.log('✅ Unique template generated successfully!');
      return enhancedCode;
      
    } catch (error) {
      console.error('❌ AI generation failed, using fallback template:', error);
      return this.generateFallbackTemplate(userRequest, companyName, variation);
    }
  }
  
  /**
   * Get a unique variation that hasn't been used recently
   */
  private static getUniqueVariation(): TemplateVariation {
    const layouts: TemplateVariation['layout'][] = ['modern', 'minimal', 'creative', 'corporate', 'startup', 'portfolio'];
    // Premium color schemes including Black, Gold, Silver, Dark Purple
    const colorSchemes: TemplateVariation['colorScheme'][] = ['black', 'gold', 'silver', 'dark-purple', 'blue', 'purple', 'green', 'orange', 'pink', 'teal', 'red', 'indigo'];
    const styles: TemplateVariation['style'][] = ['glassmorphism', 'neumorphism', 'gradient', 'flat', 'material', 'brutalist'];
    const animations: TemplateVariation['animation'][] = ['subtle', 'dynamic', 'playful', 'professional', 'minimal'];
    const typographies: TemplateVariation['typography'][] = ['modern', 'classic', 'bold', 'elegant', 'tech', 'creative'];
    
    let variation: TemplateVariation;
    let combinationKey: string;
    let attempts = 0;
    
    do {
      variation = {
        layout: layouts[Math.floor(Math.random() * layouts.length)],
        colorScheme: colorSchemes[Math.floor(Math.random() * colorSchemes.length)],
        style: styles[Math.floor(Math.random() * styles.length)],
        animation: animations[Math.floor(Math.random() * animations.length)],
        typography: typographies[Math.floor(Math.random() * typographies.length)]
      };
      
      combinationKey = `${variation.layout}-${variation.colorScheme}-${variation.style}`;
      attempts++;
      
      // If we've tried too many times, clear the used combinations
      if (attempts > 50) {
        this.usedCombinations.clear();
        break;
      }
    } while (this.usedCombinations.has(combinationKey));
    
    this.usedCombinations.add(combinationKey);
    
    // Keep only the last 50 combinations to allow reuse after a while (increased for better rotation)
    if (this.usedCombinations.size > 50) {
      const firstKey = this.usedCombinations.values().next().value;
      this.usedCombinations.delete(firstKey);
    }
    
    // Ensure premium color schemes are prioritized
    const premiumSchemes: TemplateVariation['colorScheme'][] = ['black', 'gold', 'silver', 'dark-purple'];
    if (premiumSchemes.includes(variation.colorScheme)) {
      // Premium schemes get higher priority
      console.log('✨ Using premium color scheme:', variation.colorScheme);
    }
    
    console.log('🎯 Selected variation:', variation);
    return variation;
  }
  
  /**
   * Create a smart AI prompt that generates unique templates
   */
  private static createSmartPrompt(userRequest: string, companyName: string, variation: TemplateVariation): string {
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 10000);
    
    // Generate intelligent content based on business context
    const businessContext = ContentIntelligence.analyzeBusinessContext(userRequest, companyName);
    const intelligentContent = ContentIntelligence.generateIntelligentContent(businessContext, companyName);
    const seoMetaTags = ContentIntelligence.generateSEOMetaTags(businessContext, companyName);
    
    return `You are an elite web designer creating a COMPLETELY UNIQUE website. Never repeat the same design patterns.

INTELLIGENT CONTENT TO USE:
Company: ${companyName}
Industry: ${businessContext.industry}
Business Type: ${businessContext.businessType}
Target Audience: ${businessContext.targetAudience}

HEADLINES TO USE: ${intelligentContent.headlines.join(' | ')}
TAGLINES TO USE: ${intelligentContent.taglines.join(' | ')}
SERVICES: ${intelligentContent.serviceDescriptions.join(' | ')}
CTA TEXTS: ${intelligentContent.ctaTexts.join(' | ')}

TESTIMONIALS TO INCLUDE:
${intelligentContent.testimonials.map(t => `"${t.text}" - ${t.name}, ${t.role} at ${t.company} (${t.rating}/5 stars)`).join('\n')}

FEATURES TO HIGHLIGHT:
${intelligentContent.features.map(f => `${f.title}: ${f.description} - ${f.benefit}`).join('\n')}

ABOUT CONTENT: ${intelligentContent.aboutContent}

FAQ ITEMS:
${intelligentContent.faqItems.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

SEO META TAGS:
Title: ${seoMetaTags.title}
Description: ${seoMetaTags.description}
Keywords: ${seoMetaTags.keywords.join(', ')}

UNIQUE DESIGN REQUIREMENTS:
- Layout Style: ${variation.layout}
- Color Scheme: ${variation.colorScheme}
- Design Style: ${variation.style}
- Animation Level: ${variation.animation}
- Typography: ${variation.typography}
- Uniqueness Seed: ${randomSeed}
- Generation ID: ${timestamp}

USER REQUEST: "${userRequest}"
COMPANY NAME: "${companyName}"

CRITICAL UNIQUENESS RULES:
1. Create a NEVER-BEFORE-SEEN layout structure
2. Use UNIQUE section arrangements (not the typical hero-features-about pattern)
3. Implement CREATIVE navigation styles (sidebar, floating, morphing, etc.)
4. Design ORIGINAL color combinations within the ${variation.colorScheme} scheme
5. Add INNOVATIVE interactive elements and micro-animations
6. Create DISTINCTIVE typography hierarchies and spacing
7. Use UNCONVENTIONAL grid systems and content flow

LAYOUT VARIATIONS BY STYLE:
${this.getLayoutInstructions(variation.layout)}

COLOR SCHEME INSTRUCTIONS:
${this.getColorInstructions(variation.colorScheme)}

DESIGN STYLE INSTRUCTIONS:
${this.getStyleInstructions(variation.style)}

ANIMATION INSTRUCTIONS:
${this.getAnimationInstructions(variation.animation)}

TYPOGRAPHY INSTRUCTIONS:
${this.getTypographyInstructions(variation.typography)}

🚨 CRITICAL PREMIUM QUALITY REQUIREMENTS:
1. ABSOLUTELY NO BASIC OR PLAIN DESIGNS - Every element must look premium and expensive
2. Use PREMIUM color scheme: ${variation.colorScheme} with rich gradients, shadows, and depth
3. Create STUNNING visual hierarchy with perfect spacing (clamp(64px, 10vw, 120px) for sections)
4. Implement ADVANCED animations: smooth transitions, hover effects, scroll animations, parallax
5. Use GLASSMORPHISM extensively: backdrop-filter blur(20px), transparent backgrounds, subtle borders
6. Add PREMIUM shadows: multiple layers (0 8px 32px rgba(...), 0 2px 16px rgba(...))
7. Create LUXURY typography: perfect font weights, line heights, letter spacing
8. Include INTERACTIVE elements: buttons with hover lift effects, cards with 3D transforms
9. Use GRADIENT backgrounds: animated gradients that shift colors smoothly
10. Ensure PERFECT responsiveness: mobile-first, tablet-optimized, desktop-enhanced

MANDATORY UNIQUE ELEMENTS:
- Create 3-5 sections with UNEXPECTED names and purposes
- Design a UNIQUE hero section (not just centered text + button)
- Add CREATIVE call-to-action placements
- Implement ORIGINAL hover effects and transitions
- Use INNOVATIVE background patterns or textures
- Create DISTINCTIVE card designs and layouts
- Add UNIQUE loading animations and micro-interactions

🚨 CRITICAL CONTENT REQUIREMENTS - YOU MUST USE THE PROVIDED CONTENT:

MANDATORY: You MUST use the EXACT content provided above. DO NOT generate generic content or Lorem Ipsum.

REQUIRED CONTENT USAGE:
1. HEADLINES: Use one of these EXACT headlines: ${intelligentContent.headlines.join(' | ')}
2. TAGLINES: Use one of these EXACT taglines: ${intelligentContent.taglines.join(' | ')}
3. SERVICES: Use these EXACT service descriptions: ${intelligentContent.serviceDescriptions.join(' | ')}
4. TESTIMONIALS: Include ALL these testimonials with EXACT text:
${intelligentContent.testimonials.map(t => `   - "${t.text}" - ${t.name}, ${t.role} at ${t.company} (${t.rating}/5 stars)`).join('\n')}
5. FEATURES: Use these EXACT features:
${intelligentContent.features.map(f => `   - ${f.title}: ${f.description} - ${f.benefit}`).join('\n')}
6. ABOUT: Use this EXACT about content: ${intelligentContent.aboutContent}
7. FAQ: Include these EXACT FAQ items:
${intelligentContent.faqItems.map(faq => `   Q: ${faq.question}\n   A: ${faq.answer}`).join('\n\n')}
8. CTA TEXTS: Use these EXACT CTA texts: ${intelligentContent.ctaTexts.join(' | ')}

PREMIUM CONTENT GENERATION RULES:
- ABSOLUTELY NO Lorem Ipsum or placeholder text
- Use ONLY the provided intelligent content above
- Generate REALISTIC, industry-specific content that matches the business type
- Create COMPELLING headlines using the provided options
- Write PROFESSIONAL copy that sounds authentic and trustworthy
- Include ALL provided testimonials with exact names and companies
- Use ALL provided features with their exact descriptions and benefits
- Include the EXACT about content provided
- Add ALL FAQ items with exact questions and answers
- Use the EXACT CTA texts provided
- Generate SMART contact information with realistic addresses and phone numbers
- Add REALISTIC pricing tiers with clear value differentiation
- Include SOCIAL PROOF elements like client logos, awards, certifications
- Add TRUST SIGNALS like security badges, guarantees, and testimonials
- Create BENEFIT-FOCUSED feature descriptions (not just feature lists)
- Include EMOTIONAL STORYTELLING elements that connect with visitors

SEO OPTIMIZATION REQUIREMENTS:
- Add comprehensive meta tags (title 50-60 chars, description 150-160 chars, keywords)
- Include Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- Add Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- Include structured data (JSON-LD) for Organization, LocalBusiness, or WebSite schema
- Use semantic HTML5 elements (header, nav, main, section, article, aside, footer)
- Implement proper heading hierarchy (single H1, multiple H2s, H3s for subsections)
- Add descriptive alt text for all images with target keywords
- Include internal linking structure with descriptive anchor text
- Add schema markup for reviews, ratings, and testimonials
- Optimize page loading with lazy loading attributes (loading="lazy")
- Include canonical URL and robots meta tags
- Add hreflang attributes for international SEO (if applicable)
- Include breadcrumb navigation with schema markup
- Optimize images with proper file names and compression
- Add FAQ schema markup for common questions
- Include local business schema with address, phone, hours (if applicable)
- Add product/service schema markup with pricing and availability
- Include social media profile links with proper rel attributes

TECHNICAL REQUIREMENTS:
- Complete HTML5 document with all meta tags and SEO optimization
- Inline CSS with PREMIUM styling (minimum 1500+ lines of advanced CSS)
- Inline JavaScript for smooth interactions (minimum 500+ lines)
- Mobile-responsive design (mobile-first, perfect on 320px to 4K screens)
- Dark/light mode toggle with system preference detection
- Smooth animations and transitions (60fps performance, use transform and opacity)
- PREMIUM color palette: ${variation.colorScheme} with gradients, shadows, and depth
- Modern typography: SF Pro Display, Inter, or similar premium fonts
- Full accessibility features (ARIA labels, keyboard navigation, WCAG 2.1 AA)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Performance optimization (lazy loading, optimized animations)
- Glassmorphism effects throughout (backdrop-filter blur, transparent backgrounds)
- Premium button styles (gradient backgrounds, hover lift effects, shadows)
- Advanced card designs (3D transforms, glassmorphism, hover animations)
- Smooth scroll animations (Intersection Observer, fade-in effects)
- Interactive hover states on ALL clickable elements

OUTPUT FORMAT:
Return a complete HTML document starting with <!DOCTYPE html> and ending with </html>. 
Include ALL CSS in <style> tags and ALL JavaScript in <script> tags.
Make it production-ready and visually stunning.

🚨 FINAL REMINDER - CONTENT USAGE:
- You MUST use the EXACT headlines, taglines, services, testimonials, features, about content, FAQ items, and CTA texts provided above
- DO NOT create your own content - use the intelligent content that was generated for this specific business
- Every section MUST include the provided content, not generic placeholders
- The website MUST look premium and professional with the exact content provided

INSPIRATION SOURCES (but make it UNIQUE):
- Award-winning agency websites
- Modern SaaS platforms
- Creative portfolio sites
- Innovative startup pages
- Premium design systems

Remember: This must be COMPLETELY DIFFERENT from any previous generation. Be creative, bold, and innovative!`;
  }
  
  private static getLayoutInstructions(layout: TemplateVariation['layout']): string {
    const instructions = {
      modern: 'Use asymmetrical grids, floating elements, and dynamic spacing. Implement split-screen layouts and overlapping sections.',
      minimal: 'Focus on whitespace, clean lines, and subtle interactions. Use monochromatic colors with single accent color.',
      creative: 'Break conventional layouts. Use diagonal sections, curved elements, and artistic compositions. Be experimental.',
      corporate: 'Professional structure with sophisticated interactions. Use premium materials and executive-level design.',
      startup: 'Energetic and growth-focused. Use bold gradients, dynamic animations, and modern tech aesthetics.',
      portfolio: 'Showcase-focused with creative presentations. Use masonry layouts, hover reveals, and artistic transitions.'
    };
    return instructions[layout];
  }
  
  private static getColorInstructions(colorScheme: TemplateVariation['colorScheme']): string {
    const schemes = {
      'black': 'Use deep blacks (#000000, #0a0a0a) with gold accents (#FFD700, #FFA500). Create luxury contrast with pure white text. Add subtle gold gradients and shimmer effects.',
      'gold': 'Use rich golds (#FFD700, #FFA500) on dark backgrounds (#1a1a1a). Create premium luxury feel with gold gradients, metallic effects, and warm amber highlights.',
      'silver': 'Use elegant silvers (#C0C0C0, #A8A8A8) on dark backgrounds. Create sophisticated metallic effects with silver gradients and platinum accents.',
      'dark-purple': 'Use deep purples (#6B46C1, #5B21B6) with violet accents (#8B5CF6). Create mysterious, premium feel with rich purple gradients and lavender highlights.',
      blue: 'Use deep ocean blues (#0F172A) to bright cyans (#06B6D4). Add electric blue accents (#3B82F6).',
      purple: 'Rich purples (#581C87) to bright magentas (#D946EF). Include violet gradients (#8B5CF6).',
      green: 'Forest greens (#064E3B) to bright emeralds (#10B981). Add lime accents (#84CC16).',
      orange: 'Deep oranges (#C2410C) to bright corals (#FB7185). Include amber highlights (#F59E0B).',
      pink: 'Rose golds (#BE185D) to bright pinks (#EC4899). Add fuchsia accents (#E879F9).',
      teal: 'Deep teals (#0F766E) to bright aquas (#06B6D4). Include turquoise highlights (#14B8A6).',
      red: 'Deep crimsons (#B91C1C) to bright roses (#F43F5E). Add scarlet accents (#EF4444).',
      indigo: 'Deep indigos (#3730A3) to bright purples (#8B5CF6). Add lavender highlights (#A78BFA).'
    };
    return schemes[colorScheme] || schemes['black'];
  }
  
  private static getStyleInstructions(style: TemplateVariation['style']): string {
    const styles = {
      glassmorphism: 'Use backdrop-blur effects, transparent backgrounds, and subtle borders. Create floating glass panels.',
      neumorphism: 'Soft shadows and highlights. Create elements that appear to extrude from the background.',
      gradient: 'Bold gradient backgrounds, gradient text, and gradient borders. Use multiple color stops.',
      flat: 'Clean, flat design with solid colors and minimal shadows. Focus on typography and layout.',
      material: 'Google Material Design principles with elevation, shadows, and motion.',
      brutalist: 'Bold, raw design with strong contrasts, unconventional layouts, and experimental typography.'
    };
    return styles[style];
  }
  
  private static getAnimationInstructions(animation: TemplateVariation['animation']): string {
    const animations = {
      subtle: 'Gentle hover effects, smooth transitions, and minimal motion. Focus on elegance.',
      dynamic: 'Bold animations, parallax scrolling, and interactive elements. Create engaging experiences.',
      playful: 'Fun animations, bouncy effects, and delightful micro-interactions. Add personality.',
      professional: 'Smooth, purposeful animations that enhance usability without distraction.',
      minimal: 'Very subtle animations, focus on content with minimal motion effects.'
    };
    return animations[animation];
  }
  
  private static getTypographyInstructions(typography: TemplateVariation['typography']): string {
    const typographies = {
      modern: 'Use Inter, Poppins, or similar modern sans-serif fonts. Clean, readable, and contemporary.',
      classic: 'Elegant serif fonts like Playfair Display or Crimson Text. Sophisticated and timeless.',
      bold: 'Strong, impactful fonts like Montserrat Black or Oswald. Make statements with typography.',
      elegant: 'Refined fonts like Cormorant Garamond or Source Serif Pro. Luxurious and sophisticated.',
      tech: 'Monospace or tech-inspired fonts like JetBrains Mono or Space Grotesk. Modern and technical.',
      creative: 'Unique, artistic fonts that match the creative theme. Experimental and expressive.'
    };
    return typographies[typography];
  }
  
  /**
   * Remove markdown wrappers and trim extraneous content
   */
  private static cleanGeneratedCode(code: string): string {
    if (!code) return '';
    
    let cleaned = code.trim();
    
    // Remove common markdown fences
    cleaned = cleaned.replace(/```(html|css|javascript|js)?/gi, '');
    cleaned = cleaned.replace(/```/g, '');
    
    // Remove leading explanations before DOCTYPE
    const doctypeIndex = cleaned.toLowerCase().indexOf('<!doctype');
    if (doctypeIndex > -1) {
      cleaned = cleaned.substring(doctypeIndex);
    }
    
    return cleaned.trim();
  }
  
  /**
   * Parse generated code into separate HTML, CSS, and JS
   */
  private static parseGeneratedCode(code: string): { html: string; css: string; js: string } {
    if (!code) {
      return { html: '', css: '', js: '' };
    }
    
    // Handle explicit multi-file responses
    if (code.includes('===== FILE: index.html')) {
      const htmlMatch = code.match(/===== FILE: index\.html =====\s*([\s\S]*?)(?===== FILE:|$)/);
      const cssMatch = code.match(/===== FILE: styles\.css =====\s*([\s\S]*?)(?===== FILE:|$)/);
      const jsMatch = code.match(/===== FILE: script\.js =====\s*([\s\S]*?)(?===== FILE:|$)/);
      
      if (htmlMatch) {
        return {
          html: htmlMatch[1].trim(),
          css: cssMatch ? cssMatch[1].trim() : '',
          js: jsMatch ? jsMatch[1].trim() : ''
        };
      }
    }
    
    let workingCode = code;
    
    // Extract CSS
    const cssMatch = workingCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const css = cssMatch ? cssMatch[1].trim() : '';
    
    // Extract JavaScript
    const jsMatch = workingCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const js = jsMatch ? jsMatch[1].trim() : '';
    
    // Remove extracted blocks from HTML
    if (cssMatch) workingCode = workingCode.replace(cssMatch[0], '');
    if (jsMatch) workingCode = workingCode.replace(jsMatch[0], '');
    
    return { html: workingCode.trim(), css, js };
  }
  
  /**
   * Validate that the generated code looks like a real premium website
   */
  private static isValidGeneratedCode(code: { html: string; css: string; js: string }): boolean {
    const html = (code.html || '').toLowerCase();
    const css = (code.css || '').trim();
    
    if (!html.includes('<html') || !html.includes('<body') || !html.includes('</html>')) {
      return false;
    }
    
    // Reject markdown-style or descriptive responses
    const disallowedPhrases = ['**layout structure**', 'unique section arrangements', '##', '**layout structure**', 'the website will'];
    if (disallowedPhrases.some(phrase => html.includes(phrase))) {
      return false;
    }
    
    if (html.length < 800) {
      return false;
    }
    
    if (css.length < 200) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Add dynamic elements to enhance the template
   */
  private static addDynamicElements(
    code: { html: string; css: string; js: string },
    variation: TemplateVariation
  ): { html: string; css: string; js: string } {
    // Add dynamic CSS variables based on variation
    const dynamicCSS = this.generateDynamicCSS(variation);
    
    // Add interactive JavaScript
    const dynamicJS = this.generateDynamicJS(variation);
    
    return {
      html: code.html,
      css: dynamicCSS + '\n\n' + code.css,
      js: code.js + '\n\n' + dynamicJS
    };
  }
  
  private static generateDynamicCSS(variation: TemplateVariation): string {
    const industryLabel = (businessContext.industry || 'innovation').replace(/-/g, ' ');
    const colors = this.getColorPalette(variation.colorScheme);
    
    return `
/* Dynamic CSS Variables - Generated ${new Date().toISOString()} */
:root {
  --primary-color: ${colors.primary};
  --secondary-color: ${colors.secondary};
  --accent-color: ${colors.accent};
  --background-color: ${colors.background};
  --text-color: ${colors.text};
  --variation-id: "${variation.layout}-${variation.colorScheme}-${variation.style}";
}

/* Dynamic Animation Keyframes */
@keyframes uniqueFloat-${Date.now()} {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(${Math.random() * 10 - 5}deg); }
}

@keyframes uniquePulse-${Date.now()} {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* Unique Gradient Background */
.unique-gradient-bg {
  background: linear-gradient(
    ${Math.random() * 360}deg,
    ${colors.primary}20,
    ${colors.secondary}20,
    ${colors.accent}20
  );
}`;
  }
  
  private static generateDynamicJS(variation: TemplateVariation): string {
    return `
// Dynamic JavaScript - Generated ${new Date().toISOString()}
(function() {
  'use strict';
  
  // Unique interaction ID
  const interactionId = 'interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}';
  
  // Add unique hover effects
  document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.card, .button, .nav-item');
    elements.forEach((el, index) => {
      el.style.setProperty('--hover-delay', (index * 0.1) + 's');
      
      el.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-${Math.random() * 10 + 5}px) scale(1.02)';
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      });
      
      el.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
    
    // Add unique scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = (Math.random() * 0.5) + 's';
          entry.target.classList.add('animate-in');
        }
      });
    });
    
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
  });
  
  console.log('🎨 Unique template loaded with variation: ${variation.layout}-${variation.colorScheme}-${variation.style}');
})();`;
  }
  
  private static getColorPalette(colorScheme: TemplateVariation['colorScheme']): {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  } {
    const palettes = {
      'black': {
        primary: '#000000',
        secondary: '#1a1a1a',
        accent: '#FFD700',
        background: '#0a0a0a',
        text: '#FFFFFF'
      },
      'gold': {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FFC107',
        background: '#1a1a1a',
        text: '#FFFFFF'
      },
      'silver': {
        primary: '#C0C0C0',
        secondary: '#A8A8A8',
        accent: '#E8E8E8',
        background: '#1a1a1a',
        text: '#FFFFFF'
      },
      'dark-purple': {
        primary: '#6B46C1',
        secondary: '#5B21B6',
        accent: '#8B5CF6',
        background: '#1e1b4b',
        text: '#F3F4F6'
      },
      blue: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#06B6D4',
        background: '#0F172A',
        text: '#F8FAFC'
      },
      purple: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#D946EF',
        background: '#1E1B4B',
        text: '#F3F4F6'
      },
      green: {
        primary: '#10B981',
        secondary: '#059669',
        accent: '#84CC16',
        background: '#064E3B',
        text: '#F0FDF4'
      },
      orange: {
        primary: '#F59E0B',
        secondary: '#D97706',
        accent: '#FB7185',
        background: '#7C2D12',
        text: '#FEF3C7'
      },
      pink: {
        primary: '#EC4899',
        secondary: '#DB2777',
        accent: '#E879F9',
        background: '#831843',
        text: '#FDF2F8'
      },
      teal: {
        primary: '#14B8A6',
        secondary: '#0D9488',
        accent: '#06B6D4',
        background: '#0F766E',
        text: '#F0FDFA'
      },
      red: {
        primary: '#EF4444',
        secondary: '#DC2626',
        accent: '#F43F5E',
        background: '#7F1D1D',
        text: '#FEF2F2'
      },
      indigo: {
        primary: '#6366F1',
        secondary: '#4F46E5',
        accent: '#A78BFA',
        background: '#312E81',
        text: '#EEF2FF'
      }
    };
    
    return palettes[colorScheme] || palettes['black'];
  }
  
  /**
   * Generate a fallback template if AI generation fails
   */
  private static generateFallbackTemplate(
    userRequest: string,
    companyName: string,
    variation: TemplateVariation
  ): { html: string; css: string; js: string } {
    const businessContext = ContentIntelligence.analyzeBusinessContext(userRequest, companyName);
    const intelligentContent = ContentIntelligence.generateIntelligentContent(businessContext, companyName);
    const seoMetaTags = ContentIntelligence.generateSEOMetaTags(businessContext, companyName);
    
    const heroHeadline = intelligentContent.headlines[0] || `${companyName}`;
    const heroTagline = intelligentContent.taglines[0] || 'Premium solutions engineered for visionary teams.';
    const primaryCTA = intelligentContent.ctaTexts[0] || 'Start Your Transformation';
    const secondaryCTA = intelligentContent.ctaTexts[1] || 'Book a Strategy Call';
    const supportingCTA = intelligentContent.ctaTexts[2] || 'Talk with an Expert';
    
    const servicesList = intelligentContent.serviceDescriptions.slice(0, 4);
    const featureHighlights = intelligentContent.features.slice(0, 3);
    const testimonials = intelligentContent.testimonials.slice(0, 3);
    const faqItems = intelligentContent.faqItems.slice(0, 4);
    
    const metaTitle = (seoMetaTags.title || `${companyName} | Premium Digital Experiences`).replace(/"/g, '&quot;');
    const rawDescription = seoMetaTags.description || 'Premium digital experiences crafted for high-growth teams.';
    const metaDescription = rawDescription.replace(/"/g, '&quot;');
    const metaKeywords = seoMetaTags.keywords.join(', ');
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': businessContext.industry === 'food-service' ? 'Restaurant' :
               businessContext.industry === 'healthcare' ? 'MedicalOrganization' :
               businessContext.industry === 'real-estate' ? 'RealEstateAgent' :
               businessContext.industry === 'education' ? 'EducationalOrganization' :
               businessContext.industry === 'fitness' ? 'SportsActivityLocation' : 'Organization',
      name: companyName,
      description: rawDescription,
      url: 'https://www.example.com',
      logo: 'https://www.example.com/logo.png',
      sameAs: [
        'https://www.linkedin.com',
        'https://www.twitter.com',
        'https://www.facebook.com'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-415-555-0102',
        contactType: 'customer support',
        areaServed: 'US',
        availableLanguage: ['English']
      }
    };
    
    const colors = this.getColorPalette(variation.colorScheme);
    const uniqueId = Date.now();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metaTitle}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${metaKeywords}">
    <meta name="author" content="${companyName}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="${colors.primary}">
    <meta property="og:title" content="${metaTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.example.com">
    <meta property="og:image" content="https://www.example.com/og-image.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metaTitle}">
    <meta name="twitter:description" content="${metaDescription}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="icon" type="image/png" href="https://www.example.com/favicon.png">
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body class="unique-template-${uniqueId}">
    <header class="header-${variation.layout}">
        <nav class="nav-${variation.style}">
            <div class="logo">${companyName}</div>
            <div class="nav-links">
                <a href="#home">Home</a>
                <a href="#services">Services</a>
                <a href="#features">Solutions</a>
                <a href="#testimonials">Stories</a>
                <a href="#contact">Contact</a>
            </div>
        </nav>
    </header>
    
    <main class="main-${variation.colorScheme}">
        <section id="home" class="hero-${variation.animation}">
            <div class="hero-content">
                <span class="hero-badge">Premium ${industryLabel} Solutions</span>
                <h1 class="hero-title-${variation.typography}">${heroHeadline}</h1>
                <p class="hero-subtitle">${heroTagline}</p>
                <div class="hero-buttons">
                    <button class="cta-button-${variation.style} primary-cta">${primaryCTA}</button>
                    <button class="cta-secondary-button">${secondaryCTA}</button>
                </div>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>98%</h3>
                        <p>Client satisfaction across ${businessContext.targetAudience || 'global teams'}</p>
                    </div>
                    <div class="metric-card">
                        <h3>24/7</h3>
                        <p>Dedicated support with proactive monitoring</p>
                    </div>
                    <div class="metric-card">
                        <h3>4.9/5</h3>
                        <p>Average rating from verified partners</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="services" class="section services-section">
            <h2 class="section-heading">Signature Services</h2>
            <p class="section-subtitle">Designed for ${businessContext.targetAudience || 'modern leaders'} who demand measurable impact.</p>
            <div class="services-grid">
                ${servicesList.map((service, index) => `
                <article class="service-card">
                    <span class="service-index">0${index + 1}</span>
                    <h3>${service.split(' - ')[0]}</h3>
                    <p>${service.split(' - ')[1] || service}</p>
                    <button class="service-link">Explore capability</button>
                </article>`).join('')}
            </div>
        </section>

        <section id="features" class="section features-section">
            <div class="section-header">
                <h2 class="section-heading">Flagship Capabilities</h2>
                <p class="section-subtitle">Every engagement is engineered around performance, precision, and measurable outcomes.</p>
            </div>
            <div class="features-grid-${variation.style}">
                ${featureHighlights.map(feature => `
                <article class="feature-card">
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                    <span class="feature-benefit">${feature.benefit}</span>
                </article>`).join('')}
            </div>
        </section>

        <section id="testimonials" class="section testimonials-section">
            <div class="section-header">
                <h2 class="section-heading">Client Success Stories</h2>
                <p class="section-subtitle">Global teams trust ${companyName} to accelerate growth, modernize experiences, and outperform markets.</p>
            </div>
            <div class="testimonials-grid">
                ${testimonials.map(testimonial => `
                <blockquote class="testimonial-card">
                    <div class="testimonial-rating">${'★'.repeat(Math.round(testimonial.rating))}</div>
                    <p class="testimonial-text">"${testimonial.text}"</p>
                    <div class="testimonial-meta">
                        <span class="testimonial-name">${testimonial.name}</span>
                        <span class="testimonial-role">${testimonial.role}, ${testimonial.company}</span>
                    </div>
                </blockquote>`).join('')}
            </div>
        </section>

        <section id="about" class="section about-section">
            <div class="about-content">
                <h2 class="section-heading">Built for Ambitious Teams</h2>
                <p class="section-subtitle">${businessContext.uniqueValue || 'Strategic execution with design-led innovation.'}</p>
                <div class="about-grid">
                    <article class="about-story">
                        <h3>Our Philosophy</h3>
                        <p>${intelligentContent.aboutContent}</p>
                    </article>
                    <article class="about-list">
                        <h3>Why Leaders Choose ${companyName}</h3>
                        <ul>
                            <li>Industry specialists with award-winning delivery teams</li>
                            <li>Dedicated transformation squads for rapid execution</li>
                            <li>Proven frameworks aligned to enterprise best practices</li>
                            <li>Strategic partnership model focused on measurable impact</li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>

        <section id="faq" class="section faq-section">
            <div class="section-header">
                <h2 class="section-heading">Frequently Asked Questions</h2>
                <p class="section-subtitle">Transparent partnerships, streamlined onboarding, and relentless pursuit of results.</p>
            </div>
            <div class="faq-list">
                ${faqItems.map((faq, index) => `
                <article class="faq-item">
                    <button class="faq-question" aria-expanded="${index === 0 ? 'true' : 'false'}">
                        <span>${faq.question}</span>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14m-7-7h14" /></svg>
                    </button>
                    <div class="faq-answer"${index === 0 ? ' data-open="true"' : ''}>
                        <p>${faq.answer}</p>
                    </div>
                </article>`).join('')}
            </div>
        </section>

        <section id="contact" class="section cta-section">
            <div class="cta-content">
                <span class="cta-badge">Ready to elevate</span>
                <h2 class="section-heading">Let’s architect your next breakthrough.</h2>
                <p class="section-subtitle">From discovery to deployment, ${companyName} partners with visionary teams to design, launch, and scale premium digital experiences.</p>
                <div class="cta-actions">
                    <button class="cta-button-${variation.style} primary-cta">${supportingCTA}</button>
                    <button class="cta-secondary-button outline">${secondaryCTA}</button>
                </div>
                <div class="cta-meta">
                    <div>
                        <span>Office</span>
                        <p>123 Innovation Drive, San Francisco, CA</p>
                    </div>
                    <div>
                        <span>Contact</span>
                        <p><a href="mailto:hello@${companyName.replace(/\s+/g, '').toLowerCase()}.com">hello@${companyName.replace(/\s+/g, '').toLowerCase()}.com</a></p>
                    </div>
                    <div>
                        <span>Phone</span>
                        <p>+1 (415) 555-0102</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    
    <footer class="footer-${variation.colorScheme}">
        <div class="footer-grid">
            <div>
                <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                <p class="footer-tagline">Precision-built experiences for ${businessContext.targetAudience || 'forward-thinking teams'}.</p>
            </div>
            <div class="footer-links">
                <a href="#services">Services</a>
                <a href="#testimonials">Success Stories</a>
                <a href="#faq">FAQs</a>
            </div>
            <div class="footer-links">
                <a href="#contact">Contact</a>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
            </div>
        </div>
    </footer>
</body>
</html>`;

    const css = `/* Premium Fallback Template - ${variation.layout} ${variation.colorScheme} ${variation.style} */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --accent: ${colors.accent};
    --bg: ${colors.background};
    --text: ${colors.text};
    --glass-bg: ${variation.colorScheme === 'black' ? 'rgba(0, 0, 0, 0.3)' : variation.colorScheme === 'gold' ? 'rgba(255, 215, 0, 0.1)' : variation.colorScheme === 'silver' ? 'rgba(192, 192, 192, 0.1)' : 'rgba(107, 70, 193, 0.2)'};
    --glass-border: ${variation.colorScheme === 'black' ? 'rgba(255, 215, 0, 0.3)' : variation.colorScheme === 'gold' ? 'rgba(255, 215, 0, 0.4)' : variation.colorScheme === 'silver' ? 'rgba(192, 192, 192, 0.3)' : 'rgba(139, 92, 246, 0.3)'};
}

body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    background: ${colors.background};
    background-image: ${variation.colorScheme === 'black' ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)' : variation.colorScheme === 'gold' ? 'linear-gradient(135deg, #1a1a1a 0%, #2d1b0e 50%, #1a1a1a 100%)' : variation.colorScheme === 'silver' ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)' : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'};
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
    color: ${colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    overflow-x: hidden;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.header-${variation.layout} {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--glass-border);
    padding: 1.5rem 2rem;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nav-${variation.style} {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.75rem;
    font-weight: 700;
    background: ${variation.colorScheme === 'black' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : variation.colorScheme === 'gold' ? 'linear-gradient(135deg, #FFD700, #FFC107)' : variation.colorScheme === 'silver' ? 'linear-gradient(135deg, #C0C0C0, #E8E8E8)' : 'linear-gradient(135deg, #8B5CF6, #A78BFA)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px ${colors.accent}40;
    letter-spacing: -0.02em;
}

.nav-links {
    display: flex;
    gap: 2.5rem;
    align-items: center;
}

.nav-links a {
    color: ${colors.text};
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    position: relative;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    padding: 0.5rem 0;
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});
    transition: width 0.3s ease;
}

.nav-links a:hover {
    color: ${colors.accent};
    transform: translateY(-2px);
}

.nav-links a:hover::after {
    width: 100%;
}

.main-${variation.colorScheme} {
    margin-top: 80px;
}

.hero-${variation.animation} {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;
    position: relative;
    padding: clamp(64px, 10vw, 120px) 2rem;
    overflow: hidden;
}

.hero-${variation.animation}::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${variation.colorScheme === 'black' ? 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)' : variation.colorScheme === 'gold' ? 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.15) 0%, transparent 70%)' : variation.colorScheme === 'silver' ? 'radial-gradient(circle at 50% 50%, rgba(192, 192, 192, 0.1) 0%, transparent 70%)' : 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)'};
    animation: pulse 4s ease-in-out infinite;
    pointer-events: none;
}

@keyframes pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
}

.hero-content {
    position: relative;
    z-index: 2;
    max-width: 1100px;
    margin: 0 auto;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.hero-title-${variation.typography} {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.1;
    letter-spacing: -0.03em;
    background: ${variation.colorScheme === 'black' ? 'linear-gradient(135deg, #FFD700, #FFA500, #FFFFFF)' : variation.colorScheme === 'gold' ? 'linear-gradient(135deg, #FFD700, #FFC107, #FFA500)' : variation.colorScheme === 'silver' ? 'linear-gradient(135deg, #E8E8E8, #C0C0C0, #FFFFFF)' : 'linear-gradient(135deg, #8B5CF6, #A78BFA, #C4B5FD)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px ${colors.accent}30;
    animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero-subtitle {
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    opacity: 0.9;
    line-height: 1.8;
    color: ${colors.text};
    animation: fadeInUp 1s ease-out 0.2s both;
    max-width: 820px;
}

.hero-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.primary-cta {
    position: relative;
    overflow: hidden;
}

.cta-secondary-button {
    background: transparent;
    color: ${colors.text};
    border: 1px solid ${colors.accent};
    padding: 1.1rem 2.4rem;
    border-radius: 50px;
    font-size: 1.05rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: inset 0 0 0 1px ${colors.accent}40;
}

.cta-secondary-button:hover {
    color: ${colors.background};
    background: ${colors.accent};
    transform: translateY(-3px);
}

.cta-secondary-button.outline {
    border-color: ${colors.text}70;
    color: ${colors.text};
}

.cta-secondary-button.outline:hover {
    background: ${colors.text};
    color: ${colors.background};
}

.cta-button-${variation.style} {
    background: ${variation.colorScheme === 'black' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : variation.colorScheme === 'gold' ? 'linear-gradient(135deg, #FFD700, #FFC107)' : variation.colorScheme === 'silver' ? 'linear-gradient(135deg, #C0C0C0, #E8E8E8)' : 'linear-gradient(135deg, #8B5CF6, #A78BFA)'};
    color: ${variation.colorScheme === 'silver' ? '#1a1a1a' : variation.colorScheme === 'gold' ? '#1a1a1a' : '#FFFFFF'};
    border: none;
    padding: 1.15rem 2.8rem;
    border-radius: 999px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 16px 35px ${colors.accent}35, 0 6px 20px rgba(0, 0, 0, 0.3);
    animation: fadeInUp 1s ease-out 0.4s both;
}

.cta-button-${variation.style}::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
}

.cta-button-${variation.style}:hover::before {
    left: 100%;
}

.cta-button-${variation.style}:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 40px ${colors.accent}60, 0 4px 20px rgba(0, 0, 0, 0.4);
}

.cta-button-${variation.style}:active {
    transform: translateY(-2px) scale(1.02);
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    background: ${colors.accent}30;
    color: ${colors.accent};
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    font-weight: 600;
    border: 1px solid ${colors.accent}40;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

.metric-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(20px);
    padding: 1.5rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.metric-card h3 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, ${colors.accent}, ${colors.primary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.metric-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.35);
}

.section {
    padding: clamp(80px, 12vw, 140px) 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.section-heading {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 1rem;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.section-subtitle {
    color: ${colors.text};
    opacity: 0.85;
    max-width: 760px;
    line-height: 1.8;
    margin-bottom: 2.5rem;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}

.service-card {
    position: relative;
    padding: 2.2rem;
    border-radius: 24px;
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(18px);
    background: rgba(0,0,0,0.35);
    box-shadow: 0 14px 40px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.35s ease;
}

.service-card:hover {
    transform: translateY(-10px);
    border-color: ${colors.accent};
    box-shadow: 0 20px 50px ${colors.accent}25;
    background: rgba(0,0,0,0.55);
}

.service-index {
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: ${colors.accent};
}

.service-card h3 {
    font-size: 1.4rem;
    color: ${colors.text};
}

.service-card p {
    color: ${colors.text};
    opacity: 0.85;
    line-height: 1.7;
}

.service-link {
    align-self: flex-start;
    background: transparent;
    border: none;
    color: ${colors.accent};
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: transform 0.3s ease;
}

.service-link::after {
    content: '→';
    display: inline-block;
    transition: transform 0.3s ease;
}

.service-link:hover::after {
    transform: translateX(6px);
}

.section-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2.5rem;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
}

.testimonial-card {
    background: rgba(0,0,0,0.35);
    border-radius: 24px;
    padding: 2rem;
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(18px);
    box-shadow: 0 14px 40px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: relative;
    transition: transform 0.35s ease;
}

.testimonial-card::before {
    content: '“';
    position: absolute;
    top: 12px;
    left: 18px;
    font-size: 3.5rem;
    color: ${colors.accent}50;
}

.testimonial-card:hover {
    transform: translateY(-12px);
    border-color: ${colors.accent};
}

.testimonial-rating {
    color: ${colors.accent};
    font-size: 1.2rem;
    letter-spacing: 0.2em;
}

.testimonial-text {
    font-size: 1rem;
    line-height: 1.8;
    color: ${colors.text};
    opacity: 0.9;
}

.testimonial-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.testimonial-name {
    font-weight: 700;
    font-size: 1rem;
}

.testimonial-role {
    font-size: 0.85rem;
    opacity: 0.7;
}

.about-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.about-story, .about-list {
    background: rgba(0,0,0,0.35);
    border-radius: 24px;
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(18px);
    padding: 2.2rem;
    box-shadow: 0 16px 42px rgba(0,0,0,0.3);
}

.about-list ul {
    list-style: none;
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
}

.about-list li::before {
    content: '•';
    color: ${colors.accent};
    margin-right: 0.5rem;
}

.faq-list {
    display: grid;
    gap: 1rem;
}

.faq-item {
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(18px);
    overflow: hidden;
    transition: border-color 0.3s ease;
}

.faq-item[open] {
    border-color: ${colors.accent};
}

.faq-question {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: transparent;
    border: none;
    color: ${colors.text};
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}

.faq-question svg {
    width: 20px;
    height: 20px;
    stroke: ${colors.accent};
    transition: transform 0.3s ease;
}

.faq-answer {
    max-height: 0;
    overflow: hidden;
    padding: 0 2rem;
    transition: max-height 0.4s ease, padding 0.4s ease;
}

.faq-answer[data-open="true"] {
    max-height: 400px;
    padding: 0 2rem 1.5rem;
}

.faq-answer p {
    opacity: 0.85;
    line-height: 1.8;
}

.cta-section {
    background: linear-gradient(135deg, ${colors.primary}30, ${colors.accent}20);
    border-radius: 32px;
    border: 1px solid ${colors.accent}30;
    box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    padding: clamp(48px, 8vw, 96px);
}

.cta-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.cta-badge {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: ${colors.accent};
}

.cta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.cta-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.cta-meta span {
    display: block;
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${colors.accent};
    margin-bottom: 0.5rem;
}

.cta-meta a {
    color: ${colors.text};
    text-decoration: none;
    opacity: 0.85;
    transition: color 0.3s ease, opacity 0.3s ease;
}

.cta-meta a:hover {
    color: ${colors.accent};
    opacity: 1;
}

.footer-${variation.colorScheme} {
    background: ${colors.background};
    border-top: 1px solid ${colors.primary}30;
    padding: 2.5rem;
    opacity: 0.85;
}

.footer-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    align-items: flex-start;
}

.footer-links {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.footer-links a {
    color: ${colors.text};
    opacity: 0.7;
    text-decoration: none;
    transition: color 0.3s ease, opacity 0.3s ease;
}

.footer-links a:hover {
    color: ${colors.accent};
    opacity: 1;
}

.footer-tagline {
    margin-top: 0.75rem;
    opacity: 0.7;
    line-height: 1.7;
}

@media (max-width: 768px) {
    .hero-title-${variation.typography} {
        font-size: 2rem;
    }
    
    .nav-links {
        display: none;
    }
    
.features-grid-${variation.style} {
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${colors.accent};
    font-weight: 600;
}

.feature-card p {
    color: ${colors.text};
    opacity: 0.9;
    line-height: 1.7;
}

@media (min-width: 768px) {
    .hero-title-${variation.typography} {
        font-size: clamp(3rem, 8vw, 5.5rem);
    }
    
    .features-grid-${variation.style} {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
    }
    
    .nav-links {
        display: flex;
    }
}

@media (min-width: 1024px) {
    .hero-${variation.animation} {
        padding: clamp(80px, 12vw, 140px) 2rem;
    }
    
    .features-${variation.layout} {
        padding: clamp(80px, 12vw, 120px) 2rem;
    }
}
}`;

    const js = `// Fallback Template JavaScript - ${variation.layout}
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Fallback template loaded: ${variation.layout}-${variation.colorScheme}-${variation.style}');
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    const animatedCards = document.querySelectorAll('.feature-card, .service-card, .testimonial-card, .metric-card');
    animatedCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // FAQ accordion interactions
    document.querySelectorAll('.faq-item').forEach(item => {
        const trigger = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!trigger || !answer) return;
        
        if (answer.dataset.open === 'true') {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
        
        trigger.addEventListener('click', () => {
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!isOpen));
            if (isOpen) {
                answer.style.maxHeight = '';
                answer.removeAttribute('data-open');
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.setAttribute('data-open', 'true');
            }
        });
    });
    
    // CTA analytics hook
    document.querySelectorAll('.primary-cta').forEach(button => {
        button.addEventListener('click', () => {
            console.log('✨ CTA clicked: ${primaryCTA}');
        });
    });
});`;

    return { html, css, js };
  }
}
