import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function LandingOriginal() {
  const navigate = useNavigate();

  const handleTryForFree = () => {
    navigate("/login");
  };

  useEffect(() => {
    // Create particles
    const createParticles = () => {
      const container = document.getElementById('particles');
      if (!container) return;
      
      const particleCount = window.innerWidth < 768 ? 15 : 30;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.position = 'absolute';
        particle.style.background = '#00d4ff';
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.4';
        particle.style.animation = 'float 6s ease-in-out infinite';
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        container.appendChild(particle);
      }
    };

    // Scroll animations
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          el.classList.add('visible');
        }
      });
    };

    createParticles();
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Cleanup function
    return () => {
      const container = document.getElementById('particles');
      if (container) {
        container.innerHTML = '';
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        
        :root {
          --bg-primary: #0a0a0a;
          --bg-secondary: rgba(255, 255, 255, 0.05);
          --accent-primary: #00d4ff;
          --accent-secondary: #0099cc;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --text-muted: #808080;
          --glass-bg: rgba(255, 255, 255, 0.1);
          --glass-border: rgba(255, 255, 255, 0.2);
          --shadow-glow: 0 0 20px rgba(0, 212, 255, 0.3);
          --shadow-glow-strong: 0 0 30px rgba(0, 212, 255, 0.5);
          --spacing-xs: 4px;
          --spacing-sm: 8px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          --spacing-xl: 32px;
          --spacing-2xl: 48px;
          --spacing-3xl: 64px;
          --border-radius-sm: 8px;
          --border-radius-md: 12px;
          --border-radius-lg: 16px;
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Inter', 'Roboto', sans-serif;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* Particle Background */
        .particles-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          background: var(--accent-primary);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.4;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 0.7; }
        }

        /* Glassmorphism */
        .glass {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-lg);
        }

        .glass-glow {
          box-shadow: var(--shadow-glow);
          transition: var(--transition);
        }

        .glass-glow:hover {
          box-shadow: var(--shadow-glow-strong);
          transform: translateY(-2px);
        }

        /* Typography */
        .hero-title-split {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          margin-bottom: 1rem;
          text-align: center;
          font-family: 'Necosmic', 'Inter', sans-serif;
        }

        .wave {
          background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ai {
          color: var(--accent-primary);
        }

        .hero-subtitle-refined {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
          color: var(--accent-primary);
          font-family: 'HK Modular', 'Inter', sans-serif;
        }

        .hero-tagline {
          font-size: clamp(1rem, 2vw, 1.5rem);
          margin-bottom: 2rem;
          text-align: center;
          color: var(--text-secondary);
          font-weight: 700;
          font-family: 'Courier Prime', 'Courier New', monospace;
        }

        /* Section Headings */
        .section-heading {
          font-size: clamp(2.5rem, 5vw, 4rem) !important;
          font-weight: 700;
          margin-bottom: var(--spacing-2xl);
          text-align: center;
          color: var(--text-primary);
        }

        .final-cta-heading {
          font-size: clamp(2rem, 4vw, 3.5rem) !important;
          font-weight: 700;
          margin-bottom: var(--spacing-lg);
          color: var(--text-primary);
        }

        /* Layout */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg);
        }

        .section {
          padding: var(--spacing-3xl) 0;
          position: relative;
          z-index: 2;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--spacing-2xl);
          position: relative;
          z-index: 2;
        }

        /* Buttons */
        .btn {
          display: inline-block;
          padding: var(--spacing-lg) var(--spacing-2xl);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: var(--text-primary);
          text-decoration: none;
          border-radius: var(--border-radius-md);
          font-weight: 600;
          font-size: 1.125rem;
          transition: var(--transition);
          box-shadow: var(--shadow-glow);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow-strong);
        }

        .btn-large {
          padding: var(--spacing-xl) var(--spacing-3xl);
          font-size: 1.25rem;
        }

        /* Grid */
        .grid {
          display: grid;
          gap: var(--spacing-lg);
        }

        .grid-3 {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        /* Feature Cards */
        .feature-card {
          text-align: center;
          padding: var(--spacing-2xl);
          transition: var(--transition);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--spacing-lg);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
        }

        .feature-card p {
          color: var(--text-secondary);
        }

        /* Timeline */
        .timeline-vertical {
          position: relative;
          max-width: 600px;
        }

        .timeline-vertical::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          transform: translateX(-50%);
          z-index: 1;
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }

        .timeline-step-vertical {
          display: flex;
          align-items: center;
          margin-bottom: var(--spacing-3xl);
          position: relative;
          z-index: 2;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .timeline-step-vertical.animate {
          opacity: 1;
          transform: translateY(0);
        }

        .timeline-step-vertical:nth-child(even) {
          flex-direction: row-reverse;
        }

        .timeline-step-vertical:nth-child(even) .timeline-content {
          text-align: right;
        }

        .timeline-circle-vertical {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--bg-primary);
          position: relative;
          margin: 0 var(--spacing-xl);
          animation: pulseVertical 2s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        }

        .timeline-content {
          flex: 1;
          max-width: 250px;
        }

        .timeline-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--text-primary);
        }

        .timeline-content p {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @keyframes pulseVertical {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
        }

        /* Why Wave AI */
        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
          margin: var(--spacing-2xl) 0;
        }

        .comparison-item {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .comparison-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--spacing-lg);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .comparison-item h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
        }

        .comparison-item p {
          color: var(--text-secondary);
        }

        /* Footer */
        .footer {
          background: rgba(0, 0, 0, 0.8);
          padding: var(--spacing-2xl) 0;
          text-align: center;
          border-top: 1px solid var(--glass-border);
          position: relative;
          z-index: 2;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .social-icon {
          color: var(--accent-primary);
          text-decoration: none;
          transition: var(--transition);
          padding: var(--spacing-sm);
        }

        .social-icon:hover {
          transform: scale(1.2);
        }

        /* Scroll Animations */
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: var(--transition);
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .timeline-vertical::before {
            left: 30px;
          }

          .timeline-step-vertical {
            flex-direction: row !important;
          }

          .timeline-step-vertical:nth-child(even) .timeline-content {
            text-align: left;
          }

          .timeline-circle-vertical {
            margin: var(--spacing-md) 0;
          }

          .timeline-content {
            max-width: 100%;
          }

          .grid-3 {
            grid-template-columns: 1fr;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title-split {
            font-size: 2.5rem;
          }

          .hero-subtitle-refined {
            font-size: 1.25rem;
          }

          .btn {
            padding: var(--spacing-md) var(--spacing-lg);
            font-size: 1rem;
          }
        }
      `}</style>

      <div style={{ 
        fontFamily: "'Inter', 'Roboto', sans-serif",
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        lineHeight: '1.6',
        overflowX: 'hidden',
        minHeight: '100vh'
      }}>
        {/* Animated Particle Background */}
        <div className="particles-container" id="particles" />

        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title-split">
                <span className="wave">WAVE</span> <span className="ai">AI</span>
              </h1>
              <h2 className="hero-subtitle-refined">The Idea Graveyard</h2>
              <p className="hero-tagline">Resurrect. Reimagine. Revive.</p>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Wave AI turns abandoned ideas into future successes with AI + live data.
              </p>
              <button onClick={handleTryForFree} className="btn btn-large">
                Try for Free
              </button>
            </div>
          </div>
        </section>

        {/* What Inspired This Idea */}
        <section className="section">
          <div className="container">
            <div className="glass glass-glow fade-in" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
              <h2 className="section-heading">What Inspired This Idea?</h2>
              <p style={{ fontSize: '1.125rem', maxWidth: '800px', margin: '0 auto' }}>
                Wave AI was born from a simple truth: most great ideas die not because they're bad — but because they're mistimed, misunderstood, or under-resourced. We built Wave to give those ideas a second life, powered by AI, empathy, and real-time insight.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="section">
          <div className="container">
            <div className="glass fade-in" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
              <h2 className="section-heading">About Wave AI</h2>
              <p style={{ fontSize: '1.125rem', maxWidth: '800px', margin: '0 auto' }}>
                Wave AI isn't just an idea repository — it's an innovation engine. Upload failed ideas, run an autopsy, and let AI + real-time market data guide you with viability scores, creative pivots, and actionable blueprints.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="section">
          <div className="container">
            <h2 className="fade-in section-heading">Key Features</h2>
            <div className="grid grid-3">
              <div className="glass glass-glow feature-card fade-in">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="21 21l-4.35-4.35"/>
                  </svg>
                </div>
                <h3>Idea Logging & Autopsy</h3>
                <p>Deep dive analysis of why ideas failed and what can be learned from them.</p>
              </div>
              <div className="glass glass-glow feature-card fade-in">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3>AI-powered Mutations & Fusions</h3>
                <p>Intelligent combinations and transformations of existing ideas into new opportunities.</p>
              </div>
              <div className="glass glass-glow feature-card fade-in">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                </div>
                <h3>Viability Scoring</h3>
                <p>Real-time market analysis to score the potential success of revived ideas.</p>
              </div>
              <div className="glass glass-glow feature-card fade-in">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <h3>Barrier-Busting Blueprints</h3>
                <p>Actionable plans to overcome obstacles that previously killed your ideas.</p>
              </div>
              <div className="glass glass-glow feature-card fade-in">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8V4H8"/>
                    <rect width="16" height="12" x="4" y="8" rx="2"/>
                    <path d="M2 14h2"/>
                    <path d="M20 14h2"/>
                    <path d="M15 13v2"/>
                    <path d="M9 13v2"/>
                  </svg>
                </div>
                <h3>Decision Maker AI</h3>
                <p>AI-powered guidance system to help you make informed decisions about your ideas.</p>
              </div>
              <div className="glass glass-glow feature-card fade-in">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                    <line x1="12" y1="20" x2="12.01" y2="20"/>
                  </svg>
                </div>
                <h3>Denodo-powered Live Data</h3>
                <p>Real-time market data integration for accurate trend analysis and timing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Wave AI */}
        <section className="section">
          <div className="container">
            <h2 className="fade-in section-heading">Why Wave AI</h2>
            <div className="comparison-grid">
              <div className="comparison-item glass glass-glow fade-in">
                <div className="comparison-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h3>Emotion-aware</h3>
                <p>Understanding the emotional journey behind failed ideas and channeling that passion into success.</p>
              </div>
              <div className="comparison-item glass glass-glow fade-in">
                <div className="comparison-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M7 12l3 3 7-10"/>
                  </svg>
                </div>
                <h3>Market-driven</h3>
                <p>Leveraging real-time data and market insights to time your revival perfectly.</p>
              </div>
              <div className="comparison-item glass glass-glow fade-in">
                <div className="comparison-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
                  </svg>
                </div>
                <h3>Compass vs. Search Engine</h3>
                <p>Not just finding information, but providing clear direction and actionable next steps.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Timeline */}
        <section className="section">
          <div className="container">
            <h2 className="fade-in section-heading" style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>How It Works</h2>
            <div className="timeline-vertical fade-in" style={{ margin: '0 auto' }}>
              <div className="timeline-step-vertical">
                <div className="timeline-content">
                  <h3>Submit Your Failed Idea</h3>
                  <p>Upload your abandoned idea with comprehensive details about what went wrong, why it failed, and what obstacles you encountered. Include your original vision, target market, and any attempts you made to bring it to life.</p>
                </div>
                <div className="timeline-circle-vertical">1</div>
              </div>
              <div className="timeline-step-vertical">
                <div className="timeline-content">
                  <h3>AI-Powered Autopsy</h3>
                  <p>Our advanced AI performs a deep forensic analysis to understand the root causes of failure. We examine market timing, execution flaws, resource constraints, and competitive landscape to identify exactly what went wrong and why.</p>
                </div>
                <div className="timeline-circle-vertical">2</div>
              </div>
              <div className="timeline-step-vertical">
                <div className="timeline-content">
                  <h3>Real-Time Data Enrichment</h3>
                  <p>We integrate live market data, current trends, consumer behavior patterns, and competitive intelligence to provide fresh context. This shows how the landscape has changed since your original attempt.</p>
                </div>
                <div className="timeline-circle-vertical">3</div>
              </div>
              <div className="timeline-step-vertical">
                <div className="timeline-content">
                  <h3>Comprehensive Analysis</h3>
                  <p>Generate detailed viability scores, market opportunity assessments, and strategic recommendations. We identify the best paths forward, potential pivots, and optimal timing for revival.</p>
                </div>
                <div className="timeline-circle-vertical">4</div>
              </div>
              <div className="timeline-step-vertical">
                <div className="timeline-content">
                  <h3>Actionable Revival Blueprint</h3>
                  <p>Receive your personalized step-by-step roadmap with specific actions, resource requirements, timeline, and success metrics. Transform your failed idea into a viable business opportunity with clear execution steps.</p>
                </div>
                <div className="timeline-circle-vertical">5</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="section">
          <div className="container">
            <div className="glass glass-glow fade-in" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center' }}>
              <h2 className="final-cta-heading">Ideas Don't Die. They Evolve.</h2>
              <p style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-2xl)', color: 'var(--text-secondary)' }}>
                Give your abandoned ideas a second chance.
              </p>
              <button onClick={handleTryForFree} className="btn btn-large">
                Try for Free
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="GitHub">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>© 2025 Wave AI. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default LandingOriginal;
