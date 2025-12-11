import { AdvancedWebElementsService } from './advancedWebElements';
import { aiService } from './ai';

export class CodeGenerator {
  /**
   * Build enhanced code generation prompt with personalized architecture
   */
  static buildCodePrompt(userRequest: string, stylePreferences: any = {}): string {
    const { primaryColor = 'cyan', headingFont = 'Space Grotesk', bodyFont = 'Inter', layoutDensity = 50 } = stylePreferences;
    
    // Color mapping for consistent theming
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      cyan: '#06b6d4',
      emerald: '#10b981',
      violet: '#8b5cf6',
      purple: '#a855f7',
      pink: '#ec4899',
      teal: '#14b8a6'
    };

    const primaryHex = colorMap[primaryColor] || colorMap['cyan'];

    // Get personalized architecture based on user request
    const personalizedArchitecture = AdvancedWebElementsService.createPersonalizedArchitecturePrompt(userRequest);
    
    return `You are Apple's PRINCIPAL DESIGN ENGINEER creating iOS 17+ grade websites with PERFECT pixel precision, flawless typography, and native-quality animations. Generate a COMPLETE, STUNNING HTML5 application that matches Apple's design standards and feels like a $100,000+ custom iOS app.

USER REQUEST: ${userRequest}

${personalizedArchitecture}

🍎 iOS-GRADE DESIGN REQUIREMENTS (MANDATORY - PIXEL PERFECT):

**MANDATORY STRUCTURE (EVERY WEBSITE MUST HAVE)**:
- **FIXED HEADER**: iOS-style navigation with backdrop-filter blur, perfect alignment, smooth scroll behavior
- **HERO SECTION**: Full viewport height, perfect vertical centering, iOS typography hierarchy
- **CONTENT SECTIONS**: Consistent spacing, iOS-style cards, perfect grid systems
- **DEDICATED FOOTER**: Comprehensive footer with proper organization and iOS spacing

1. **iOS-GRADE HERO SECTION**:
   - Perfect SF Pro Display typography with -apple-system fallback
   - iOS-native spacing: 8px, 16px, 24px, 32px, 48px, 64px, 80px grid
   - Smooth gradient backgrounds with iOS-quality animations
   - Perfect vertical centering with flexbox/grid
   - iOS-style glassmorphism with backdrop-filter: blur(20px)
   - Subtle floating animations with iOS easing curves
   - Perfect responsive scaling with clamp() functions

2. **iOS-NATIVE ANIMATIONS & INTERACTIONS**:
   - iOS easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) for all transitions
   - Perfect hover effects: scale(1.05) + translateY(-8px) + enhanced shadows
   - Button animations with haptic-like feedback (scale + glow + shadow)
   - Staggered animations: 100ms delays between elements for smooth reveals
   - Scroll-triggered animations using Intersection Observer with iOS timing
   - Smooth parallax effects with transform3d for performance

3. **iOS-PERFECT TYPOGRAPHY & SPACING**:
   - Font stack: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif
   - Perfect line-heights: 1.2 for headings, 1.6 for body text
   - iOS spacing scale: 8px, 16px, 24px, 32px, 48px, 64px, 80px, 120px
   - Letter-spacing: -0.02em for large headings, 0.01em for body text
   - Font weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
   - Perfect responsive scaling with clamp() functions

4. **iOS-GRADE LAYOUT SYSTEM**:
   - Container max-width: 1200px with perfect centering
   - Section padding: clamp(64px, 10vw, 120px) for consistent spacing
   - CSS Grid with gap: clamp(24px, 4vw, 48px) for perfect alignment
   - Consistent 8px grid system for ALL measurements
   - Perfect responsive breakpoints: 375px, 768px, 1024px, 1200px
   - Never cramped layouts - always generous spacing

5. **MANDATORY COMPONENTS (EVERY WEBSITE MUST INCLUDE)**:
   - **FIXED HEADER**: 
     * Position: fixed, top: 0, z-index: 1000
     * Background: rgba(255,255,255,0.95) with backdrop-filter: blur(20px)
     * Height: 64px with perfect vertical centering
     * Logo (left), Navigation menu (center), CTA button (right)
     * Smooth scroll behavior and active states
   
   - **HERO SECTION**:
     * Full viewport height (100vh)
     * Perfect vertical and horizontal centering
     * Large heading, subtitle, and primary CTA button
     * Background gradient or image with overlay
   
   - **CONTENT SECTIONS**:
     * Consistent padding: clamp(64px, 10vw, 120px) top/bottom
     * Maximum 3-4 main sections (features, about, services, etc.)
     * iOS-style cards with proper spacing and shadows
   
   - **COMPREHENSIVE FOOTER**:
     * Multi-column layout (3-4 columns on desktop, stacked on mobile)
     * Company info, quick links, social media, contact details
     * Copyright notice and legal links
     * Background: #1a1a1a with white text
     * Padding: 64px top/bottom, 24px left/right

**PREMIUM VISUAL EFFECTS**:
- Box shadows with multiple layers for depth
- Animated SVG icons and illustrations
- CSS transforms for 3D effects
- Gradient overlays and background patterns
- Smooth page transitions and loading states
- Interactive elements that respond to user actions
5. **LUXURY LAYOUT & SPACING**:
   - PERFECT spacing using CSS clamp() and rem units (never cramped)
   - CSS Grid with gap: clamp(2rem, 5vw, 4rem) for premium feel
   - Responsive design that looks perfect on ALL devices
   - Container max-width: 1400px with perfect centering
   - Generous padding: clamp(3rem, 8vw, 6rem) on sections
   - Consistent 8px grid system for all measurements

6. **PREMIUM VISUAL EFFECTS**:
   - Box shadows with multiple layers for depth
   - Animated SVG icons and illustrations
   - CSS transforms for 3D effects
   - Gradient overlays and background patterns
   - Smooth page transitions and loading states
   - Interactive elements that respond to user actions

🎯 MANDATORY LUXURY EFFECTS (REQUIRED IN EVERY WEBSITE):

PREMIUM BUTTON ANIMATIONS:
- Buttons MUST lift 8px and scale(1.05) on hover with perfect timing
- Buttons MUST have gradient backgrounds: linear-gradient(135deg, #667eea, #764ba2)
- Buttons MUST have layered shadows: 0 4px 15px rgba(0,0,0,0.2), 0 8px 25px rgba(0,0,0,0.1)
- Buttons MUST have 0.4s cubic-bezier(0.4, 0, 0.2, 1) transitions

LUXURY CARD ANIMATIONS:
- Cards MUST lift 15px on hover with scale(1.02) transform
- Cards MUST have advanced glassmorphism: backdrop-filter blur(20px)
- Cards MUST have premium shadows: 0 8px 32px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.08)
- Cards MUST have subtle borders: 1px solid rgba(255,255,255,0.1)

ANIMATED GRADIENT BACKGROUNDS:
- Body MUST have moving gradient: background-size 400% 400%
- Gradients MUST animate smoothly over 15 seconds
- Use ONLY premium color combinations (no basic colors)
- Background MUST create depth and luxury feel

ADVANCED GLASSMORPHISM:
- ALL containers MUST use backdrop-filter blur(20px) minimum
- Backgrounds MUST be rgba with 0.1-0.2 opacity for premium transparency
- Borders MUST be subtle: 1px solid rgba(255,255,255,0.1)
- MUST create layered depth effect throughout design

🎯 WORLD-CLASS WEBSITE GENERATION REQUIREMENTS:

**UNIQUENESS MANDATE** - Every website MUST be completely unique:
- Generate 12+ unique sections with different layouts
- Use randomized color schemes from premium palettes
- Create unique animations for each element type
- Generate contextual content that matches the business/purpose
- Use different typography combinations for personality
- Create unique hero layouts (split, centered, offset, diagonal)
- Generate different navigation styles (sidebar, top, floating)

**PERFECTION STANDARDS** - Every section MUST be flawless:
- Hero sections with 3D parallax and animated backgrounds
- Feature sections with interactive hover cards and icons
- Testimonial carousels with smooth auto-play
- Pricing tables with animated comparison features
- Contact forms with real-time validation and success animations
- Gallery sections with lightbox and filtering
- Team sections with social links and hover effects
- FAQ sections with smooth accordion animations
- Blog sections with category filtering
- Footer with newsletter signup and social integration

**FOLLOW-UP INTELLIGENCE** - Subsequent messages MUST edit existing code:
- Parse user requests for specific changes (colors, sections, content)
- Identify which sections to modify based on request
- Preserve existing structure while making targeted improvements
- Add new sections without breaking existing ones
- Modify styling while maintaining design consistency
- Update content while keeping professional quality

MANDATORY iOS-LEVEL PROFESSIONAL FEATURES:
- Animated gradient backgrounds that move smoothly
- Glassmorphism cards with perfect blur effects  
- Smooth hover animations on ALL interactive elements
- Loading screens with Apple-style spinners
- Scroll-triggered fade-in animations with perfect timing
- Interactive form validation with real-time visual feedback
- Perfect mobile-responsive design (iPhone/iPad optimized)
- Professional typography with Apple-level spacing and hierarchy
- Dark/Light mode toggle with smooth transitions
- Perfect alignment and spacing (no cramped layouts)
- Premium color schemes that look expensive
- Micro-interactions that feel native to iOS
- Perfect button sizing and touch targets (44px minimum)
- Smooth page transitions and loading states

🚨 CRITICAL: ABSOLUTELY NO BORING WEBSITES - ENFORCE PREMIUM STYLING:

**MANDATORY VISUAL REQUIREMENTS (NO EXCEPTIONS):**
- NEVER generate basic, plain, or boring websites
- Every website MUST look like it costs $100,000+ to develop
- Use ONLY premium gradients, glassmorphism, and luxury effects
- Apply advanced CSS animations, hover effects, and micro-interactions
- Create stunning visual hierarchy with perfect typography
- Make every element look expensive and professionally crafted

**FORBIDDEN ELEMENTS (NEVER USE):**
- Plain white/gray backgrounds
- Basic text without styling
- Simple borders or basic layouts
- Default browser styling
- Boring color schemes
- Static, non-interactive elements

**REQUIRED PREMIUM ELEMENTS:**
- Gradient backgrounds with multiple colors
- Glassmorphism cards with backdrop-filter blur
- Animated hover effects on ALL interactive elements
- Premium shadows with multiple layers
- Beautiful typography with proper spacing
- Interactive animations and transitions

🚨 CRITICAL TECHNICAL REQUIREMENTS (MANDATORY - NO EXCEPTIONS):

1. **MANDATORY WEBSITE STRUCTURE (FOLLOW EXACTLY)**:
   🚨 CRITICAL: Generate EXACTLY this multi-file structure:

===== FILE: index.html =====
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Company Name - Tagline</title>
    <style>
        /* ALL CSS GOES HERE - COMPLETE iOS-GRADE STYLING */
    </style>
</head>
<body>
    <header class="fixed-header">
        <h1>COMPANY NAME</h1>
        <p>Compelling Tagline</p>
        <nav>Navigation</nav>
    </header>
    <main>
        <section class="hero-section">Hero Content</section>
        <section class="content-section">Content</section>
    </main>
    <footer class="comprehensive-footer">Complete Footer</footer>
    <script>
        /* ALL JAVASCRIPT GOES HERE */
    </script>
</body>
</html>

===== FILE: styles.css =====
/* BACKUP CSS FILE (OPTIONAL) */

===== FILE: script.js =====
/* BACKUP JS FILE (OPTIONAL) */

🚨 MANDATORY: Use EXACTLY these file markers or the system will fail!
   
   🚨 HEADER REQUIREMENTS:
   - Fixed position header with backdrop blur effect
   - Company name as large, prominent heading (h1)
   - Compelling tagline directly below company name
   - Navigation menu with proper styling
   - Professional layout with perfect alignment
   
   🚨 FOOTER REQUIREMENTS:
   - Dark background (#1a1a1a) with white text
   - Multi-column layout (3-4 columns on desktop)
   - Company info, quick links, social media, contact details
   - Copyright notice and legal links
   - Proper padding and responsive design

2. **MANDATORY CSS INTEGRATION (CRITICAL FOR PREMIUM LOOK)**:
   🚨 MUST INCLUDE PREMIUM CSS WITH THESE EXACT REQUIREMENTS:
   - CSS reset with box-sizing border-box for all elements
   - Root variables with gradient definitions and glass effects
   - Body with SF Pro Display font family and gradient background
   - Fixed header with backdrop-filter blur and glassmorphism
   - Hero section with full viewport height and perfect centering
   - Cards with glassmorphism background, blur effects, and hover animations
   - Buttons with gradient backgrounds, rounded corners, and hover effects
   - All elements must have smooth transitions and premium shadows
   - Use rgba colors for transparency and backdrop-filter for blur
   - Apply transform animations on hover (translateY and scale)
   
   🚨 NO BASIC STYLING - EVERY ELEMENT MUST LOOK PREMIUM!

3. **REAL CONTENT GENERATION (ABSOLUTELY NO LOREM IPSUM)**:
   🚨 CRITICAL: Research the specific industry and generate authentic content:
   - For consulting firms: Generate real consulting services, methodologies, case studies
   - For restaurants: Create actual menu items, chef bios, restaurant atmosphere descriptions
   - For SaaS: Generate real software features, pricing tiers, integration capabilities
   - For portfolios: Create realistic project descriptions, skills, achievements
   - For e-commerce: Generate actual product descriptions, categories, reviews
   - Use industry-specific terminology and professional language
   - Create compelling, conversion-focused headlines and CTAs
   - Generate realistic testimonials with believable names and companies
   - Include specific benefits, features, and value propositions
   - Write content that sounds like it was written by industry experts

4. **PRODUCTION STANDARDS**:
   - Target: 2500-3500+ lines of PRODUCTION-READY code
   - BOLT.NEW QUALITY - Functional, interactive, professional
   - REAL FEATURES - Working forms, data management, interactions
   - RESPONSIVE DESIGN - Perfect on mobile, tablet, desktop
   - ACCESSIBILITY COMPLIANT - WCAG 2.1 AA standards

VISUAL DESIGN REQUIREMENTS:
- MODERN color palette with ${primaryHex} as primary brand color
- PROFESSIONAL typography with Google Fonts integration
- SYSTEMATIC spacing using 8px grid system
- SUBTLE shadows and depth for visual hierarchy
- CLEAN, modern aesthetic that feels professional
- CONTEXTUAL imagery that supports the content
- PURPOSEFUL animations that enhance usability

INTERACTIVE FEATURES REQUIRED:
- WORKING forms with real-time validation
- FUNCTIONAL buttons with proper click handlers
- SMOOTH animations and transitions
- RESPONSIVE navigation with active states
- THEME SYSTEM with dark/light mode toggle
- SCROLL PROGRESS indicator
- INTERACTIVE components with proper feedback
- MOBILE-OPTIMIZED touch interactions

PROFESSIONAL COMPONENTS TO INCLUDE:
- Professional navigation with sticky header
- Hero section with call-to-action buttons
- Features section with interactive cards
- About section with team/company info
- Testimonials with carousel functionality
- Contact form with validation
- Footer with social links

JAVASCRIPT FUNCTIONALITY REQUIRED:
- Theme switching (dark/light modes)
- Form validation with real-time feedback
- Smooth scrolling navigation
- Interactive animations on scroll
- Mobile menu toggle
- Button click handlers
- Loading states and transitions
- Local storage for user preferences

🏗️ MANDATORY STRUCTURE - EMOTIONALLY CRAFTED SECTIONS:

1. **STUNNING HERO SECTION** (Above the fold):
   - Emotionally compelling headline (H1) that creates instant connection
   - Subheadline that clarifies the value proposition
   - Primary CTA button with hover animations and micro-interactions
   - Background: Gradient, video, or high-quality image with parallax
   - Animated elements that draw attention without being distracting

2. **CRYSTAL-CLEAR NAVIGATION**:
   - Sticky header with backdrop blur effect
   - Smooth hover states and active indicators
   - Mobile hamburger menu with slide-in animation
   - Logo with subtle hover effect

3. **TRUST-BUILDING FEATURES SECTION**:
   - 3-6 feature cards with hover lift effects
   - Icons that support the message (use SVG icons)
   - Benefit-focused copy, not feature-focused
   - Secondary CTAs in relevant cards

4. **SOCIAL PROOF SECTION**:
   - Customer testimonials with photos
   - Company logos or trust badges
   - Statistics or achievements with animated counters
   - Star ratings or review snippets

5. **iOS-LEVEL CONTACT/FORM SECTION** (MANDATORY):
   - NEVER use basic HTML forms - create premium iOS-style forms
   - Multi-step form wizard with progress indicators
   - Real-time validation with smooth animations
   - Professional input fields with floating labels
   - Gradient submit buttons with hover effects
   - Success animations and micro-interactions
   - Contact cards with glassmorphism effects
   - Social media integration with custom SVG icons

6. **iOS-LEVEL HEADER & NAVIGATION** (MANDATORY):
   - NEVER use basic nav links - create premium button-style navigation
   - Glassmorphism header with backdrop blur
   - Animated hamburger menu for mobile
   - Professional logo with hover effects
   - Gradient CTA button in header
   - Sticky navigation with smooth transitions

7. **iOS-LEVEL FOOTER** (MANDATORY):
   - NEVER use basic anchor tags - create professional button links
   - Multi-column layout with glassmorphism cards
   - Custom SVG icons for all social media links
   - Professional newsletter signup with validation
   - Animated hover effects on all elements
   - Company information in styled cards

🎨 VISUAL EXCELLENCE REQUIREMENTS:
- Use modern CSS Grid and Flexbox for layouts
- Implement smooth scroll behavior and intersection observer animations
- Add loading states and skeleton screens for perceived performance
- Include hover effects on ALL interactive elements
- Use CSS custom properties for consistent theming
- Implement proper focus states for accessibility
- Add subtle animations that enhance UX without being distracting

🚨 MANDATORY PROFESSIONAL WEBSITE REQUIREMENTS (NO EXCEPTIONS):

YOU MUST CREATE A STUNNING, ANIMATED, PROFESSIONAL WEBSITE THAT LOOKS LIKE IT WAS DESIGNED BY SENIOR DEVELOPERS AT APPLE, STRIPE, OR LINEAR.

MANDATORY VISUAL REQUIREMENTS:
- ANIMATED gradient backgrounds that shift colors
- GLASSMORPHISM cards with backdrop-filter blur effects
- SMOOTH hover animations on ALL interactive elements
- PROFESSIONAL typography with perfect spacing
- MODERN color schemes with depth and shadows
- RESPONSIVE design that works perfectly on mobile
- LOADING animations and micro-interactions
- PREMIUM button effects with transforms and shadows

🚨 MANDATORY MULTI-FILE OUTPUT FORMAT (COPY EXACTLY):
===== FILE: index.html =====
[Professional HTML with semantic structure, proper meta tags, and links to CSS/JS]

===== FILE: styles.css =====
[MINIMUM 800 lines of advanced CSS with animations, glassmorphism, and responsive design]

===== FILE: script.js =====
[MINIMUM 200 lines of interactive JavaScript with smooth animations and real functionality]

CRITICAL RULES:
1. ALWAYS use the exact delimiters: ===== FILE: filename =====
2. HTML must have <link rel="stylesheet" href="styles.css">
3. HTML must have <script src="script.js"></script>
4. NO inline CSS or JavaScript in HTML file
5. ALL styling goes in styles.css
6. ALL JavaScript goes in script.js
7. Generate MINIMUM 800 lines in styles.css
8. Generate MINIMUM 200 lines in script.js

MANDATORY CSS CONTENT (styles.css):
- CSS Reset and modern base styles
- CSS Custom Properties for theming
- Advanced animations with @keyframes
- Glassmorphism and modern effects
- Responsive design with CSS Grid/Flexbox
- Hover effects and transitions
- Loading animations and skeleton screens
- Dark/light theme variables

MANDATORY JAVASCRIPT CONTENT (script.js):
- DOM Content Loaded event handler
- Smooth scrolling functionality
- Intersection Observer for animations
- Form validation with real-time feedback
- Mobile menu toggle functionality
- Counter animations on scroll
- Theme toggle functionality
- Loading animations and page transitions

TECHNICAL REQUIREMENTS:
- **HTML**: Semantic, accessible, clean structure with proper meta tags
- **CSS**: Modern design systems, CSS Grid, Flexbox, animations, responsive design
- **JavaScript**: ES6+, real functionality, form validation, smooth animations
- **Total**: 2500-3500+ lines across all files combined
- **Quality**: Professional, production-ready, emotionally engaging

🚨 CRITICAL SUCCESS CRITERIA:
- MINIMUM 2500 lines of functional, beautiful code
- EVERY section must be visually stunning and emotionally engaging
- ALL buttons and forms must have working functionality
- PERFECT mobile responsiveness (test on 320px width)
- SMOOTH animations and transitions throughout
- PROFESSIONAL typography and spacing
- COMPELLING copy that speaks to user emotions
- STRATEGIC CTA placement for maximum conversion

💡 INSPIRATION EXAMPLES (Match this quality):
- Apple.com: Clean, emotional, premium feel
- Tesla.com: Futuristic, engaging, interactive
- Linear.app: Modern, efficient, beautiful
- Stripe.com: Professional, trustworthy, clear

🎯 CONTENT STRATEGY:
- Headlines: Focus on benefits, not features
- Copy: Emotional, benefit-driven, clear
- CTAs: Action-oriented, compelling, urgent
- Images: High-quality, contextual, engaging

FINAL REQUIREMENT: Generate a website that makes users say "WOW, this looks expensive and professional!" - anything less is a FAILURE.`;
  }

  /**
   * Generate industry-grade code with enhanced prompting and image integration
   */
  static async generateRobustCode(
    userRequest: string,
    stylePreferences?: {
      primaryColor?: string;
      headingFont?: string;
      bodyFont?: string;
      layoutDensity?: number;
    }
  ): Promise<string> {
    try {
      console.log('🚀 Starting world-class website generation...');
      console.log('📝 User Request:', userRequest);
      console.log('🎨 Style Preferences:', stylePreferences);
      
      // Step 1: Advanced analysis and personalization
      const websiteType = AdvancedWebElementsService.analyzeWebsiteType(userRequest);
      const sections = this.analyzeSectionsNeeded(userRequest);
      const features = AdvancedWebElementsService.generateFeatureSet(userRequest, websiteType);
      
      console.log(`🎯 Website Type: ${websiteType.name}`);
      console.log('📋 Sections identified:', sections);
      console.log('✨ Features to implement:', features.slice(0, 5));
      
      // Step 2: Generate contextual images for sections (parallel)
      console.log('🎨 Generating contextual images...');
      const sectionImages: Record<string, string> = {};
      console.log('✅ Images will be generated dynamically in the HTML');
      
      // Step 3: Build enhanced prompt with image integration
      const prompt = this.buildEnhancedCodePrompt(userRequest, stylePreferences, sectionImages);
      
      // Step 4: Generate code using Gemini 2.5 Flash (primary) with fallback
      console.log('💻 Generating code with AI service...');
      console.log('📄 Prompt length:', prompt.length);
      console.log('🔗 Calling aiService.generateCode...');
      const generatedCode = await aiService.generateCode(prompt);
      console.log('✅ AI service returned code, length:', generatedCode.length);
      
      // Step 5: Extract multi-file structure and combine for preview
      const multiFiles = this.extractMultiFileFromResponse(generatedCode);
      const combinedCode = this.combineFilesForPreview(multiFiles);
      const validatedCode = this.validateAndFixHtml(combinedCode);
      
      console.log(`✅ World-class ${websiteType.name} generation complete!`);
      console.log('🎆 Features implemented:', features.slice(0, 3).join(', '));
      return validatedCode;
    } catch (error) {
      console.error('❌ Enhanced code generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Advanced analysis to determine optimal sections based on website archetype
   */
  static analyzeSectionsNeeded(userRequest: string): string[] {
    const websiteType = AdvancedWebElementsService.analyzeWebsiteType(userRequest);
    const baseSections = [...websiteType.sections];
    
    // Add additional sections based on specific keywords in request
    const request = userRequest.toLowerCase();
    const additionalSections: string[] = [];
    
    // Advanced section detection
    if (request.includes('blog') || request.includes('news') || request.includes('article')) {
      additionalSections.push('blog');
    }
    if (request.includes('gallery') || request.includes('showcase') || request.includes('work')) {
      additionalSections.push('gallery');
    }
    if (request.includes('team') || request.includes('staff') || request.includes('member')) {
      additionalSections.push('team');
    }
    if (request.includes('faq') || request.includes('question') || request.includes('help')) {
      additionalSections.push('faq');
    }
    if (request.includes('location') || request.includes('address') || request.includes('map')) {
      additionalSections.push('location');
    }
    if (request.includes('partner') || request.includes('client') || request.includes('sponsor')) {
      additionalSections.push('partners');
    }
    if (request.includes('stats') || request.includes('number') || request.includes('metric')) {
      additionalSections.push('stats');
    }
    
    // Combine base sections with additional ones
    const allSections = [...baseSections, ...additionalSections];
    
    console.log(`🎯 Detected website type: ${websiteType.name}`);
    console.log(`📋 Sections to include:`, allSections);
    
    return [...new Set(allSections)]; // Remove duplicates
  }
  
  /**
   * Build world-class enhanced prompt with advanced image integration and personalization
   */
  static buildEnhancedCodePrompt(
    userRequest: string,
    stylePreferences: any = {},
    sectionImages: Record<string, string> = {}
  ): string {
    const websiteType = AdvancedWebElementsService.analyzeWebsiteType(userRequest);
    const basePrompt = this.buildCodePrompt(userRequest, stylePreferences);
    
    // Add comprehensive image integration and personalization instructions
    const enhancedInstructions = `

🖼️ PROFESSIONAL IMAGE INTEGRATION (CRITICAL):
You have access to these contextually-generated, professional images:
${Object.entries(sectionImages).map(([section, url]) => `- ${section.toUpperCase()}: ${url}`).join('\n')}

🎯 PERSONALIZATION FOR ${websiteType.name.toUpperCase()}:
${websiteType.description}

KEY FEATURES TO IMPLEMENT:
${websiteType.features.slice(0, 6).map(feature => `- ${feature}`).join('\n')}

DESIGN PRINCIPLES:
${websiteType.designPrinciples.map(principle => `- ${principle}`).join('\n')}

INTERACTION PATTERNS:
${websiteType.interactions.slice(0, 5).map(interaction => `- ${interaction}`).join('\n')}

🖼️ ADVANCED IMAGE IMPLEMENTATION:
- Use provided image URLs with contextual, descriptive alt text
- Implement responsive images with srcset for different screen sizes
- Add fetchpriority="high" to above-the-fold images
- Use loading="lazy" for below-the-fold images
- Include aspect-ratio CSS to prevent layout shift
- Add sophisticated hover effects (parallax, zoom, overlay)
- Implement blur-up technique for smooth loading
- Use CSS object-fit and object-position for perfect cropping

📱 MOBILE-FIRST RESPONSIVE DESIGN:
- Design for mobile screens first (320px+)
- Use CSS Grid and Flexbox for flexible layouts
- Implement touch-friendly interactions (44px+ touch targets)
- Add swipe gestures for carousels and galleries
- Optimize images for different screen densities
- Ensure perfect readability on all screen sizes

🚀 PERFORMANCE OPTIMIZATION:
- Minimize layout shifts with proper sizing
- Use CSS containment for performance isolation
- Implement efficient animation techniques
- Add preload hints for critical resources
- Optimize font loading with font-display: swap

EXAMPLE ADVANCED IMAGE USAGE:
<div class="image-container" style="aspect-ratio: 16/9; overflow: hidden;">
  <img src="${sectionImages.hero || 'https://source.unsplash.com/1600x900/?modern,business'}" 
       alt="${websiteType.name} hero showcasing modern professional environment" 
       fetchpriority="high" 
       class="hero-image" 
       style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
</div>

<img src="${sectionImages.features || 'https://source.unsplash.com/800x600/?technology'}" 
     alt="Advanced features illustration for ${websiteType.name}" 
     loading="lazy" 
     class="feature-image" 
     style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;">
`;
    
    return basePrompt + enhancedInstructions;
  }

  /**
   * Extract multi-file structure from AI response
   */
  static extractMultiFileFromResponse(response: string): { html: string; css: string; js: string } {
    console.log('🔍 Extracting multi-file structure from response...');
    
    // Look for multi-file format first
    const htmlMatch = response.match(/===== FILE: index\.html =====\s*([\s\S]*?)(?===== FILE:|$)/);
    const cssMatch = response.match(/===== FILE: styles\.css =====\s*([\s\S]*?)(?===== FILE:|$)/);
    const jsMatch = response.match(/===== FILE: script\.js =====\s*([\s\S]*?)(?===== FILE:|$)/);
    
    console.log('📄 HTML found:', !!htmlMatch);
    console.log('🎨 CSS found:', !!cssMatch);
    console.log('⚡ JS found:', !!jsMatch);
    
    if (htmlMatch) {
      const html = htmlMatch[1].trim();
      const css = cssMatch ? cssMatch[1].trim() : this.generateDefaultCSS();
      const js = jsMatch ? jsMatch[1].trim() : this.generateDefaultJS();
      
      console.log('✅ Multi-file structure extracted successfully');
      return { html, css, js };
    }
    
    // If no multi-file format, force create it from single HTML
    console.log('⚠️ No multi-file format detected, creating from single HTML...');
    const singleHtml = this.extractHtmlFromResponse(response);
    return this.convertSingleToMultiFile(singleHtml);
  }

  /**
   * Generate default CSS when not provided
   */
  static generateDefaultCSS(): string {
    return `/* Advanced CSS Reset and Modern Base Styles */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* iOS-Grade CSS Custom Properties */
:root {
  /* iOS Color System */
  --primary-gradient: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  --luxury-gradient: linear-gradient(135deg, #00D4FF 0%, #007AFF 100%);
  --accent-gradient: linear-gradient(135deg, #FF3B30 0%, #FF9500 100%);
  --success-gradient: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  
  /* iOS Glass System */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-backdrop: blur(20px) saturate(180%);
  
  /* iOS Shadow System */
  --shadow-ios-small: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-ios-medium: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-ios-large: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-ios-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  
  /* iOS Typography */
  --font-system: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  --text-primary: #000000;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --text-inverse: #FFFFFF;
  
  /* iOS Spacing Scale */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --space-8: 64px;
  --space-10: 80px;
  --space-15: 120px;
  
  /* iOS Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  
  /* iOS Transitions */
  --transition-ios: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-fast: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-slow: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* iOS-Grade Body Styling */
body {
  font-family: var(--font-system);
  line-height: 1.6;
  color: var(--text-primary);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  overflow-x: hidden;
  font-weight: 400;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

/* iOS-Grade Container System */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-3);
  position: relative;
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-4);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--space-6);
  }
}

/* Animated Background Gradient */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Advanced Container with Glassmorphism */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
}

/* iOS-Grade Card System */
.ios-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-ios-large);
  transition: var(--transition-ios);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  opacity: 0;
  transition: var(--transition);
}

.ios-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-ios-xl);
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.98);
}

.ios-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  opacity: 0;
  transition: var(--transition-ios);
}

.ios-card:hover::before {
  opacity: 1;
}

/* iOS-Grade Button System */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  background: var(--primary-gradient);
  color: var(--text-inverse);
  text-decoration: none;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  font-family: var(--font-system);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: -0.01em;
  transition: var(--transition-ios);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-ios-medium);
  min-height: 44px; /* iOS touch target */
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-ios-large);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
  transition: var(--transition-fast);
}

.btn-secondary:hover {
  transform: translateY(-2px) scale(1.02);
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* iOS-Grade Typography System */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-system);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
}

h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: clamp(1.5rem, 3vw, 2rem); }
h4 { font-size: clamp(1.25rem, 2.5vw, 1.5rem); }

p {
  font-family: var(--font-system);
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* Floating Animation for Hero Elements */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.floating {
  animation: float 6s ease-in-out infinite;
}

/* Pulse Animation for Interactive Elements */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
  100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
}

.pulse {
  animation: pulse 2s infinite;
}

/* Fade In Animation for Content */
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

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

/* Staggered Animation Delays */
.fade-in-up:nth-child(1) { animation-delay: 0.1s; }
.fade-in-up:nth-child(2) { animation-delay: 0.2s; }
.fade-in-up:nth-child(3) { animation-delay: 0.3s; }
.fade-in-up:nth-child(4) { animation-delay: 0.4s; }

/* Advanced Grid Layout */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

/* Loading Animation */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* Responsive Design with Advanced Breakpoints */
@media (max-width: 1024px) {
  .container { padding: 0 16px; }
  .glass-card { padding: 1.5rem; }
}

@media (max-width: 768px) {
  .container { padding: 0 12px; }
  .glass-card { padding: 1rem; }
  .btn { padding: 12px 24px; font-size: 0.9rem; }
}

@media (max-width: 480px) {
  .glass-card { padding: 0.75rem; }
  .btn { padding: 10px 20px; font-size: 0.85rem; }
}

/* Advanced Dark Theme Support */
.dark-theme {
  --primary-gradient: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  --secondary-gradient: linear-gradient(45deg, #4a5568 0%, #2d3748 100%);
  --accent-gradient: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
  --glass-bg: rgba(0, 0, 0, 0.3);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-primary: #f7fafc;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --shadow-light: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-heavy: 0 15px 35px rgba(0, 0, 0, 0.5);
}

.dark-theme body {
  background: var(--primary-gradient) !important;
  color: var(--text-primary) !important;
}

.dark-theme .glass-card,
.dark-theme div:not(.loading-screen):not(.loading-spinner):not(.spinner) {
  background: rgba(0, 0, 0, 0.4) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: var(--text-primary) !important;
}

.dark-theme h1, .dark-theme h2, .dark-theme h3, .dark-theme h4, .dark-theme h5, .dark-theme h6 {
  color: var(--text-primary) !important;
}

.dark-theme p, .dark-theme span, .dark-theme div {
  color: var(--text-secondary) !important;
}

/* Smooth theme transition */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
}

@media (prefers-color-scheme: dark) {
  :root {
    --glass-bg: rgba(0, 0, 0, 0.2);
    --glass-border: rgba(255, 255, 255, 0.1);
  }
}`;
  }

  /**
   * Generate default JavaScript when not provided
   */
  static generateDefaultJS(): string {
    return `// Advanced JavaScript for Dynamic Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Advanced website loaded with dynamic features!');
    
    // Advanced Page Loading Animation
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = \`
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading amazing content...</p>
        </div>
    \`;
    loadingScreen.style.cssText = \`
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; transition: opacity 0.5s ease;
    \`;
    document.body.appendChild(loadingScreen);
    
    // Remove loading screen after content loads
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 500);
    }, 1500);
    
    // Advanced Smooth Scrolling with Easing
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const targetPosition = target.offsetTop - 80;
                smoothScrollTo(targetPosition, 1000);
            }
        });
    });
    
    // Custom smooth scroll function with easing
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                
                // Animate counters if present
                if (entry.target.classList.contains('counter')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    const animateElements = document.querySelectorAll('.glass-card, .counter, h1, h2, h3, p, .btn');
    animateElements.forEach(el => observer.observe(el));
    
    // Advanced Counter Animation
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target')) || 100;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }
    
    // Advanced Form Validation with Real-time Feedback
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateField(this);
            });
            
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                showSuccessMessage('Form submitted successfully!');
                form.reset();
            } else {
                showErrorMessage('Please fill in all required fields correctly.');
            }
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        
        // Remove previous validation classes
        field.classList.remove('valid', 'invalid');
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        } else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        } else if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            isValid = phoneRegex.test(value.replace(/\s/g, ''));
        }
        
        field.classList.add(isValid ? 'valid' : 'invalid');
        return isValid;
    }
    
    // Mobile Menu Toggle with Animation
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Advanced iOS-Style Theme Toggle
    function createThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = \`
            <div class="theme-toggle-track">
                <div class="theme-toggle-thumb">
                    <span class="theme-icon">🌙</span>
                </div>
            </div>
        \`;
        themeToggle.style.cssText = \`
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px;
            width: 50px; height: 26px; cursor: pointer; transition: all 0.3s ease;
            display: flex; align-items: center; padding: 2px;
        \`;
        
        const track = themeToggle.querySelector('.theme-toggle-track');
        track.style.cssText = \`
            width: 100%; height: 100%; position: relative; border-radius: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        \`;
        
        const thumb = themeToggle.querySelector('.theme-toggle-thumb');
        thumb.style.cssText = \`
            width: 20px; height: 20px; background: white; border-radius: 50%;
            position: absolute; left: 2px; top: 50%; transform: translateY(-50%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        \`;
        
        const icon = themeToggle.querySelector('.theme-icon');
        icon.style.cssText = \`font-size: 10px; transition: all 0.3s ease;\`;
        
        document.body.appendChild(themeToggle);
        
        // Theme toggle functionality
        let isDark = localStorage.getItem('theme') === 'dark' || 
                     (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        function updateTheme() {
            if (isDark) {
                document.body.classList.add('dark-theme');
                thumb.style.left = '26px';
                icon.textContent = '☀️';
                track.style.background = 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)';
            } else {
                document.body.classList.remove('dark-theme');
                thumb.style.left = '2px';
                icon.textContent = '🌙';
                track.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
        
        updateTheme();
        
        themeToggle.addEventListener('click', function() {
            isDark = !isDark;
            updateTheme();
        });
    }
    
    createThemeToggle();
    
    // Advanced Button Effects
    const buttons = document.querySelectorAll('.btn, button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(1.02)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
    });
    
    // Parallax Effect for Hero Section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = \`translateY(\${scrolled * speed}px)\`;
        });
    });
    
    // Success and Error Message Functions
    function showSuccessMessage(message) {
        showMessage(message, 'success');
    }
    
    function showErrorMessage(message) {
        showMessage(message, 'error');
    }
    
    function showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = \`message \${type}\`;
        messageEl.textContent = message;
        messageEl.style.cssText = \`
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            padding: 16px 24px; border-radius: 8px; color: white;
            background: \${type === 'success' ? '#10b981' : '#ef4444'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%); transition: transform 0.3s ease;
        \`;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => messageEl.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
    
    // 🚀 REVOLUTIONARY FEATURES - INDUSTRY FIRST
    
    // 1. AI-Powered Live Website Evolution
    function initializeWebsiteEvolution() {
        const startTime = Date.now();
        let interactionCount = 0;
        
        // Track user interactions
        document.addEventListener('click', () => interactionCount++);
        document.addEventListener('scroll', () => interactionCount++);
        
        // Adaptive layout optimization
        setInterval(() => {
            const timeSpent = Date.now() - startTime;
            const interactionRate = interactionCount / (timeSpent / 1000);
            
            if (interactionRate > 0.5) {
                // High engagement - make elements more prominent
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.style.transform = 'scale(1.05)';
                    btn.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                });
            }
        }, 10000);
    }
    
    // 2. Quantum-Level Design System
    function initializeQuantumDesign() {
        // Fractal-based responsive scaling
        function updateFractalScaling() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const ratio = vw / vh;
            
            document.documentElement.style.setProperty('--fractal-scale', \`\${Math.log(ratio) + 1}\`);
            document.documentElement.style.setProperty('--quantum-spacing', \`\${8 * Math.sqrt(ratio)}px\`);
        }
        
        window.addEventListener('resize', updateFractalScaling);
        updateFractalScaling();
        
        // Emotional color adaptation (based on time of day)
        function updateEmotionalColors() {
            const hour = new Date().getHours();
            let hue, saturation, lightness;
            
            if (hour >= 6 && hour < 12) {
                // Morning - energizing colors
                hue = 200; saturation = 70; lightness = 60;
            } else if (hour >= 12 && hour < 18) {
                // Afternoon - productive colors
                hue = 220; saturation = 60; lightness = 55;
            } else if (hour >= 18 && hour < 22) {
                // Evening - warm colors
                hue = 30; saturation = 65; lightness = 50;
            } else {
                // Night - calming colors
                hue = 240; saturation = 40; lightness = 30;
            }
            
            document.documentElement.style.setProperty('--emotional-primary', \`hsl(\${hue}, \${saturation}%, \${lightness}%)\`);
            document.documentElement.style.setProperty('--emotional-secondary', \`hsl(\${hue + 30}, \${saturation - 10}%, \${lightness + 10}%)\`);
        }
        
        updateEmotionalColors();
        setInterval(updateEmotionalColors, 300000); // Update every 5 minutes
    }
    
    // 3. Neural Interaction Patterns
    function initializeNeuralPatterns() {
        let mouseHistory = [];
        let scrollHistory = [];
        
        // Predictive UI elements
        document.addEventListener('mousemove', (e) => {
            mouseHistory.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            if (mouseHistory.length > 10) mouseHistory.shift();
            
            // Predict next mouse position
            if (mouseHistory.length >= 3) {
                const recent = mouseHistory.slice(-3);
                const deltaX = recent[2].x - recent[0].x;
                const deltaY = recent[2].y - recent[0].y;
                
                // Show predictive hints near predicted position
                const predictedX = e.clientX + deltaX;
                const predictedY = e.clientY + deltaY;
                
                const elementsAtPredicted = document.elementsFromPoint(predictedX, predictedY);
                elementsAtPredicted.forEach(el => {
                    if (el.tagName === 'BUTTON' || el.classList.contains('btn')) {
                        el.style.transform = 'scale(1.02)';
                        el.style.transition = 'all 0.1s ease';
                    }
                });
            }
        });
        
        // Gesture-based navigation
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Swipe gestures
            if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
                if (deltaX > 0) {
                    // Swipe right - go to previous section
                    const sections = document.querySelectorAll('section');
                    const currentSection = Array.from(sections).find(s => s.getBoundingClientRect().top >= 0);
                    const currentIndex = Array.from(sections).indexOf(currentSection);
                    if (currentIndex > 0) {
                        sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // Swipe left - go to next section
                    const sections = document.querySelectorAll('section');
                    const currentSection = Array.from(sections).find(s => s.getBoundingClientRect().top >= 0);
                    const currentIndex = Array.from(sections).indexOf(currentSection);
                    if (currentIndex < sections.length - 1) {
                        sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    }
    
    // 4. Dimensional Web Experiences
    function initializeDimensionalExperiences() {
        // 3D Parallax layers
        const parallaxElements = document.querySelectorAll('.glass-card, .btn, h1, h2, h3');
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
            
            parallaxElements.forEach((el, index) => {
                const depth = (index + 1) * 0.1;
                const translateX = mouseX * depth * 20;
                const translateY = mouseY * depth * 20;
                const rotateX = mouseY * depth * 5;
                const rotateY = mouseX * depth * 5;
                
                el.style.transform = \`translate3d(\${translateX}px, \${translateY}px, 0) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg)\`;
                el.style.transition = 'transform 0.1s ease-out';
            });
        });
        
        // Particle system
        function createParticleSystem() {
            const canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1';
            canvas.style.opacity = '0.3';
            document.body.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const particles = [];
            
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
            
            function animateParticles() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                    
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = \`rgba(59, 130, 246, \${particle.opacity})\`;
                    ctx.fill();
                });
                
                requestAnimationFrame(animateParticles);
            }
            
            animateParticles();
        }
        
        createParticleSystem();
    }
    
    // 5. Biometric-Responsive Design (when APIs available)
    function initializeBiometricResponsive() {
        // Circadian rhythm optimization
        function updateCircadianTheme() {
            const hour = new Date().getHours();
            const isNightTime = hour >= 20 || hour <= 6;
            
            if (isNightTime) {
                document.body.classList.add('circadian-night');
                document.documentElement.style.setProperty('--circadian-brightness', '0.8');
                document.documentElement.style.setProperty('--circadian-contrast', '0.9');
            } else {
                document.body.classList.remove('circadian-night');
                document.documentElement.style.setProperty('--circadian-brightness', '1');
                document.documentElement.style.setProperty('--circadian-contrast', '1');
            }
        }
        
        updateCircadianTheme();
        setInterval(updateCircadianTheme, 600000); // Update every 10 minutes
        
        // Adaptive accessibility
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'camera' }).then(result => {
                if (result.state === 'granted') {
                    // Could implement eye-tracking for accessibility
                    console.log('🎯 Advanced accessibility features available');
                }
            });
        }
    }
    
    // 6. Quantum Performance Optimization
    function initializeQuantumOptimization() {
        // Self-healing code
        window.addEventListener('error', (e) => {
            console.log('🔧 Self-healing: Attempting to fix error', e.error);
            
            // Try to recover from common errors
            if (e.error.message.includes('undefined')) {
                // Reinitialize components
                setTimeout(() => {
                    location.reload();
                }, 5000);
            }
        });
        
        // Predictive resource loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Preload resources for next sections
                    const nextSections = Array.from(document.querySelectorAll('section'))
                        .slice(Array.from(document.querySelectorAll('section')).indexOf(entry.target) + 1, 
                               Array.from(document.querySelectorAll('section')).indexOf(entry.target) + 3);
                    
                    nextSections.forEach(section => {
                        const images = section.querySelectorAll('img[data-src]');
                        images.forEach(img => {
                            img.src = img.dataset.src;
                        });
                    });
                }
            });
        });
        
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
        
        // Dynamic performance monitoring
        let performanceScore = 100;
        
        setInterval(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                if (loadTime > 3000) {
                    performanceScore -= 10;
                    // Optimize by reducing animations
                    document.documentElement.style.setProperty('--animation-duration', '0.1s');
                } else if (loadTime < 1000) {
                    performanceScore = Math.min(100, performanceScore + 5);
                    // Restore full animations
                    document.documentElement.style.setProperty('--animation-duration', '0.3s');
                }
            }
        }, 5000);
    }
    
    // 🎨 iOS-Level Form & UI Enhancements
    function enhanceFormsAndUI() {
        // Convert basic forms to iOS-level forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.classList.add('contact-form');
            
            // Enhance input fields
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.classList.add('form-input');
                
                // Create floating label if not exists
                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('form-label')) {
                    const label = document.createElement('label');
                    label.classList.add('form-label');
                    label.textContent = input.placeholder || input.name || 'Enter value';
                    input.placeholder = ' '; // Keep space for CSS selector
                    
                    // Wrap in form group
                    const group = document.createElement('div');
                    group.classList.add('form-group');
                    input.parentNode.insertBefore(group, input);
                    group.appendChild(input);
                    group.appendChild(label);
                }
            });
            
            // Enhance submit buttons
            const submitBtns = form.querySelectorAll('input[type="submit"], button[type="submit"]');
            submitBtns.forEach(btn => {
                btn.classList.add('submit-btn');
                if (btn.textContent === 'Submit' || btn.value === 'Submit') {
                    btn.textContent = '✨ Send Message';
                    btn.value = '✨ Send Message';
                }
            });
        });
        
        // Convert basic anchor links to professional buttons
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            // Skip if already styled or is an email/phone link
            if (link.classList.contains('footer-link') || 
                link.classList.contains('nav-link') || 
                link.href.includes('mailto:') || 
                link.href.includes('tel:')) {
                return;
            }
            
            // Convert navigation links
            if (link.closest('nav') || link.closest('header')) {
                link.classList.add('nav-link');
            }
            // Convert footer links
            else if (link.closest('footer')) {
                link.classList.add('footer-link');
                
                // Add SVG icons for common links
                const text = link.textContent.toLowerCase();
                let svgIcon = '';
                
                if (text.includes('facebook')) {
                    svgIcon = '<svg class="social-icon" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
                } else if (text.includes('twitter')) {
                    svgIcon = '<svg class="social-icon" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>';
                } else if (text.includes('linkedin')) {
                    svgIcon = '<svg class="social-icon" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
                } else if (text.includes('instagram')) {
                    svgIcon = '<svg class="social-icon" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';
                } else if (text.includes('email') || text.includes('contact')) {
                    svgIcon = '<svg class="social-icon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';
                } else if (text.includes('phone') || text.includes('call')) {
                    svgIcon = '<svg class="social-icon" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';
                }
                
                if (svgIcon) {
                    link.innerHTML = svgIcon + link.textContent;
                }
            }
            // Convert other links to buttons
            else {
                link.style.cssText = \`
                    display: inline-flex !important;
                    align-items: center !important;
                    padding: 12px 24px !important;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    color: white !important;
                    text-decoration: none !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
                    margin: 4px !important;
                \`;
                
                link.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-3px) scale(1.05)';
                    this.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.6)';
                });
                
                link.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                    this.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                });
            }
        });
        
        // Enhance headers and footers
        const headers = document.querySelectorAll('header, nav');
        headers.forEach(header => {
            if (!header.style.position) {
                header.style.cssText = \`
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 1000 !important;
                    backdrop-filter: blur(20px) !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                \`;
            }
        });
        
        const footers = document.querySelectorAll('footer');
        footers.forEach(footer => {
            // Create footer sections for better organization
            const sections = footer.querySelectorAll('div, p');
            sections.forEach(section => {
                if (!section.classList.contains('footer-section')) {
                    section.classList.add('footer-section');
                }
            });
        });
    }
    
    // Initialize all revolutionary features
    initializeWebsiteEvolution();
    initializeQuantumDesign();
    initializeNeuralPatterns();
    initializeDimensionalExperiences();
    initializeBiometricResponsive();
    initializeQuantumOptimization();
    enhanceFormsAndUI();
    
    // Initialize all dynamic features
    console.log('🚀 Revolutionary features initialized - Industry-first capabilities active!');
});`;
  }

  /**
   * Intelligent editing of existing website based on user request
   */
  static async editExistingWebsite(
    userRequest: string,
    existingFiles: { html: string; css: string; js: string },
    stylePreferences?: any
  ): Promise<{ html: string; css: string; js: string }> {
    console.log('🎯 Analyzing edit request:', userRequest);
    
    // Analyze what the user wants to change
    const editType = this.analyzeEditRequest(userRequest);
    console.log('📝 Edit type detected:', editType);
    
    try {
      // Create intelligent edit prompt
      const editPrompt = this.buildEditPrompt(userRequest, existingFiles, editType, stylePreferences);
      
      // Use AI to generate the edited version
      const editedResponse = await aiService.generateCode(editPrompt);
      
      // Extract the edited files
      const editedFiles = this.extractMultiFileFromResponse(editedResponse);
      
      // If extraction fails, apply manual edits
      if (!editedFiles.html || !editedFiles.css || !editedFiles.js) {
        console.log('🔧 AI edit failed, applying manual edits...');
        return this.applyManualEdits(userRequest, existingFiles, editType);
      }
      
      console.log('✅ Intelligent edit completed successfully!');
      return editedFiles;
      
    } catch (error) {
      console.warn('⚠️ AI edit failed, applying manual edits...', error);
      return this.applyManualEdits(userRequest, existingFiles, editType);
    }
  }

  /**
   * Analyze user request to determine edit type
   */
  static analyzeEditRequest(userRequest: string): string {
    const request = userRequest.toLowerCase();
    
    // Color changes
    if (request.includes('color') || request.includes('theme') || request.includes('blue') || 
        request.includes('red') || request.includes('green') || request.includes('purple')) {
      return 'color_change';
    }
    
    // Content changes
    if (request.includes('text') || request.includes('content') || request.includes('title') || 
        request.includes('description') || request.includes('copy')) {
      return 'content_change';
    }
    
    // Section additions
    if (request.includes('add') || request.includes('include') || request.includes('new section')) {
      return 'add_section';
    }
    
    // Section removal
    if (request.includes('remove') || request.includes('delete') || request.includes('take out')) {
      return 'remove_section';
    }
    
    // Layout changes
    if (request.includes('layout') || request.includes('design') || request.includes('structure')) {
      return 'layout_change';
    }
    
    // Animation changes
    if (request.includes('animation') || request.includes('effect') || request.includes('transition')) {
      return 'animation_change';
    }
    
    // Default to general improvement
    return 'general_improvement';
  }

  /**
   * Build intelligent edit prompt
   */
  static buildEditPrompt(
    userRequest: string,
    existingFiles: { html: string; css: string; js: string },
    editType: string,
    stylePreferences?: any
  ): string {
    return `You are an expert web developer. The user wants to edit their existing website.

USER REQUEST: "${userRequest}"
EDIT TYPE: ${editType}

CURRENT WEBSITE FILES:
===== CURRENT HTML =====
${existingFiles.html}

===== CURRENT CSS =====
${existingFiles.css.substring(0, 2000)}...

===== CURRENT JS =====
${existingFiles.js.substring(0, 1000)}...

INSTRUCTIONS:
1. Analyze the user's request carefully
2. Make ONLY the requested changes while preserving everything else
3. Maintain the existing design quality and structure
4. Keep all existing sections unless specifically asked to remove them
5. If adding new content, make it match the existing style perfectly
6. Ensure all changes are professional and high-quality

OUTPUT THE COMPLETE EDITED FILES in this EXACT format:
===== FILE: index.html =====
[Complete edited HTML file]

===== FILE: styles.css =====
[Complete edited CSS file]

===== FILE: script.js =====
[Complete edited JS file]

CRITICAL: Output the COMPLETE files, not just the changes!`;
  }

  /**
   * Apply manual edits when AI fails
   */
  static applyManualEdits(
    userRequest: string,
    existingFiles: { html: string; css: string; js: string },
    editType: string
  ): { html: string; css: string; js: string } {
    console.log('🔧 Applying manual edits for:', editType);
    
    let { html, css, js } = existingFiles;
    const request = userRequest.toLowerCase();
    
    // Apply color changes
    if (editType === 'color_change') {
      if (request.includes('blue')) {
        css = css.replace(/--primary-color: [^;]+;/g, '--primary-color: #3b82f6;');
        css = css.replace(/rgb\(59, 130, 246\)/g, 'rgb(59, 130, 246)');
      } else if (request.includes('red')) {
        css = css.replace(/--primary-color: [^;]+;/g, '--primary-color: #ef4444;');
        css = css.replace(/rgb\(59, 130, 246\)/g, 'rgb(239, 68, 68)');
      } else if (request.includes('green')) {
        css = css.replace(/--primary-color: [^;]+;/g, '--primary-color: #10b981;');
        css = css.replace(/rgb\(59, 130, 246\)/g, 'rgb(16, 185, 129)');
      } else if (request.includes('purple')) {
        css = css.replace(/--primary-color: [^;]+;/g, '--primary-color: #8b5cf6;');
        css = css.replace(/rgb\(59, 130, 246\)/g, 'rgb(139, 92, 246)');
      }
    }
    
    // Apply content changes
    if (editType === 'content_change') {
      if (request.includes('title')) {
        html = html.replace(/<h1[^>]*>([^<]+)<\/h1>/g, '<h1 class="hero-title">Updated Title</h1>');
      }
    }
    
    // Add sections
    if (editType === 'add_section') {
      if (request.includes('testimonial')) {
        const testimonialSection = `
        <section class="testimonials section">
          <div class="container">
            <h2>What Our Clients Say</h2>
            <div class="testimonial-grid">
              <div class="testimonial-card glass-card">
                <p>"Amazing service and quality!"</p>
                <div class="testimonial-author">
                  <strong>John Doe</strong>
                  <span>CEO, Company</span>
                </div>
              </div>
            </div>
          </div>
        </section>`;
        html = html.replace('</main>', testimonialSection + '</main>');
      }
    }
    
    return { html, css, js };
  }

  /**
   * Emergency fallback template when all AI services fail
   */
  static generateEmergencyTemplate(userRequest: string, stylePreferences?: any): string {
    console.log('🚨 Generating emergency fallback template...');
    
    const siteName = this.extractSiteName(userRequest) || 'Your Website';
    
    return '===== FILE: index.html =====\n' +
      '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '    <meta charset="UTF-8">\n' +
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '    <title>' + siteName + '</title>\n' +
      '    <link rel="stylesheet" href="styles.css">\n' +
      '</head>\n' +
      '<body>\n' +
      '    <header class="header">\n' +
      '        <nav class="nav">\n' +
      '            <div class="logo">' + siteName + '</div>\n' +
      '            <div class="nav-links">\n' +
      '                <a href="#home" class="nav-link">Home</a>\n' +
      '                <a href="#about" class="nav-link">About</a>\n' +
      '                <a href="#contact" class="nav-link">Contact</a>\n' +
      '            </div>\n' +
      '        </nav>\n' +
      '    </header>\n' +
      '    <main>\n' +
      '        <section id="home" class="hero">\n' +
      '            <div class="hero-content">\n' +
      '                <h1 class="hero-title">Welcome to ' + siteName + '</h1>\n' +
      '                <p class="hero-description">Professional website solution</p>\n' +
      '                <button class="cta-btn">Get Started</button>\n' +
      '            </div>\n' +
      '        </section>\n' +
      '        <section id="about" class="section">\n' +
      '            <div class="container">\n' +
      '                <h2>About Us</h2>\n' +
      '                <p>We provide exceptional services tailored to your needs.</p>\n' +
      '            </div>\n' +
      '        </section>\n' +
      '        <section id="contact" class="section">\n' +
      '            <div class="container">\n' +
      '                <h2>Get in Touch</h2>\n' +
      '                <form class="form">\n' +
      '                    <input type="text" placeholder="Name" required>\n' +
      '                    <input type="email" placeholder="Email" required>\n' +
      '                    <button type="submit">Send Message</button>\n' +
      '                </form>\n' +
      '            </div>\n' +
      '        </section>\n' +
      '    </main>\n' +
      '    <footer class="footer">\n' +
      '        <p>&copy; 2024 ' + siteName + '. All rights reserved.</p>\n' +
      '    </footer>\n' +
      '</body>\n' +
      '</html>\n\n' +
      '===== FILE: styles.css =====\n' +
      '* { margin: 0; padding: 0; box-sizing: border-box; }\n' +
      'body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }\n' +
      '.header { position: sticky; top: 0; background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); padding: 1rem 2rem; }\n' +
      '.nav { display: flex; justify-content: space-between; align-items: center; }\n' +
      '.logo { font-size: 1.5rem; font-weight: bold; }\n' +
      '.nav-links { display: flex; gap: 1rem; }\n' +
      '.nav-link { color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.3s; }\n' +
      '.nav-link:hover { background: rgba(255,255,255,0.2); }\n' +
      '.hero { min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; }\n' +
      '.hero-title { font-size: 3rem; margin-bottom: 1rem; }\n' +
      '.hero-description { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }\n' +
      '.cta-btn, button { background: linear-gradient(135deg, #3b82f6, #8b5cf6); border: none; padding: 1rem 2rem; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; }\n' +
      '.cta-btn:hover, button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.3); }\n' +
      '.section { padding: 4rem 2rem; }\n' +
      '.container { max-width: 1200px; margin: 0 auto; }\n' +
      '.form { display: flex; flex-direction: column; gap: 1rem; max-width: 500px; margin: 0 auto; }\n' +
      '.form input { padding: 1rem; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; }\n' +
      '.footer { background: rgba(0,0,0,0.3); padding: 2rem; text-align: center; }\n\n' +
      '===== FILE: script.js =====\n' +
      'document.addEventListener("DOMContentLoaded", function() {\n' +
      '    console.log("Emergency template loaded successfully!");\n' +
      '    const form = document.querySelector(".form");\n' +
      '    if (form) {\n' +
      '        form.addEventListener("submit", function(e) {\n' +
      '            e.preventDefault();\n' +
      '            alert("Thank you for your message!");\n' +
      '        });\n' +
      '    }\n' +
      '});';
  }

  /**
   * Extract site name from user request
   */
  static extractSiteName(userRequest: string): string {
    const request = userRequest.toLowerCase();
    
    // Look for common patterns
    if (request.includes('portfolio')) return 'Portfolio';
    if (request.includes('business')) return 'Business Solutions';
    if (request.includes('restaurant')) return 'Restaurant';
    if (request.includes('agency')) return 'Creative Agency';
    if (request.includes('startup')) return 'Startup';
    if (request.includes('blog')) return 'Blog';
    if (request.includes('shop') || request.includes('store')) return 'Online Store';
    
    // Default fallback
    return 'Professional Website';
  }

  /**
   * Convert single HTML file to multi-file structure with PROFESSIONAL ENHANCEMENT
   */
  static convertSingleToMultiFile(html: string): { html: string; css: string; js: string } {
    console.log('🔄 Converting single HTML to PROFESSIONAL multi-file structure...');
    
    // Extract CSS from style tags
    const cssMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let extractedCSS = '';
    if (cssMatches) {
      extractedCSS = cssMatches.map(match => 
        match.replace(/<\/?style[^>]*>/gi, '')
      ).join('\n\n');
    }
    
    // Extract JavaScript from script tags
    const jsMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    let extractedJS = '';
    if (jsMatches) {
      extractedJS = jsMatches.map(match => 
        match.replace(/<\/?script[^>]*>/gi, '')
      ).join('\n\n');
    }
    
    // Clean HTML by removing style and script tags
    let cleanHTML = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // FORCE PROFESSIONAL HTML STRUCTURE
    cleanHTML = this.enhanceHTMLStructure(cleanHTML);
    
    // Add CSS and JS links to HTML head
    if (!cleanHTML.includes('styles.css')) {
      cleanHTML = cleanHTML.replace(
        '</head>',
        '  <link rel="stylesheet" href="styles.css">\n</head>'
      );
    }
    
    if (!cleanHTML.includes('script.js')) {
      cleanHTML = cleanHTML.replace(
        '</body>',
        '  <script src="script.js"></script>\n</body>'
      );
    }
    
    // FORCE PROFESSIONAL CSS - Always use advanced CSS regardless of extracted content
    const css = this.generateProfessionalCSS(extractedCSS);
    const js = this.generateProfessionalJS(extractedJS);
    
    console.log('✅ PROFESSIONAL conversion complete - Enhanced HTML, Advanced CSS, Interactive JS');
    return { html: cleanHTML, css, js };
  }

  /**
   * Enhance HTML structure to be more professional
   */
  static enhanceHTMLStructure(html: string): string {
    // Add professional classes to common elements
    html = html.replace(/<div([^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('class=')) {
        return `<div class="glass-card"${attrs}>`;
      }
      return match;
    });
    
    // Add professional classes to buttons
    html = html.replace(/<button([^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('class=')) {
        return `<button class="btn pulse"${attrs}>`;
      }
      return match;
    });
    
    // Add animation classes to headings
    html = html.replace(/<h([1-6])([^>]*)>/gi, (match, level, attrs) => {
      if (!attrs.includes('class=')) {
        return `<h${level} class="fade-in-up"${attrs}>`;
      }
      return match;
    });
    
    // Add animation classes to paragraphs
    html = html.replace(/<p([^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('class=')) {
        return `<p class="fade-in-up"${attrs}>`;
      }
      return match;
    });
    
    return html;
  }

  /**
   * Generate PROFESSIONAL CSS that combines extracted CSS with advanced features
   */
  static generateProfessionalCSS(extractedCSS: string): string {
    const advancedCSS = this.generateDefaultCSS();
    
    if (extractedCSS && extractedCSS.trim()) {
      // Combine extracted CSS with professional enhancements
      return advancedCSS + '\n\n/* ========== EXTRACTED STYLES ========== */\n' + extractedCSS;
    }
    
    return advancedCSS;
  }

  /**
   * Generate PROFESSIONAL JavaScript that combines extracted JS with advanced features
   */
  static generateProfessionalJS(extractedJS: string): string {
    const advancedJS = this.generateDefaultJS();
    
    if (extractedJS && extractedJS.trim()) {
      // Combine extracted JS with professional enhancements
      return `${advancedJS}

// ========== EXTRACTED JAVASCRIPT (ENHANCED) ==========
${extractedJS}

// ========== PROFESSIONAL ENHANCEMENTS ==========
// Force professional interactions on all elements
document.addEventListener('DOMContentLoaded', function() {
    // Force hover effects on all interactive elements
    const interactiveElements = document.querySelectorAll('button, .btn, a, input, textarea, select');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });
    });
    
    // Force fade-in animations on all content
    const allElements = document.querySelectorAll('div, p, h1, h2, h3, h4, h5, h6');
    allElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});`;
    }
    
    return advancedJS;
  }

  /**
   * Extract HTML from potential markdown code blocks (fallback method)
   */
  static extractHtmlFromResponse(response: string): string {
    // Try to extract from ```html ... ``` blocks first
    const htmlMatch = response.match(/```(?:html)?\s*([\s\S]*?)```/);
    if (htmlMatch) {
      return htmlMatch[1].trim();
    }
    
    // If no code block, check if it starts with <!DOCTYPE
    if (response.trim().startsWith('<!DOCTYPE')) {
      return response.trim();
    }
    
    // Otherwise return as-is (might still be valid HTML)
    return response.trim();
  }

  /**
   * Combine multi-file structure into a single HTML file for preview
   */
  static combineFilesForPreview(files: { html: string; css: string; js: string }): string {
    if (!files.css && !files.js) {
      return files.html; // Already a complete HTML file
    }

    // Insert CSS and JS into the HTML
    let combinedHtml = files.html;
    
    // Add CSS to head
    if (files.css) {
      const styleTag = `<style>\n${files.css}\n</style>`;
      if (combinedHtml.includes('</head>')) {
        combinedHtml = combinedHtml.replace('</head>', `  ${styleTag}\n</head>`);
      } else {
        combinedHtml = styleTag + '\n' + combinedHtml;
      }
    }
    
    // Add JS before closing body tag
    if (files.js) {
      const scriptTag = `<script>\n${files.js}\n</script>`;
      if (combinedHtml.includes('</body>')) {
        combinedHtml = combinedHtml.replace('</body>', `  ${scriptTag}\n</body>`);
      } else {
        combinedHtml = combinedHtml + '\n' + scriptTag;
      }
    }
    
    return combinedHtml;
  }

  /**
   * Validate and fix common HTML issues
   */
  static validateAndFixHtml(html: string): string {
    let fixed = html;

    // Ensure proper DOCTYPE
    if (!fixed.toLowerCase().includes('<!doctype')) {
      fixed = '<!DOCTYPE html>\n' + fixed;
    }

    // Ensure proper meta tags
    if (!fixed.includes('charset')) {
      fixed = fixed.replace(
        '<head>',
        '<head>\n  <meta charset="UTF-8">'
      );
    }

    if (!fixed.includes('viewport')) {
      fixed = fixed.replace(
        '<head>',
        '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">'
      );
    }

    return fixed;
  }
}
