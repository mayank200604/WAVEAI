import { DynamicTemplateEngine } from './dynamicTemplateEngine';

export class PremiumTemplates {
  static getTemplate(type: string, companyName: string, description: string): { html: string; css: string; js: string } {
    switch (type.toLowerCase()) {
      case 'restaurant':
        return this.getRestaurantTemplate(companyName, description);
      case 'portfolio':
        return this.getPortfolioTemplate(companyName, description);
      default:
        return this.getSaaSTemplate(companyName, description);
    }
  }

  static getTemplateWithContent(type: string, companyName: string, content: any): { html: string; css: string; js: string } {
    // Create dynamic template based on content and type
    return this.getDynamicTemplate(type, companyName, content);
  }

  static getSaaSTemplate(companyName: string, description: string): { html: string; css: string; js: string } {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} - Premium SaaS Platform</title>
    <meta name="description" content="${description}">
    <style>
        /* CSS will be injected here */
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">${companyName}</div>
            <nav class="nav">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#about">About</a>
            </nav>
            <button class="cta-btn">Get Started</button>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">${companyName}</h1>
                <p class="hero-subtitle">${description}</p>
                <div class="hero-buttons">
                    <button class="btn-primary">Start Free Trial</button>
                    <button class="btn-secondary">Watch Demo</button>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="features">
        <div class="container">
            <h2>Premium Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Lightning Fast</h3>
                    <p>Ultra-fast performance with optimized infrastructure</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Enterprise Security</h3>
                    <p>Bank-level security with end-to-end encryption</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Advanced Analytics</h3>
                    <p>Real-time insights and comprehensive reporting</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>${companyName}</h4>
                    <p>Premium SaaS solutions for modern businesses</p>
                </div>
                <div class="footer-section">
                    <h4>Product</h4>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                    <a href="#">API</a>
                </div>
                <div class="footer-section">
                    <h4>Company</h4>
                    <a href="#">About</a>
                    <a href="#">Careers</a>
                    <a href="#">Contact</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${companyName}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        /* JS will be injected here */
    </script>
</body>
</html>`;

    const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #000000 75%, #1a1a1a 100%);
    --gold-gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    --black-gradient: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    --glass-bg: rgba(255, 215, 0, 0.1);
    --glass-border: rgba(255, 215, 0, 0.3);
    --shadow-luxury: 0 8px 32px rgba(255, 215, 0, 0.2);
    --shadow-black: 0 8px 32px rgba(0, 0, 0, 0.5);
}

body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--primary-gradient);
    color: white;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 2px solid var(--glass-border);
    z-index: 1000;
    padding: 1rem 0;
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
    background: var(--gold-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav a {
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
}

.nav a:hover {
    transform: translateY(-2px);
}

.cta-btn, .btn-primary, .btn-secondary {
    padding: 12px 24px;
    border-radius: 50px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cta-btn, .btn-primary {
    background: var(--gold-gradient);
    color: black;
    font-weight: 700;
    box-shadow: var(--shadow-luxury);
}

.btn-secondary {
    background: var(--black-gradient);
    color: gold;
    border: 2px solid var(--glass-border);
    box-shadow: var(--shadow-black);
}

.cta-btn:hover, .btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.hero-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 700;
    margin-bottom: 1rem;
    background: var(--gold-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    margin-bottom: 2rem;
    opacity: 0.9;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.hero-tagline {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 600;
    color: gold;
    margin-bottom: 1rem;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.features {
    padding: 120px 0;
    background: rgba(0, 0, 0, 0.3);
}

.about {
    padding: 120px 0;
    background: rgba(255, 215, 0, 0.05);
}

.about h2 {
    text-align: center;
    font-size: 3rem;
    margin-bottom: 2rem;
    background: var(--gold-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.about-text {
    max-width: 800px;
    margin: 0 auto;
    font-size: 1.2rem;
    text-align: center;
    line-height: 1.8;
}

.features h2 {
    text-align: center;
    font-size: 3rem;
    margin-bottom: 4rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-luxury);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.footer {
    background: #1a1a1a;
    padding: 64px 0 24px;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.footer-section h4 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.footer-section a {
    display: block;
    color: #ccc;
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
}

.footer-section a:hover {
    color: white;
}

.footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid #333;
    color: #999;
}

@media (max-width: 768px) {
    .header .container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav {
        gap: 1rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
}`;

    const js = `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.1)';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});`;

