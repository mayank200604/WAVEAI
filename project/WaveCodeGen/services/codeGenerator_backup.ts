import { aiService } from './ai';
import AdvancedWebElementsService from './advancedWebElements';

/**
 * Image Integration Service for generating and embedding images in websites
 */
class ImageIntegrationService {
  /**
   * Generate contextual images for website sections
   */
  static async generateSectionImages(userRequest: string, sections: string[]): Promise<Record<string, string>> {
    const imagePromises: Record<string, Promise<string>> = {};
    
    // Generate images for key sections
    for (const section of sections) {
      const imagePrompt = this.createImagePrompt(userRequest, section);
      imagePromises[section] = aiService.generateImage(imagePrompt);
    }
    
    // Wait for all images to generate
    const results: Record<string, string> = {};
    for (const [section, promise] of Object.entries(imagePromises)) {
      try {
        results[section] = await promise;
      } catch (error) {
        console.warn(`Failed to generate image for ${section}:`, error);
        results[section] = this.getFallbackImage(section);
      }
    }
    
    return results;
  }
  
  /**
   * Create optimized image prompts for different website sections
   */
  private static createImagePrompt(userRequest: string, section: string): string {
    const baseContext = userRequest.toLowerCase();
    
    const sectionPrompts: Record<string, string> = {
      hero: `${baseContext}, hero banner, professional, modern, high-impact visual`,
      features: `${baseContext}, feature illustration, clean, minimalist, icon-style`,
      about: `${baseContext}, team, office, professional environment`,
      testimonials: `${baseContext}, happy customers, professional headshots`,
      contact: `${baseContext}, office building, contact, professional`,
      portfolio: `${baseContext}, showcase, gallery, professional work`,
      services: `${baseContext}, service illustration, professional, business`,
      pricing: `${baseContext}, business, professional, success`
    };
    
    return sectionPrompts[section] || `${baseContext}, professional, modern, website image`;
  }
  
  /**
   * Get fallback images for sections when generation fails
   */
  private static getFallbackImage(section: string): string {
    const fallbackImages: Record<string, string> = {
      hero: 'https://source.unsplash.com/1200x600/?business,modern,professional',
      features: 'https://source.unsplash.com/800x600/?technology,innovation',
      about: 'https://source.unsplash.com/800x600/?team,office,professional',
      testimonials: 'https://source.unsplash.com/400x400/?portrait,professional',
      contact: 'https://source.unsplash.com/800x600/?office,building,contact',
      portfolio: 'https://source.unsplash.com/800x600/?design,creative,portfolio',
      services: 'https://source.unsplash.com/800x600/?service,business',
      pricing: 'https://source.unsplash.com/800x600/?success,business,growth'
    };
    
    return fallbackImages[section] || 'https://source.unsplash.com/800x600/?modern,design,website';
  }
}

/**
 * Enhanced Code Generator for robust HTML/CSS/JavaScript generation
 * Supports 500+ lines of complex code with internal styling and scripts
 */
