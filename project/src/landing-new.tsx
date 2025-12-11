import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function LandingNew() {
  const navigate = useNavigate();

  const handleTryForFree = () => {
    navigate("/login");
  };

  useEffect(() => {
    // Create particles
    const createParticles = () => {
      const container = document.getElementById('particles');
      if (!container) return;
      
      const particleCount = window.innerWidth < 768 ? 20 : 40;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.position = 'absolute';
        particle.style.background = '#00d4ff';
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.6';
        particle.style.animation = 'float 8s ease-in-out infinite';
        particle.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.5)';
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
        
        container.appendChild(particle);
      }
    };

    // Scroll animations
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in-scroll');
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
    <div style={{ 
      fontFamily: "'Inter', 'Roboto', sans-serif",
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      lineHeight: '1.6',
      overflowX: 'hidden',
      minHeight: '100vh'
    }}>
      {/* Particle Background */}
      <div 
        id="particles"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ffffff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <span>WAVE</span> <span style={{ color: '#00d4ff' }}>AI</span>
          </h1>
          
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#00d4ff'
          }}>
            The Idea Graveyard
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            marginBottom: '2rem',
            color: '#b0b0b0',
            fontWeight: '500'
          }}>
            Resurrect. Reimagine. Revive.
          </p>
          
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            color: '#b0b0b0',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            Wave AI turns abandoned ideas into future successes with AI + live data.
          </p>
          
          <button
            onClick={handleTryForFree}
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: '#ffffff',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
            }}
          >
            Try for Free
          </button>
        </div>
      </section>

      {/* What Inspired This Idea */}
      <section style={{ padding: '4rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#ffffff'
            }}>
              What Inspired This Idea?
            </h2>
            <p style={{
              fontSize: '1.125rem',
              maxWidth: '800px',
              margin: '0 auto',
              color: '#b0b0b0'
            }}>
              Wave AI was born from a simple truth: most great ideas die not because they're bad — but because they're mistimed, misunderstood, or under-resourced. We built Wave to give those ideas a second life, powered by AI, empathy, and real-time insight.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section style={{ padding: '4rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="fade-in-scroll" style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#ffffff',
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.6s ease-out'
          }}>
            Key Features
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { icon: '🔍', title: 'Idea Logging & Autopsy', desc: 'Deep dive analysis of why ideas failed and what can be learned from them.' },
              { icon: '🧬', title: 'AI-powered Mutations & Fusions', desc: 'Intelligent combinations and transformations of existing ideas into new opportunities.' },
              { icon: '📊', title: 'Viability Scoring', desc: 'Real-time market analysis to score the potential success of revived ideas.' },
              { icon: '🛠️', title: 'Barrier-Busting Blueprints', desc: 'Actionable plans to overcome obstacles that previously killed your ideas.' },
              { icon: '🤖', title: 'Decision Maker AI', desc: 'AI-powered guidance system to help you make informed decisions about your ideas.' },
              { icon: '📡', title: 'Denodo-powered Live Data', desc: 'Real-time market data integration for accurate trend analysis and timing.' }
            ].map((feature, index) => (
              <div
                key={index}
                className="fade-in-scroll"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animationDelay: `${index * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 212, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))'
                }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#ffffff'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#b0b0b0' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Wave AI Section */}
      <section style={{ padding: '4rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="fade-in-scroll" style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#ffffff',
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.6s ease-out'
          }}>
            Why Wave AI
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { icon: '💝', title: 'Emotion-aware', desc: 'Understanding the emotional journey behind failed ideas and channeling that passion into success.' },
              { icon: '📈', title: 'Market-driven', desc: 'Leveraging real-time data and market insights to time your revival perfectly.' },
              { icon: '🧭', title: 'Compass vs. Search Engine', desc: 'Not just finding information, but providing clear direction and actionable next steps.' }
            ].map((item, index) => (
              <div
                key={index}
                className="fade-in-scroll"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animationDelay: `${index * 0.2}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#ffffff'
                }}>
                  {item.title}
                </h3>
                <p style={{ color: '#b0b0b0' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section style={{ padding: '4rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="fade-in-scroll" style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#ffffff',
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.6s ease-out'
          }}>
            How It Works
          </h2>
          
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              bottom: '0',
              width: '2px',
              background: 'linear-gradient(to bottom, #00d4ff, #0099cc)',
              transform: 'translateX(-50%)',
              zIndex: 1
            }} />
            
            {[
              { step: 1, title: 'Submit', desc: 'Upload your failed idea with details about what went wrong and why it didn\'t succeed initially.' },
              { step: 2, title: 'Autopsy', desc: 'Our AI performs a deep analysis to understand the root causes of failure and identify key learnings.' },
              { step: 3, title: 'Enrich', desc: 'We integrate real-time market data and trends to provide current context and opportunities.' },
              { step: 4, title: 'Analyze', desc: 'Generate comprehensive viability scores and identify the best paths forward for your idea.' },
              { step: 5, title: 'Revive', desc: 'Receive your personalized actionable blueprint with clear steps to bring your idea back to life.' }
            ].map((item, index) => (
              <div
                key={index}
                className="fade-in-scroll"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '3rem',
                  position: 'relative',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  transition: 'all 0.6s ease-out',
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {/* Timeline circle */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  zIndex: 2,
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
                }}>
                  {item.step}
                </div>
                
                {/* Content */}
                <div style={{
                  width: index % 2 === 0 ? '45%' : 'calc(45% + 60px)',
                  marginLeft: index % 2 === 0 ? '0' : 'auto',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  textAlign: index % 2 === 0 ? 'right' : 'left'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#00d4ff'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#b0b0b0', fontSize: '0.95rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '4rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#ffffff'
            }}>
              Ready to Resurrect Your Ideas?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              color: '#b0b0b0'
            }}>
              Give your abandoned ideas a second chance.
            </p>
            <button
              onClick={handleTryForFree}
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: '#ffffff',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
              }}
            >
              Try for Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        background: 'rgba(0, 0, 0, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <a href="#" style={{ 
              color: '#00d4ff', 
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              padding: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" style={{ 
              color: '#00d4ff', 
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              padding: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" style={{ 
              color: '#00d4ff', 
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              padding: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
          <p style={{ color: '#808080', fontSize: '0.9rem' }}>
            © 2025 Wave AI. All Rights Reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 0.6; 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.9; 
          }
        }
        
        .fade-in-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        .fade-in-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Enhanced particle effects */
        .particle {
          animation: float 8s ease-in-out infinite;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Enhanced button effects */
        button:hover {
          transform: translateY(-2px) scale(1.05);
        }
        
        button:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>
    </div>
  );
}

export default LandingNew;