    return { html, css, js };
  }

  static getRestaurantTemplate(companyName: string, description: string): { html: string; css: string; js: string } {
    return this.getSaaSTemplate(companyName, description); // Simplified for now
  }

  static getPortfolioTemplate(companyName: string, description: string): { html: string; css: string; js: string } {
    return this.getSaaSTemplate(companyName, description); // Simplified for now
  }

  static getSaaSTemplateWithContent(companyName: string, content: any): { html: string; css: string; js: string } {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <meta name="description" content="${content.metaDescription}">
    <style>
        /* CSS will be injected here */
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">${companyName}</div>
            <nav class="nav">
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </nav>
            <button class="cta-btn">Get Started</button>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">${companyName}</h1>
                <p class="hero-tagline">${content.tagline}</p>
                <p class="hero-subtitle">${content.heroDescription}</p>
                <div class="hero-buttons">
                    <button class="btn-primary">Start Free Trial</button>
                    <button class="btn-secondary">Watch Demo</button>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="features">
        <div class="container">
            <h2>Premium Features</h2>
            <div class="features-grid">
                ${content.features.map((feature: any) => `
                <div class="feature-card">
                    <div class="feature-icon">${feature.icon}</div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="about" class="about">
        <div class="container">
            <h2>About ${companyName}</h2>
            <p class="about-text">${content.aboutText}</p>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>${companyName}</h4>
                    <p>${content.tagline}</p>
                </div>
                <div class="footer-section">
                    <h4>Product</h4>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                    <a href="#">API</a>
                </div>
                <div class="footer-section">
                    <h4>Company</h4>
                    <a href="#">About</a>
                    <a href="#">Careers</a>
                    <a href="#">Contact</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${companyName}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        /* JS will be injected here */
    </script>
</body>
</html>`;

    // Use the same CSS and JS from the original template
    const originalTemplate = this.getSaaSTemplate(companyName, 'temp');
    return { html, css: originalTemplate.css, js: originalTemplate.js };
  }

  static getDynamicTemplate(type: string, companyName: string, content: any): { html: string; css: string; js: string } {
    // Extract user request from content if available
    const userRequest = content.userRequest || `Create a ${type} website for ${companyName}`;
    
    // Generate dynamic HTML based on request analysis
    const html = DynamicTemplateEngine.generateDynamicHTML(companyName, content, userRequest);
    
    // Enhanced iOS-level CSS with additional styles for new sections
    const css = this.getEnhancedIOSCSS();
    
    // Enhanced JavaScript with smooth animations
    const js = this.getEnhancedJS();
    
    return { html, css, js };
  }

  static getEnhancedIOSCSS(): string {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #000000 75%, #1a1a1a 100%);
    --gold-gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    --black-gradient: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    --glass-bg: rgba(255, 215, 0, 0.1);
    --glass-border: rgba(255, 215, 0, 0.3);
    --shadow-luxury: 0 8px 32px rgba(255, 215, 0, 0.2);
    --shadow-black: 0 8px 32px rgba(0, 0, 0, 0.5);
    --ios-blur: blur(20px);
    --ios-radius: 20px;
    --ios-spacing: clamp(16px, 4vw, 32px);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
    background: var(--primary-gradient);
    color: white;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Dynamic text contrast based on background */
.light-bg {
    color: #1a1a1a !important;
}

.light-bg h1, .light-bg h2, .light-bg h3, .light-bg h4, .light-bg h5, .light-bg h6 {
    color: #000 !important;
}

.dark-bg {
    color: white !important;
}

.dark-bg h1, .dark-bg h2, .dark-bg h3, .dark-bg h4, .dark-bg h5, .dark-bg h6 {
    color: white !important;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--ios-spacing);
}

/* iOS-Level Header */
.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: var(--ios-blur);
    border-bottom: 1px solid var(--glass-border);
    z-index: 1000;
    padding: 16px 0;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
    background: var(--gold-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
}

.nav-link:hover {
    color: gold;
    transform: translateY(-2px);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--gold-gradient);
    transition: width 0.3s ease;
}

.nav-link:hover::after {
    width: 100%;
}

/* iOS-Level Buttons */
.cta-btn, .btn-primary, .btn-secondary {
    padding: 12px 24px;
    border-radius: 50px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    font-family: inherit;
    font-size: 14px;
    position: relative;
    overflow: hidden;
}

.cta-btn, .btn-primary {
    background: var(--gold-gradient);
    color: black;
    font-weight: 700;
    box-shadow: var(--shadow-luxury);
}

.btn-secondary {
    background: var(--black-gradient);
    color: gold;
    border: 2px solid var(--glass-border);
    box-shadow: var(--shadow-black);
}

.cta-btn:hover, .btn-primary:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 35px rgba(255, 215, 0, 0.4);
}