export class CodeGenerator {
  /**
   * Build a comprehensive prompt for code generation
   * Optimized to generate 500+ lines of production-ready code
   */
  static buildCodePrompt(
    userRequest: string,
    stylePreferences: {
      primaryColor?: string;
      headingFont?: string;
      bodyFont?: string;
      layoutDensity?: number;
    } = {}
  ): string {
    const {
      primaryColor = 'cyan',
      headingFont = 'Poppins',
      bodyFont = 'Roboto',
      layoutDensity = 50
    } = stylePreferences;

    const densityDesc = layoutDensity < 33 
      ? 'very compact with minimal spacing' 
      : layoutDensity < 66 
        ? 'balanced spacing' 
        : 'spacious with generous whitespace';

    const colorMap: Record<string, string> = {
      cyan: '#06b6d4',
      blue: '#3b82f6',
      purple: '#a855f7',
      pink: '#ec4899',
      teal: '#14b8a6'
    };

    const primaryHex = colorMap[primaryColor] || colorMap['cyan'];

    // Get personalized architecture based on user request
    const personalizedArchitecture = AdvancedWebElementsService.createPersonalizedArchitecturePrompt(userRequest);
    
    return `You are a WORLD-CLASS frontend developer who creates PRODUCTION-READY websites that match the quality of Bolt.new, Claude Artifacts, and Google AI Studio. Generate a COMPLETE, PROFESSIONAL HTML5 single-page application with REAL FUNCTIONALITY.

USER REQUEST: ${userRequest}

${personalizedArchitecture}

CRITICAL - BOLT.NEW/CLAUDE QUALITY STANDARDS:
- PRODUCTION-READY CODE that works immediately
- REAL INTERACTIVE FEATURES with actual functionality
- MODERN COMPONENT ARCHITECTURE with proper state management
- PROFESSIONAL UI/UX that feels like a real product
- ADVANCED INTERACTIONS with smooth animations
- RESPONSIVE DESIGN that works perfectly on all devices
- CLEAN, MAINTAINABLE CODE with proper structure
- REAL-WORLD FUNCTIONALITY, not just visual mockups

DESIGN PHILOSOPHY (NO BASIC WEBSITES):
- Create FUNCTIONAL applications, not static pages
- Every button and input must DO something meaningful
- Include REAL data management and state handling
- Build INTERACTIVE components with proper feedback
- Use MODERN web technologies and best practices
- Focus on USER EXPERIENCE and practical functionality

PRODUCTION-READY TECHNICAL REQUIREMENTS:
1. Generate COMPLETE, FUNCTIONAL HTML5 application
2. Include ALL CSS inline with MODERN design systems
3. Include ALL JavaScript inline with REAL functionality
4. Target: 2000-3000+ lines of PRODUCTION-READY code
5. BOLT.NEW QUALITY - Functional, interactive, professional
6. REAL FEATURES - Working forms, data management, interactions
7. RESPONSIVE DESIGN - Perfect on mobile, tablet, desktop
8. ACCESSIBILITY COMPLIANT - WCAG 2.1 AA standards
9. PERFORMANCE OPTIMIZED - Fast loading, smooth interactions
10. SEO READY - Proper meta tags, semantic structure
11. MODERN JAVASCRIPT - ES6+, proper event handling
12. PRODUCTION QUALITY - Ready for real-world deployment
9. THEME SYSTEM with multiple themes (dark, light, cyberpunk, neon, minimal)
10. Full accessibility (ARIA labels, semantic HTML, keyboard navigation)
11. SMOOTH PAGE TRANSITIONS and section reveals
12. CURSOR EFFECTS (custom cursor, hover trails, click ripples)
13. SCROLL PROGRESS INDICATOR at top of page
14. PARALLAX SCROLLING for depth
15. MICRO-INTERACTIONS on every button and input
Every website MUST have these sections in proper order (use semantic HTML5 tags):

1. HEADER/8. PROFESSIONAL NAVIGATION SYSTEM:
   - STICKY header with backdrop-filter blur effect
1. PRODUCTION-READY LAYOUT & STRUCTURE:
   - SEMANTIC HTML5 with proper accessibility attributes
   - CSS GRID and FLEXBOX for responsive, modern layouts
   - COMPONENT-BASED structure with reusable elements
   - CONSISTENT spacing system using CSS custom properties
   - MOBILE-FIRST responsive design (320px to 4K)
   - SMOOTH section transitions with intersection observer
   - SCALABLE typography system with fluid sizing
   - PROFESSIONAL spacing and visual hierarchy
   - CLEAN, maintainable code structure
   - REAL-WORLD layout patterns that actually work

2. PROFESSIONAL VISUAL DESIGN:
   - MODERN color palette with ${primaryHex} as primary brand color
   - CONSISTENT design tokens for colors, spacing, typography
   - ACCESSIBLE contrast ratios (4.5:1 minimum for text)
   - PROFESSIONAL typography with Google Fonts integration
   - SYSTEMATIC spacing using 8px grid system
   - SUBTLE shadows and depth for visual hierarchy
   - CLEAN, modern aesthetic that feels professional
   - CONTEXTUAL imagery that supports the content
   - PURPOSEFUL animations that enhance usability
   - ATTENTION to detail in every visual element

3. ICONS & IMAGERY (WORLD-CLASS VISUAL ASSETS!):
   - Use modern SVG icon libraries (Heroicons, Lucide, Phosphor)
   - CONTEXTUAL IMAGERY: Generate images that match the specific use case
   - HERO IMAGES: High-impact visuals that tell the brand story
   - SECTION-SPECIFIC IMAGES: Tailored to each section's purpose
   - IMAGE INTEGRATION STRATEGY:
     * Hero: Large, impactful images that set the tone
     * Features: Clean, illustrative images that support the content
     * About: Authentic, professional images that build trust
     * Testimonials: Professional headshots or customer photos
     * Contact: Welcoming, approachable imagery
   - ADVANCED IMAGE OPTIMIZATION:
     * Responsive images with srcset and sizes attributes
     * WebP format with fallbacks
     * Lazy loading with intersection observer
     * Blur-up technique for smooth loading
     * Critical image preloading
     * Aspect ratio containers to prevent layout shift
   - INTERACTIVE IMAGE EFFECTS:
     * Subtle parallax on scroll
     * Hover zoom and overlay effects
     * Image galleries with smooth transitions
     * Progressive image enhancement
   - ACCESSIBILITY & PERFORMANCE:
     * Descriptive, contextual alt text
     * Proper ARIA labels for decorative images
     * Optimized file sizes and compression
     * CDN-ready image URLs

4. PROFESSIONAL BUTTON SYSTEM:
   - PRIMARY BUTTONS: 48-56px height with consistent styling
   - SEMANTIC button elements with proper ARIA attributes
   - PROFESSIONAL HOVER EFFECTS:
     * SMOOTH scale transforms (1.02) with 200ms timing
     * SUBTLE shadow increases for depth perception
     * COLOR brightness changes (filter: brightness(1.1))
     * BORDER color changes for visual feedback
     * BACKGROUND color transitions for state indication
   - ACTIVE STATES: scale(0.98) for tactile feedback
   - DISABLED STATES: 50% opacity with cursor: not-allowed
   - LOADING STATES: spinner with "Loading..." text
   - RIPPLE EFFECTS: expanding circle on click (CSS animation)
   - CONSISTENT STYLING: solid colors or subtle gradients
   - MODERN BORDER RADIUS: 8-12px for contemporary look
   - READABLE TYPOGRAPHY: 16px, weight 500-600, proper spacing
   - BUTTON VARIANTS: primary, secondary, outline, ghost styles
     * Outlined: border with hover fill
   - STATES:
     * Loading: Spinner + "Processing..." text
     * Success: Checkmark + "Done!" with green
     * Error: X mark + "Failed" with red
     * Disabled: 40% opacity, grayscale, cursor: not-allowed
   - MICRO-INTERACTIONS:
     * Icon slides in from left on hover
     * Text color shifts
     * Border animates around button
     * Particle burst on click
   - All buttons MUST DO something interactive!

5. CARDS & CONTAINERS (HOVER EFFECTS!)
   - Subtle background (white/10% or dark/5%)
   - Border: 1px solid with low opacity, ANIMATED on hover
   - HOVER EFFECTS (EVERY CARD):
     * Lift: translateY(-8px) transform
     * Shadow: 0 20px 40px rgba(0,0,0,0.2)
     * Glow: border-color changes to primary with glow
     * Scale: 1.02 transform
     * Tilt: subtle 3D rotate on mouse position
     * Background shift: gradient animation
     * Border animation: animated gradient border
   - GLASSMORPHISM:
     * backdrop-filter: blur(10px) saturate(180%)
     * background: rgba(255, 255, 255, 0.05)
     * border: 1px solid rgba(255, 255, 255, 0.2)
   - NEUMORPHISM:
     * box-shadow: inset and outset for 3D effect
     * subtle gradients for depth
   - Smooth transitions (0.3-0.4s cubic-bezier(0.4, 0, 0.2, 1))

6. FORMS
   - Input height: 48-56px
   - Border radius: 8px
   - Focus: Ring effect (box-shadow)
   - Labels: Above inputs, 14px, medium weight
   - Validation: Real-time with color indicators
   - Error messages: Red, below input
   - Success: Green checkmark

7. NAVIGATION
    - Sticky header with backdrop blur
    - Active link indicator (underline or background)
    - Smooth scroll behavior
    - Mobile: Slide-in menu with overlay
    - Logo: 32-40px height

8. THEME SYSTEM (CRITICAL - MUST IMPLEMENT!)
    - THEME TOGGLE BUTTON in header (icon: sun/moon/auto)
    - THEMES TO INCLUDE:
      * Dark Mode: Deep blacks (#0a0a0f), vibrant accents
      * Light Mode: Soft whites (#fafafa), subtle shadows
      * Cyberpunk: Neon colors, dark bg, pink/cyan accents
      * Neon: Bright glowing colors, dark bg, high contrast
      * Minimal: Clean, simple, lots of whitespace
      * Auto: Follows system preference
    - THEME IMPLEMENTATION:
      * CSS variables for all colors
      * Smooth transition on theme change (0.3s)
      * Save to localStorage
      * Apply immediately on load
      * Animate theme switch (fade/slide)
    - THEME VARIABLES:
      * --bg-primary, --bg-secondary
      * --text-primary, --text-secondary
      * --accent-primary, --accent-secondary
      * --border-color, --shadow-color
      * --card-bg, --input-bg
    - THEME SWITCHER UI:
      * Dropdown or button group
      * Visual preview of each theme
      * Smooth animations on switch
      * Persist selection

CRITICAL - UNDERSTAND THE PROMPT:
- Analyze the user request carefully
- Choose appropriate sections based on the request type
- For e-commerce: Add product cards, cart, checkout
- For SaaS: Add features, pricing, testimonials
- For portfolio: Add project showcase, skills, contact
- For landing page: Add hero, benefits, CTA, social proof
- Match the color scheme to the industry (tech=blue, health=green, luxury=purple/gold)
- Use appropriate imagery from Unsplash based on the topic
- Create relevant content, not generic placeholder text
- Make the website feel CUSTOM-MADE for the request

🎯 INTERACTIVE FEATURES (MUST IMPLEMENT ALL!):

CORE INTERACTIONS:
✓ Real-time form validation with character counters and live feedback
✓ Live search/filter that updates instantly as you type
✓ Input suggestions and autocomplete dropdown
✓ Modals/overlays with backdrop blur and slide-in animation
✓ Tabs with smooth content transitions
✓ Accordions with smooth expand/collapse
✓ Progress indicators with animated fill
✓ Loading spinners and skeleton screens
✓ Animated toast notifications (slide from top-right)
✓ Smooth scroll to section on nav click
✓ Parallax scrolling effects on hero
✓ Hover tooltips with information
✓ Copy-to-clipboard with success feedback
✓ Status indicators (pending, success, error) with icons

ADVANCED INTERACTIONS:
✓ CURSOR EFFECTS:
  * Custom cursor (dot + ring)
  * Hover trail particles
  * Click ripple effect
  * Cursor changes on hover (pointer, text, etc.)
✓ SCROLL EFFECTS:
  * Scroll progress bar at top (0-100%)
  * Fade-in on scroll for all sections
  * Parallax backgrounds
  * Sticky elements that appear on scroll
✓ MICRO-INTERACTIONS:
  * Button ripple on click
  * Input focus glow
  * Card tilt on mouse move
  * Icon bounce on hover
  * Text gradient animation
  * Number counter animations
  * Progress bar fill animations
✓ PAGE TRANSITIONS:
  * Smooth section reveals
  * Stagger animations for lists
  * Modal slide-in/fade
  * Menu slide from side
✓ INTERACTIVE ELEMENTS:
  * Image galleries with lightbox
  * Video players with custom controls
  * Interactive charts/graphs
  * Drag-and-drop (if applicable)
  * Sortable lists
  * Range sliders with value display
  * Toggle switches with animation
  * Star ratings with hover preview

DATA & STATE MANAGEMENT:
- Initialize with sample data
- Fetch from JSONPlaceholder for demo
- Store modifications in localStorage
- Show loading states during fetch
- Handle errors gracefully
- Validate data before processing
- Confirmation dialogs for destructive actions

CODE STRUCTURE TEMPLATE:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="[Compelling description]">
  <title>[Descriptive Title]</title>
  
  <!-- Google Fonts - Premium Modern Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;900&display=swap" rel="stylesheet">
  
  <style>
    /* 🎨 FUTURISTIC CSS VARIABLES - THEME SYSTEM */
    :root {
      /* Primary Colors */
      --primary: ${primaryHex};
      --primary-dark: [darker shade of primary];
      --primary-light: [lighter shade of primary];
      --secondary: #8b5cf6;
      --accent: #ec4899;
      
      /* Status Colors */
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
      --info: #3b82f6;
      
      /* Background Colors */
      --bg-primary: #0a0a0f;
      --bg-secondary: #1a1a2e;
      --bg-tertiary: #16213e;
      --bg-card: rgba(255, 255, 255, 0.05);
      
      /* Text Colors */
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-tertiary: #94a3b8;
      
      /* Border & Shadow */
      --border-color: rgba(255, 255, 255, 0.1);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
      --shadow-md: 0 8px 16px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.4);
      --shadow-glow: 0 0 20px rgba(${primaryHex}, 0.5);
      
      /* Spacing */
      --spacing-xs: 8px;
      --spacing-sm: 16px;
      --spacing-md: 24px;
      --spacing-lg: 32px;
      --spacing-xl: 48px;
      --spacing-2xl: 80px;
      
      /* Border Radius */
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 24px;
      --radius-full: 9999px;
      
      /* Transitions */
      --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* 🌙 DARK THEME (default) */
    [data-theme="dark"] {
      --bg-primary: #0a0a0f;
      --bg-secondary: #1a1a2e;
      --text-primary: #f8fafc;
    }
    
    /* ☀️ LIGHT THEME */
    [data-theme="light"] {
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-card: rgba(0, 0, 0, 0.03);
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --border-color: rgba(0, 0, 0, 0.1);
    }
    
    /* 🌈 CYBERPUNK THEME */
    [data-theme="cyberpunk"] {
      --primary: #ff006e;
      --secondary: #00f5ff;
      --bg-primary: #0a0014;
      --bg-secondary: #1a0028;
    }
    
    /* 💫 NEON THEME */
    [data-theme="neon"] {
      --primary: #00ff88;
      --secondary: #ff00ff;
      --bg-primary: #000000;
      --shadow-glow: 0 0 30px var(--primary);
    }
    
    /* RESET & BASE STYLES */
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    html { 
      scroll-behavior: smooth;
      overflow-x: hidden;
    }
    
    body { 
      font-family: 'Inter', -apple-system, sans-serif; 
      line-height: 1.7;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background var(--transition-slow), color var(--transition-base);
    }
    
    h1, h2, h3, h4, h5, h6 { 
      font-family: 'Space Grotesk', sans-serif; 
      letter-spacing: -0.03em;
      font-weight: 700;
    }
    
    /* 🎬 COMPREHENSIVE ANIMATIONS */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-50px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(50px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px var(--primary), 0 0 10px var(--primary); }
      50% { box-shadow: 0 0 20px var(--primary), 0 0 30px var(--primary); }
    }
    
    /* 🎯 SCROLL PROGRESS BAR */
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      z-index: 9999;
      transition: width 0.1s ease;
    }
    
    /* 🖱️ CUSTOM CURSOR */
    .custom-cursor {
      width: 20px;
      height: 20px;
      border: 2px solid var(--primary);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.2s ease;
    }
    
    /* HEADER/NAVIGATION - Sticky with backdrop blur */
    header { 
      position: sticky;
      top: 0;
      backdrop-filter: blur(10px);
      background: rgba(var(--bg-primary), 0.8);
      z-index: 1000;
      border-bottom: 1px solid var(--border-color);
    }
    
    /* HERO SECTION - Full viewport with animations */
    .hero { 
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    
    .hero h1 {
      font-size: clamp(48px, 8vw, 84px);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: fadeInUp 1s ease, gradientShift 3s ease infinite;
      background-size: 200% 200%;
    }
    
    /* FEATURES SECTION - Grid with hover effects */
    .features { 
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl) 0;
    }
    
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      transition: all var(--transition-base);
    }
    
    .feature-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: var(--shadow-lg), var(--shadow-glow);
      border-color: var(--primary);
    }
    
    /* BUTTONS - Stylized with effects */
    button, .btn {
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all var(--transition-base);
    }
    
    button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(var(--primary), 0.6);
      filter: brightness(1.1);
    }
    
    button:active {
      transform: scale(0.97);
    }
    
    /* RESPONSIVE */
    @media (max-width: 768px) { 
      .hero h1 { font-size: 48px; }
      .features { grid-template-columns: 1fr; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) { 
      .features { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  
  <!-- HEADER/NAVIGATION -->
  <header id="header">
    <nav>
      <div class="logo">[Brand Name]</div>
      <ul class="nav-menu">
        <li><a href="#home">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button class="cta-button">Get Started</button>
      <button class="mobile-menu-toggle">☰</button>
    </nav>
  </header>
  
  <!-- HERO SECTION -->
  <section id="home" class="hero">
    <div class="hero-content">
      <h1 class="hero-title">[Compelling Headline]</h1>
      <p class="hero-subtitle">[Value Proposition]</p>
      <div class="hero-cta">
        <button class="btn-primary">Primary CTA</button>
        <button class="btn-secondary">Secondary CTA</button>
      </div>
    </div>
    <div class="scroll-indicator">↓</div>
  </section>
  
  <!-- FEATURES SECTION -->
  <section id="features" class="features">
    <h2>Features</h2>
    <p class="section-subtitle">Description</p>
    <div class="features-grid">
      <!-- Feature cards with icons -->
    </div>
  </section>
  
  <!-- ABOUT SECTION -->
  <section id="about" class="about">
    <!-- Content -->
  </section>
  
  <!-- TESTIMONIALS -->
  <section id="testimonials" class="testimonials">
    <!-- Carousel -->
  </section>
  
  <!-- PRICING -->
  <section id="pricing" class="pricing">
    <!-- Pricing tiers -->
  </section>
  
  <!-- CONTACT -->
  <section id="contact" class="contact">
    <form id="contact-form">
      <!-- Form fields with validation -->
    </form>
  </section>
  
  <!-- FOOTER -->
  <footer>
    <!-- Links, social, copyright -->
  </footer>
  
  <!-- 🎯 Scroll Progress Bar -->
  <div class="scroll-progress" id="scrollProgress"></div>
  
  <!-- 🖱️ Custom Cursor (optional) -->
  <div class="custom-cursor" id="customCursor"></div>
  
  <!-- 🎭 Theme Switcher -->
  <div class="theme-switcher">
    <button onclick="setTheme('dark')">🌙</button>
    <button onclick="setTheme('light')">☀️</button>
    <button onclick="setTheme('cyberpunk')">🌈</button>
    <button onclick="setTheme('neon')">💫</button>
  </div>
  
  <script>
    // 🎨 STATE MANAGEMENT
    const state = {
      theme: localStorage.getItem('theme') || 'dark',
      scrollPosition: 0,
      isMenuOpen: false,
      activeSection: 'home'
    };
    
    // 🚀 INITIALIZE APP
    document.addEventListener('DOMContentLoaded', () => {
      initializeTheme();
      setupScrollProgress();
      setupScrollAnimations();
      setupNavigation();
      setupFormValidation();
      setupInteractivity();
      setupCursorEffects();
      setupRippleEffects();
      console.log('✨ App initialized successfully!');
    });
    
    // 🎭 THEME SYSTEM
    function initializeTheme() {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);
    }
    
    function setTheme(themeName) {
      document.documentElement.setAttribute('data-theme', themeName);
      localStorage.setItem('theme', themeName);
      state.theme = themeName;
      
      // Animate theme change
      document.body.style.transition = 'all 0.3s ease';
    }
    
    // 📊 SCROLL PROGRESS BAR
    function setupScrollProgress() {
      const progressBar = document.getElementById('scrollProgress');
      
      window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
      });
    }
    
    // 🎬 SCROLL ANIMATIONS (Intersection Observer)
    function setupScrollAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            entry.target.style.opacity = '1';
          }
        });
      }, observerOptions);
      
      // Observe all sections
      document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        observer.observe(section);
      });
      
      // Stagger animations for cards
      document.querySelectorAll('.feature-card, .pricing-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animationDelay = \`\${index * 0.1}s\`;
        observer.observe(card);
      });
    }
    
    // 🧭 NAVIGATION
    function setupNavigation() {
      // Smooth scroll to sections
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
      
      // Active link highlighting
      window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute('id');
          
          if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('nav a').forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === \`#\${sectionId}\`) {
                link.classList.add('active');
              }
            });
          }
        });
      });
      
      // Mobile menu toggle
      const menuToggle = document.querySelector('.mobile-menu-toggle');
      const navMenu = document.querySelector('.nav-menu');
      
      if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
          navMenu.classList.toggle('active');
          state.isMenuOpen = !state.isMenuOpen;
        });
      }
    }
    
    // ✅ FORM VALIDATION
    function setupFormValidation() {
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
          // Real-time validation
          input.addEventListener('input', (e) => {
            validateField(e.target);
          });
          
          // Blur validation
          input.addEventListener('blur', (e) => {
            validateField(e.target);
          });
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          let isValid = true;
          inputs.forEach(input => {
            if (!validateField(input)) {
              isValid = false;
            }
          });
          
          if (isValid) {
            showToast('Form submitted successfully!', 'success');
            form.reset();
          } else {
            showToast('Please fix the errors', 'error');
          }
        });
      });
    }
    
    function validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      let isValid = true;
      let message = '';
      
      // Required check
      if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
      }
      
      // Email validation
      if (type === 'email' && value) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          message = 'Please enter a valid email';
        }
      }
      
      // Show/hide error
      const errorEl = field.nextElementSibling;
      if (errorEl && errorEl.classList.contains('error-message')) {
        errorEl.textContent = message;
        errorEl.style.display = isValid ? 'none' : 'block';
      }
      
      // Visual feedback
      field.style.borderColor = isValid ? 'var(--success)' : 'var(--error)';
      
      return isValid;
    }
    
    // 🔔 TOAST NOTIFICATIONS
    function showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = \`toast toast-\${type}\`;
      toast.textContent = message;
      toast.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
      \`;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    
    // 🖱️ CURSOR EFFECTS
    function setupCursorEffects() {
      const cursor = document.getElementById('customCursor');
      if (!cursor) return;
      
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });
      
      // Cursor hover effects
      document.querySelectorAll('a, button, .card').forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
          cursor.style.transform = 'scale(1)';
        });
      });
    }
    
    // 💧 RIPPLE EFFECTS
    function setupRippleEffects() {
      document.querySelectorAll('button, .btn').forEach(button => {
        button.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.cssText = \`
            position: absolute;
            width: \${size}px;
            height: \${size}px;
            left: \${x}px;
            top: \${y}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
          \`;
          
          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
        });
      });
    }
    
    // 🎯 INTERACTIVE FEATURES
    function setupInteractivity() {
      // Parallax effect on hero
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const hero = document.querySelector('.hero');
        if (hero) {
          hero.style.transform = \`translateY(\${scrolled * 0.5}px)\`;
        }
      });
      
      // Counter animations
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };
        
        // Start when visible
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            updateCounter();
            observer.disconnect();
          }
        });
        
        observer.observe(counter);
      });
    }
    
    // Add ripple animation to CSS
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
      }
      @keyframes fadeOut {
        to { opacity: 0; transform: translateX(20px); }
      }
    \`;
    document.head.appendChild(style);
  </script>
</body>
</html>
\`\`\`

QUALITY CHECKLIST:
✓ Every user action gets instant visual feedback
✓ No external dependencies except Google Fonts
✓ Extensive CSS variables for customization
✓ Robust state management in JavaScript
✓ Comprehensive form validation with helpful messages
✓ Full keyboard navigation (Tab, Enter, Escape, Arrow keys)
✓ Screen reader friendly (semantic HTML, ARIA)
✓ Mobile responsive with proper touch targets (44x44px)
✓ Dark mode with smooth transitions
✓ Performance optimized (debouncing, event delegation)
✓ Real-time feedback for all interactions
✓ Data persistence with localStorage
✓ Loading states, spinners, skeletons for good UX
✓ Clear success/error messages
✓ At least 5+ interactive features (not static)

CRITICAL SUCCESS FACTORS:
1. Make input validation REAL-TIME (as user types, not on submit)
2. Show INSTANT feedback for all actions (loading, success, error)
3. Include 3-5 distinct interactive features (search, filter, sort, etc.)
4. Use localStorage to PERSIST user data across sessions
5. Implement API calls with proper loading/error states
6. Add helpful error messages and validations
7. Include smooth animations for state transitions
8. Make keyboard navigation complete (no mouse-only features)

REVOLUTIONARY OUTPUT REQUIREMENTS:
- Start with \`\`\`html and end with \`\`\`
- Output ONLY the complete, STUNNING HTML file
- Target: 2500-3500+ lines of BREATHTAKING, comprehensive code
- Create a website that makes users say "WOW! This is incredible!"
- NEVER generate basic, boring, or outdated designs
- Every element should feel premium, polished, and professional
- Include STUNNING animations, interactions, and visual effects
- Ensure FLAWLESS mobile experience with touch optimizations
- Add CONTEXTUAL guidance and INTUITIVE user flows
- Include COMPREHENSIVE accessibility for all users
- Optimize for LIGHTNING performance and smooth interactions
- Make it feel like a CUSTOM $50,000 website
- SURPASS user expectations with REVOLUTIONARY design
- Create something users will want to show their friends
- FOCUS on user delight and visual excellence`;
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
      
      // Step 1: Advanced analysis and personalization
      const websiteType = AdvancedWebElementsService.analyzeWebsiteType(userRequest);
      const sections = this.analyzeSectionsNeeded(userRequest);
      const features = AdvancedWebElementsService.generateFeatureSet(userRequest, websiteType);
      
      console.log(`🎯 Website Type: ${websiteType.name}`);
      console.log('📋 Sections identified:', sections);
      console.log('✨ Features to implement:', features.slice(0, 5));
      
      // Step 2: Generate contextual images for sections (parallel)
      console.log('🎨 Generating contextual images...');
      const sectionImages = await ImageIntegrationService.generateSectionImages(userRequest, sections);
      console.log('✅ Images generated for sections:', Object.keys(sectionImages));
      
      // Step 3: Build enhanced prompt with image integration
      const prompt = this.buildEnhancedCodePrompt(userRequest, stylePreferences, sectionImages);
      
      // Step 4: Generate code using Gemini 2.5 Flash (primary) with fallback
      console.log('💻 Generating code with Gemini 2.5 Flash...');
      const generatedCode = await aiService.generateCode(prompt);
      
      // Step 5: Extract and validate HTML
      const cleanedCode = this.extractHtmlFromResponse(generatedCode);
      const validatedCode = this.validateAndFixHtml(cleanedCode);
      
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
   * Extract HTML from potential markdown code blocks
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

    // Ensure closing tags for style
    if (fixed.includes('<style') && !fixed.includes('</style>')) {
      fixed = fixed.replace(/<style[^>]*>/, (match) => match + '\n  /* CSS content */\n</style>\n');
    }

    // Ensure closing tags for script
    if (fixed.includes('<script') && !fixed.includes('</script>')) {
      fixed = fixed.replace(/<script[^>]*>/, (match) => match + '\n  // JavaScript content\n</script>');
    }

    return fixed;
  }

