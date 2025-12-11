import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

function Landing() {
  const navigate = useNavigate();

  const handleTryClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate("/login");
  };

  useEffect(() => {
    // Any landing-specific effects here
  }, []);

  useEffect(() => {
    // Particle Animation System
    function createParticles() {
      const container = document.getElementById("particles");
      if (!container) return;
      container.innerHTML = "";
      const particleCount = window.innerWidth < 768 ? 15 : 30;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        const size = Math.random() * 2 + 1;
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 6 + "s";
        particle.style.animationDuration = Math.random() * 4 + 4 + "s";
        container.appendChild(particle);
      }
    }

    createParticles();

    // Scroll Animation Observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      }, observerOptions);

      document.querySelectorAll<HTMLElement>(".fade-in").forEach((el) => {
        observer!.observe(el);
      });
    }

    // Vertical Timeline Animation
    function animateVerticalTimeline() {
      const timelineSteps = document.querySelectorAll<HTMLElement>(".timeline-step-vertical");
      timelineSteps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add("animate");
        }, index * 300);
      });
    }

    let timelineObserver: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      timelineObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateVerticalTimeline();
              timelineObserver!.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      const timeline = document.querySelector(".timeline-vertical");
      if (timeline) {
        timelineObserver.observe(timeline);
      }
    }

    // Button ripple effect
    const buttons = document.querySelectorAll<HTMLElement>(".btn");
    function rippleHandler(e: MouseEvent) {
      const button = e.currentTarget as HTMLElement;
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.position = "absolute";
      ripple.style.borderRadius = "50%";
      ripple.style.background = "rgba(255, 255, 255, 0.3)";
      ripple.style.transform = "scale(0)";
      ripple.style.animation = "ripple 0.6s linear";
      ripple.style.pointerEvents = "none";
      button.style.position = "relative";
      button.style.overflow = "hidden";
      button.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    buttons.forEach((button) => {
      button.addEventListener("click", rippleHandler);
    });

    // Add ripple animation to CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Loading animation for page elements
    document
      .querySelectorAll<HTMLElement>(".glass, .feature-card, .comparison-item")
      .forEach((el, index) => {
        el.classList.add("loading");
        el.style.animationDelay = index * 0.1 + "s";
      });

    // Cleanup
    return () => {
      document.getElementById("particles")?.remove();
      style.remove();
      buttons.forEach((button) => {
        button.removeEventListener("click", rippleHandler);
      });
      if (observer) observer.disconnect();
      if (timelineObserver) timelineObserver.disconnect();
    };
  }, []);

  return (
    <div>
      {/* Animated Particle Background */}
      <div className="particles-container" id="particles"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content glass fade-in">
          <h1 className="hero-title">Resurrect Your Ideas</h1>
          <p className="hero-subtitle">
            Transform abandoned concepts into market-ready opportunities with Wave AI.
          </p>
          <a href="#" className="btn btn-large" onClick={handleTryClick}>
            Try for Free
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="container">
          <div
            className="glass fade-in hologram-effect"
            style={{
              padding: "var(--spacing-2xl)",
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto"
            }}
          >
            <h2>About Wave AI</h2>
            <p style={{ fontSize: "1.125rem", maxWidth: 800, margin: "0 auto" }}>
              Wave AI isn't just an idea repository — it's an innovation engine. Upload failed ideas, run an autopsy, and let AI + real-time market data guide you with viability scores, creative pivots, and actionable blueprints.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="section">
        <div className="container">
          <h2 className="fade-in" style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}>
            Key Features
          </h2>
          <div className="grid grid-3">
            <div className="glass glass-glow feature-card fade-in">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <h3>Idea Logging & Autopsy</h3>
              <p>Deep dive analysis of why ideas failed and what can be learned from them.</p>
            </div>
            <div className="glass glass-glow feature-card fade-in">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="m2 17 10 5 10-5"></path>
                  <path d="m2 12 10 5 10-5"></path>
                </svg>
              </div>
              <h3>AI-powered Mutations & Fusions</h3>
              <p>Intelligent combinations and transformations of existing ideas into new opportunities.</p>
            </div>
            <div className="glass glass-glow feature-card fade-in">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"></path>
                  <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
              </div>
              <h3>Viability Scoring</h3>
              <p>Real-time market analysis to score the potential success of revived ideas.</p>
            </div>
            <div className="glass glass-glow feature-card fade-in">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <h3>Barrier-Busting Blueprints</h3>
              <p>Actionable plans to overcome obstacles that previously killed your ideas.</p>
            </div>
            <div className="glass glass-glow feature-card fade-in">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Decision Maker AI</h3>
              <p>AI-powered guidance system to help you make informed decisions about your ideas.</p>
            </div>
            <div className="glass glass-glow feature-card fade-in">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
                  <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
                  <path d="M10.7 13.3c-1.4-1.4-1.4-3.7 0-5.1"></path>
                  <path d="M13.6 10.4c-.6-.6-.6-1.5 0-2.1"></path>
                  <path d="M16.5 7.5c-.2-.2-.2-.5 0-.7"></path>
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
          <h2 className="fade-in" style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}>
            Why Wave AI
          </h2>
          <div className="comparison-grid">
            <div className="comparison-item glass glass-glow fade-in">
              <div className="comparison-icon">💝</div>
              <h3>Emotion-aware</h3>
              <p>
                Understanding the emotional journey behind failed ideas and channeling that passion into success.
              </p>
            </div>
            <div className="comparison-item glass glass-glow fade-in">
              <div className="comparison-icon">📈</div>
              <h3>Market-driven</h3>
              <p>
                Leveraging real-time data and market insights to time your revival perfectly.
              </p>
            </div>
            <div className="comparison-item glass glass-glow fade-in">
              <div className="comparison-icon">🧭</div>
              <h3>Compass vs. Search Engine</h3>
              <p>
                Not just finding information, but providing clear direction and actionable next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="section">
        <div className="container">
          <h2 className="fade-in" style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}>
            How It Works
          </h2>
          <div className="timeline-vertical fade-in" style={{ margin: "0 auto" }}>
            <div className="timeline-step-vertical">
              <div className="timeline-content">
                <h3>Submit</h3>
                <p>
                  Upload your failed idea with details about what went wrong and why it didn't succeed initially.
                </p>
              </div>
              <div className="timeline-circle-vertical">1</div>
            </div>
            <div className="timeline-step-vertical">
              <div className="timeline-content">
                <h3>Autopsy</h3>
                <p>
                  Our AI performs a deep analysis to understand the root causes of failure and identify key learnings.
                </p>
              </div>
              <div className="timeline-circle-vertical">2</div>
            </div>
            <div className="timeline-step-vertical">
              <div className="timeline-content">
                <h3>Enrich</h3>
                <p>
                  We integrate real-time market data and trends to provide current context and opportunities.
                </p>
              </div>
              <div className="timeline-circle-vertical">3</div>
            </div>
            <div className="timeline-step-vertical">
              <div className="timeline-content">
                <h3>Analyze</h3>
                <p>
                  Generate comprehensive viability scores and identify the best paths forward for your idea.
                </p>
              </div>
              <div className="timeline-circle-vertical">4</div>
            </div>
            <div className="timeline-step-vertical">
              <div className="timeline-content">
                <h3>Revive</h3>
                <p>
                  Receive your personalized actionable blueprint with clear steps to bring your idea back to life.
                </p>
              </div>
              <div className="timeline-circle-vertical">5</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section">
        <div className="container">
          <div
            className="glass glass-glow fade-in hologram-effect"
            style={{
              padding: "var(--spacing-3xl)",
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto"
            }}
          >
            <h2 style={{ marginBottom: "var(--spacing-lg)" }}>
              Ideas Don't Die. They Evolve.
            </h2>
            <p
              style={{
                fontSize: "1.25rem",
                marginBottom: "var(--spacing-2xl)",
                color: "var(--text-secondary)",
              }}
            >
              Give your abandoned ideas a second chance.
            </p>
            <a href="#" className="btn btn-large" onClick={handleTryClick}>
              Try for Free
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Twitter">
              {/* ...SVG code... */}
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              {/* ...SVG code... */}
            </a>
            <a href="#" className="social-icon" aria-label="GitHub">
              {/* ...SVG code... */}
            </a>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            © 2025 Wave AI. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;