.btn-secondary:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
}

/* iOS-Level Hero Section */
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.hero-content {
    z-index: 2;
    position: relative;
}

.hero-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 700;
    margin-bottom: 1rem;
    background: var(--gold-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    line-height: 1.1;
}

.hero-tagline {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 600;
    color: gold;
    margin-bottom: 1rem;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    margin-bottom: 3rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
}

/* Floating Visual Elements */
.hero-visual {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.floating-card {
    position: absolute;
    width: 200px;
    height: 120px;
    background: var(--glass-bg);
    backdrop-filter: var(--ios-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--ios-radius);
    animation: float 6s ease-in-out infinite;
}

.card-1 {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.card-2 {
    top: 60%;
    right: 10%;
    animation-delay: 2s;
}

.card-3 {
    top: 40%;
    left: 50%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
}

/* Section Styles */
.section-title {
    text-align: center;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    margin-bottom: 4rem;
    background: var(--gold-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.features, .services, .about, .testimonials, .pricing, .team, .portfolio, .contact {
    padding: clamp(80px, 12vw, 120px) 0;
    position: relative;
}

.features {
    background: rgba(0, 0, 0, 0.3);
}

.about {
    background: rgba(255, 215, 0, 0.05);
}

.testimonials {
    background: rgba(0, 0, 0, 0.2);
}

.pricing {
    background: rgba(255, 215, 0, 0.03);
}

/* Grid Layouts */
.features-grid, .services-grid, .testimonials-grid, .pricing-grid, .team-grid, .portfolio-grid {
    display: grid;
    gap: 2rem;
    margin-top: 3rem;
}

.features-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.services-grid, .testimonials-grid, .team-grid, .portfolio-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.pricing-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    max-width: 1000px;
    margin: 3rem auto 0;
}

/* Card Styles */
.feature-card, .service-card, .testimonial-card, .pricing-card, .team-member, .portfolio-item {
    background: var(--glass-bg);
    backdrop-filter: var(--ios-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--ios-radius);
    padding: 2rem;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
}

.feature-card:hover, .service-card:hover, .testimonial-card:hover, .portfolio-item:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-luxury);
}

.pricing-card.featured {
    border: 2px solid gold;
    transform: scale(1.05);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
}

/* About Section */
.about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 2rem;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    background: var(--gold-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 0.5rem;
}

.about-image-placeholder {
    width: 100%;
    height: 300px;
    background: var(--glass-bg);
    border-radius: var(--ios-radius);
    border: 1px solid var(--glass-border);
}

/* Contact Form */
.contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1000px;
    margin: 0 auto;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.contact-form input, .contact-form textarea {
    padding: 1rem;
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    background: var(--glass-bg);
    color: white;
    font-family: inherit;
    backdrop-filter: var(--ios-blur);
}

.contact-form input::placeholder, .contact-form textarea::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

/* Footer */
.footer {
    background: #000;
    padding: 64px 0 24px;
    border-top: 1px solid var(--glass-border);
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.footer-section h4 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
    color: gold;
}

.footer-section a {
    display: block;
    color: #ccc;
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
}

.footer-section a:hover {
    color: gold;
}

.social-links {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.social-link {
    color: gold !important;
    font-weight: 500;
}

.footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid #333;
    color: #999;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .header .container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav {
        gap: 1rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .about-content, .contact-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .floating-card {
        display: none;
    }
}

/* Smooth Animations */
[data-aos] {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

[data-aos].aos-animate {
    opacity: 1;
    transform: translateY(0);
}`;
  }

  static getEnhancedJS(): string {
    return `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced header scroll effect
let lastScrollY = window.scrollY;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.backdropFilter = 'blur(30px)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.8)';
        header.style.backdropFilter = 'blur(20px)';
    }
    
    // Hide/show header on scroll
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
});

// iOS-style scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// Enhanced button interactions
document.querySelectorAll('.btn-primary, .btn-secondary, .cta-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    btn.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(-1px) scale(0.98)';
    });
    
    btn.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add success animation
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                this.reset();
            }, 2000);
        }, 1000);
    });
}

// Parallax effect for floating cards
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-card');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = \`translateY(\${yPos}px) rotate(\${scrolled * 0.01}deg)\`;
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});`;
  }
}