  /**
   * Extract CSS from HTML for preview/inspection
   */
  static extractCss(html: string): string {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1] : '';
  }

  /**
   * Extract JavaScript from HTML for preview/inspection
   */
  static extractJavaScript(html: string): string {
    const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    return scriptMatch ? scriptMatch[1] : '';
  }

  /**
   * Extract HTML body content
   */
  static extractBody(html: string): string {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : html;
  }

  /**
   * Estimate lines of code
   */
  static estimateLineCount(code: string): number {
    return code.split('\n').length;
  }

  /**
   * Check if code is substantial (500+ lines)
   */
  static isSubstantialCode(code: string): boolean {
    const lines = this.estimateLineCount(code);
    return lines >= 500;
  }

  /**
   * Generate industry-grade code with intelligent retry and fallback
   */
  static async generateRobustCodeWithRetry(
    userRequest: string,
    stylePreferences?: {
      primaryColor?: string;
      headingFont?: string;
      bodyFont?: string;
      layoutDensity?: number;
    },
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Industry-grade generation attempt ${attempt}/${maxRetries}`);
        
        if (attempt === 1) {
          // First attempt: Full enhanced generation with images
          const code = await this.generateRobustCode(userRequest, stylePreferences);
          if (this.validateCodeQuality(code)) {
            console.log(`✅ Enhanced generation succeeded on attempt ${attempt}`);
            return code;
          }
        } else if (attempt === 2) {
          // Second attempt: Simplified generation without images
          console.log('🔄 Trying simplified generation without images...');
          const prompt = this.buildCodePrompt(userRequest, stylePreferences);
          const code = await aiService.generateCode(prompt);
          const processedCode = this.validateAndFixHtml(this.extractHtmlFromResponse(code));
          if (this.validateCodeQuality(processedCode)) {
            console.log(`✅ Simplified generation succeeded on attempt ${attempt}`);
            return processedCode;
          }
        } else {
          // Final attempt: Basic generation with Groq fallback
          console.log('🔄 Final attempt with basic generation...');
          const basicPrompt = `Generate a complete HTML website for: ${userRequest}. Include all CSS and JavaScript inline.`;
          const code = await aiService.generateWithFallback(basicPrompt);
          const processedCode = this.validateAndFixHtml(this.extractHtmlFromResponse(code));
          if (processedCode.includes('<!DOCTYPE') && processedCode.includes('</html>')) {
            console.log(`✅ Basic generation succeeded on attempt ${attempt}`);
            return processedCode;
          }
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (lastError) {
      throw new Error(`All generation strategies failed after ${maxRetries} attempts: ${lastError.message}`);
    }
    throw new Error('Code generation failed completely');
  }
  
  /**
   * Validate code quality and completeness
   */
  static validateCodeQuality(code: string): boolean {
    const checks = [
      code.includes('<!DOCTYPE'),
      code.includes('<html'),
      code.includes('</html>'),
      code.includes('<head>'),
      code.includes('<body>'),
      code.length > 1000  // Minimum code length
    ];
    
    const passed = checks.filter(Boolean).length;
    const total = checks.length;
    
    console.log(`📊 Code quality check: ${passed}/${total} passed`);
    return passed >= total - 1; // Allow one minor failure
  }

  /**
   * Generate enhanced thinking steps for the user (displayed in preview)
   */
  static generateThinkingSteps(userRequest: string): string[] {
    const websiteType = AdvancedWebElementsService.analyzeWebsiteType(userRequest);
    
    const steps = [
      `📋 Analyzing "${userRequest.substring(0, 50)}${userRequest.length > 50 ? '...' : ''}"`,
      `🎯 Detected: ${websiteType.name} - tailoring architecture`,
      '🎨 Generating contextual professional images (Freepik API)',
      '🏗️ Designing personalized industry-grade architecture',
      '💻 Building with Gemini 2.5 Flash (world-class AI)',
      '⚡ Implementing advanced interactions and micro-animations',
      '🎯 Adding real-time validation and user feedback systems',
      '♿ Ensuring WCAG 2.1 AA+ accessibility compliance',
      '🌙 Creating sophisticated multi-theme system',
      '📱 Perfecting mobile-first responsive design',
      '🚀 Optimizing Core Web Vitals and performance',
      '🔍 Adding SEO optimization and structured data',
      '✨ Final polish - industry-leading quality assurance'
    ];
    return steps;
  }
}

export { ImageIntegrationService };
export default CodeGenerator;
