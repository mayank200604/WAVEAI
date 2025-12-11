export class DynamicTemplateEngine {
  static generateDynamicHTML(companyName: string, content: any, userRequest: string): string {
    const sections = this.analyzeSectionsFromRequest(userRequest);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <meta name="description" content="${content.metaDescription}">
    <meta name="keywords" content="${this.generateKeywords(userRequest, companyName)}">
    <meta property="og:title" content="${content.title}">
    <meta property="og:description" content="${content.metaDescription}">
    <meta property="og:type" content="website">
    <link rel="canonical" href="https://${companyName.toLowerCase().replace(/\s+/g, '')}.com">
    <style>
        /* CSS will be injected here */
    </style>
</head>
<body>
    ${this.generateHeader(companyName, sections)}
    ${this.generateHero(companyName, content)}
    ${sections.includes('features') ? this.generateFeatures(content) : ''}
    ${sections.includes('services') ? this.generateServices(content) : ''}
    ${sections.includes('about') ? this.generateAbout(companyName, content) : ''}
    ${sections.includes('testimonials') ? this.generateTestimonials() : ''}
    ${sections.includes('pricing') ? this.generatePricing() : ''}
    ${sections.includes('team') ? this.generateTeam() : ''}
    ${sections.includes('portfolio') ? this.generatePortfolio() : ''}
    ${sections.includes('contact') ? this.generateContact(companyName) : ''}
    ${this.generateFooter(companyName, content)}
    <script>
        /* JS will be injected here */
    </script>
</body>
</html>`;
  }

  static analyzeSectionsFromRequest(userRequest: string): string[] {
    const request = userRequest.toLowerCase();
    const sections = ['features', 'about']; // Always include these
    
    // Analyze request for specific sections
    if (request.includes('service') || request.includes('offer')) sections.push('services');
    if (request.includes('testimonial') || request.includes('review') || request.includes('client')) sections.push('testimonials');
    if (request.includes('pricing') || request.includes('plan') || request.includes('cost')) sections.push('pricing');
    if (request.includes('team') || request.includes('staff') || request.includes('member')) sections.push('team');
    if (request.includes('portfolio') || request.includes('work') || request.includes('project')) sections.push('portfolio');
    if (request.includes('contact') || request.includes('reach') || request.includes('get in touch')) sections.push('contact');
    
    return sections;
  }

  static generateKeywords(userRequest: string, companyName: string): string {
    const baseKeywords = [companyName.toLowerCase()];
    const request = userRequest.toLowerCase();
    
    if (request.includes('saas')) baseKeywords.push('saas', 'software', 'platform', 'cloud');
    if (request.includes('restaurant')) baseKeywords.push('restaurant', 'dining', 'food', 'cuisine');
    if (request.includes('portfolio')) baseKeywords.push('portfolio', 'design', 'creative', 'professional');
    if (request.includes('business')) baseKeywords.push('business', 'professional', 'services', 'solutions');
    
    return baseKeywords.join(', ');
  }

  static generateHeader(companyName: string, sections: string[]): string {
    const navItems = sections.map(section => 
      `<a href="#${section}" class="nav-link">${section.charAt(0).toUpperCase() + section.slice(1)}</a>`
    ).join('');
    
    return `
    <header class="header">
        <div class="container">
            <div class="logo">${companyName}</div>
            <nav class="nav">
                ${navItems}
            </nav>
            <button class="cta-btn">Get Started</button>
        </div>
    </header>`;
  }

  static generateHero(companyName: string, content: any): string {
    return `
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">${companyName}</h1>
                <p class="hero-tagline">${content.tagline}</p>
                <p class="hero-subtitle">${content.heroDescription}</p>
                <div class="hero-buttons">
                    <button class="btn-primary">Get Started Free</button>
                    <button class="btn-secondary">Learn More</button>
                </div>
            </div>
            <div class="hero-visual">
                <div class="floating-card card-1"></div>
                <div class="floating-card card-2"></div>
                <div class="floating-card card-3"></div>
            </div>
        </div>
    </section>`;
  }

  static generateFeatures(content: any): string {
    return `
    <section id="features" class="features">
        <div class="container">
            <h2 class="section-title">Premium Features</h2>
            <div class="features-grid">
                ${content.features.map((feature: any, index: number) => `
                <div class="feature-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="feature-icon">${feature.icon}</div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  static generateServices(content: any): string {
    return `
    <section id="services" class="services">
        <div class="container">
            <h2 class="section-title">Our Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <h3>Consulting</h3>
                    <p>Expert guidance to transform your business operations</p>
                </div>
                <div class="service-card">
                    <h3>Implementation</h3>
                    <p>Seamless integration with your existing systems</p>
                </div>
                <div class="service-card">
                    <h3>Support</h3>
                    <p>24/7 dedicated support for all your needs</p>
                </div>
            </div>
        </div>
    </section>`;
  }

  static generateAbout(companyName: string, content: any): string {
    return `
    <section id="about" class="about">
        <div class="container">
            <div class="about-content">
                <div class="about-text">
                    <h2 class="section-title">About ${companyName}</h2>
                    <p>${content.aboutText}</p>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">10K+</div>
                            <div class="stat-label">Happy Clients</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">99.9%</div>
                            <div class="stat-label">Uptime</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">24/7</div>
                            <div class="stat-label">Support</div>
                        </div>
                    </div>
                </div>
                <div class="about-visual">
                    <div class="about-image-placeholder"></div>
                </div>
            </div>
        </div>
    </section>`;
  }

  static generateTestimonials(): string {
    return `
    <section id="testimonials" class="testimonials">
        <div class="container">
            <h2 class="section-title">What Our Clients Say</h2>
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <p>"Absolutely transformative experience. The results exceeded our expectations."</p>
                    <div class="testimonial-author">
                        <strong>Sarah Johnson</strong>
                        <span>CEO, TechCorp</span>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p>"Professional, reliable, and innovative. Highly recommend their services."</p>
                    <div class="testimonial-author">
                        <strong>Michael Chen</strong>
                        <span>Founder, StartupXYZ</span>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
  }

  static generatePricing(): string {
    return `
    <section id="pricing" class="pricing">
        <div class="container">
            <h2 class="section-title">Choose Your Plan</h2>
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Starter</h3>
                    <div class="price">$29<span>/month</span></div>
                    <ul class="features-list">
                        <li>5 Projects</li>
                        <li>10GB Storage</li>
                        <li>Email Support</li>
                    </ul>
                    <button class="btn-primary">Get Started</button>
                </div>
                <div class="pricing-card featured">
                    <h3>Professional</h3>
                    <div class="price">$99<span>/month</span></div>
                    <ul class="features-list">
                        <li>Unlimited Projects</li>
                        <li>100GB Storage</li>
                        <li>Priority Support</li>
                        <li>Advanced Analytics</li>
                    </ul>
                    <button class="btn-primary">Get Started</button>
                </div>
                <div class="pricing-card">
                    <h3>Enterprise</h3>
                    <div class="price">Custom</div>
                    <ul class="features-list">
                        <li>Everything in Pro</li>
                        <li>Unlimited Storage</li>
                        <li>24/7 Phone Support</li>
                        <li>Custom Integration</li>
                    </ul>
                    <button class="btn-primary">Contact Us</button>
                </div>
            </div>
        </div>
    </section>`;
  }

  static generateTeam(): string {
    return `
    <section id="team" class="team">
        <div class="container">
            <h2 class="section-title">Meet Our Team</h2>
            <div class="team-grid">
                <div class="team-member">
                    <div class="member-photo"></div>
                    <h3>Alex Rodriguez</h3>
                    <p>CEO & Founder</p>
                </div>
                <div class="team-member">
                    <div class="member-photo"></div>
                    <h3>Emily Watson</h3>
                    <p>CTO</p>
                </div>
                <div class="team-member">
                    <div class="member-photo"></div>
                    <h3>David Kim</h3>
                    <p>Lead Designer</p>
                </div>
            </div>
        </div>
    </section>`;
  }

  static generatePortfolio(): string {
    return `
    <section id="portfolio" class="portfolio">
        <div class="container">
            <h2 class="section-title">Our Work</h2>
            <div class="portfolio-grid">
                <div class="portfolio-item">
                    <div class="portfolio-image"></div>
                    <h3>Project Alpha</h3>
                    <p>Revolutionary mobile application</p>
                </div>
                <div class="portfolio-item">
                    <div class="portfolio-image"></div>
                    <h3>Project Beta</h3>
                    <p>Enterprise web platform</p>
                </div>
                <div class="portfolio-item">
                    <div class="portfolio-image"></div>
                    <h3>Project Gamma</h3>
                    <p>AI-powered analytics dashboard</p>
                </div>
            </div>
        </div>
    </section>`;
  }

  static generateContact(companyName: string): string {
    return `
    <section id="contact" class="contact">
        <div class="container">
            <h2 class="section-title">Get In Touch</h2>
            <div class="contact-content">
                <div class="contact-info">
                    <h3>Contact Information</h3>
                    <div class="contact-item">
                        <strong>Email:</strong> hello@${companyName.toLowerCase().replace(/\s+/g, '')}.com
                    </div>
                    <div class="contact-item">
                        <strong>Phone:</strong> +1 (555) 123-4567
                    </div>
                    <div class="contact-item">
                        <strong>Address:</strong> 123 Business St, City, State 12345
                    </div>
                </div>
                <form class="contact-form">
                    <input type="text" placeholder="Your Name" required>
                    <input type="email" placeholder="Your Email" required>
                    <textarea placeholder="Your Message" rows="5" required></textarea>
                    <button type="submit" class="btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    </section>`;
  }

  static generateFooter(companyName: string, content: any): string {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>${companyName}</h4>
                    <p>${content.tagline}</p>
                    <div class="social-links">
                        <a href="#" class="social-link">LinkedIn</a>
                        <a href="#" class="social-link">Twitter</a>
                        <a href="#" class="social-link">Facebook</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Product</h4>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                    <a href="#">API</a>
                    <a href="#">Documentation</a>
                </div>
                <div class="footer-section">
                    <h4>Company</h4>
                    <a href="#">About</a>
                    <a href="#">Careers</a>
                    <a href="#">Contact</a>
                    <a href="#">Blog</a>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <a href="#">Help Center</a>
                    <a href="#">Community</a>
                    <a href="#">Status</a>
                    <a href="#">Privacy</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${companyName}. All rights reserved.</p>
            </div>
        </div>
    </footer>`;
  }
}
