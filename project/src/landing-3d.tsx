import { useNavigate } from "react-router-dom";
import { useRef } from "react";

function Landing3D() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTryForFree = () => {
    navigate("/login");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Courier+Prime:wght@400;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Orbitron', 'Inter', sans-serif;
          background: #000;
          color: #fff;
          overflow-x: hidden;
          perspective: 1000px;
        }

        /* Fade-in animations for all elements */
        .fade-in-element {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s ease forwards;
        }

        .fade-in-delay-1 { animation-delay: 0.2s; }
        .fade-in-delay-2 { animation-delay: 0.4s; }
        .fade-in-delay-3 { animation-delay: 0.6s; }
        .fade-in-delay-4 { animation-delay: 0.8s; }
        .fade-in-delay-5 { animation-delay: 1.0s; }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* How It Works Animation */
        #how-it-works {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s ease-out;
        }

        #how-it-works.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        #how-it-works .timeline-item-3d {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }

        #how-it-works.animate-in .timeline-item-3d:nth-child(1) {
          animation: dropDown 0.8s ease-out 0.2s forwards;
        }

        #how-it-works.animate-in .timeline-item-3d:nth-child(2) {
          animation: dropDown 0.8s ease-out 0.4s forwards;
        }

        #how-it-works.animate-in .timeline-item-3d:nth-child(3) {
          animation: dropDown 0.8s ease-out 0.6s forwards;
        }

        #how-it-works.animate-in .timeline-item-3d:nth-child(4) {
          animation: dropDown 0.8s ease-out 0.8s forwards;
        }

        @keyframes dropDown {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .landing-3d {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
          position: relative;
          transform-style: preserve-3d;
        }

        /* Header Navigation */
        .header-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
          z-index: 1000;
          padding: 1rem 2rem;
          transition: all 0.3s ease;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #00d4ff;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-menu {
          display: flex;
          gap: 2rem;
          list-style: none;
        }

        .nav-menu a {
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .nav-menu a:hover {
          color: #00d4ff;
          background: rgba(0, 212, 255, 0.1);
        }

        .particles-3d-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          transform-style: preserve-3d;
        }

        @keyframes float3d {
          0% {
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, -100vh, 0) rotateX(360deg) rotateY(360deg);
            opacity: 0;
          }
        }

        .hero-3d {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          z-index: 10;
          transform-style: preserve-3d;
          padding-top: 80px; /* Account for fixed header */
        }

        .hero-content-3d {
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }

        .title-3d {
          font-size: clamp(4rem, 12vw, 8rem);
          font-weight: 900;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
          transform-style: preserve-3d;
          animation: titleFloat 6s ease-in-out infinite;
        }

        @keyframes titleFloat {
          0%, 100% {
            transform: translateZ(0px) rotateX(0deg);
          }
          50% {
            transform: translateZ(20px) rotateX(2deg);
          }
        }

        .subtitle-3d {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          margin-bottom: 1rem;
          color: #00d4ff;
          transform: translateZ(10px);
          animation: subtitleGlow 4s ease-in-out infinite alternate;
          font-family: 'Necosmic', 'Orbitron', sans-serif;
        }

        @keyframes subtitleGlow {
          0% {
            text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
          }
          100% {
            text-shadow: 0 0 40px rgba(0, 212, 255, 0.8);
          }
        }

        .tagline-3d {
          font-size: clamp(1rem, 2vw, 1.5rem);
          margin-bottom: 3rem;
          color: #b0b0b0;
          font-weight: 700;
          transform: translateZ(5px);
          animation: taglinePulse 8s ease-in-out infinite;
          font-family: 'Courier Prime', 'Courier New', monospace;
        }

        @keyframes taglinePulse {
          0%, 100% {
            opacity: 0.8;
            transform: translateZ(5px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateZ(15px) scale(1.02);
          }
        }

        .cta-button-3d {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border: none;
          padding: 1.5rem 3rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #000;
          border-radius: 50px;
          cursor: pointer;
          transform: translateZ(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .cta-button-3d:hover {
          transform: translateZ(30px) scale(1.05);
          box-shadow: 0 20px 60px rgba(0, 212, 255, 0.5);
          background: linear-gradient(135deg, #00e5ff, #00b8d4);
        }

        .section-3d {
          padding: 8rem 2rem;
          position: relative;
          transform-style: preserve-3d;
        }

        .container-3d {
          max-width: 1200px;
          margin: 0 auto;
          transform-style: preserve-3d;
        }

        .section-title-3d {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 700;
          text-align: center;
          margin-bottom: 4rem;
          background: linear-gradient(135deg, #ffffff, #00d4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transform: translateZ(10px);
        }

        .glass-card-3d {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3rem;
          margin: 2rem 0;
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .glass-card-3d:hover {
          transform: translateZ(20px) rotateX(5deg);
          box-shadow: 0 20px 60px rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.3);
        }

        .features-grid-3d {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 3rem;
          margin: 4rem 0;
          transform-style: preserve-3d;
        }

        .feature-card-3d {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2.5rem;
          text-align: center;
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .feature-card-3d::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card-3d:hover::before {
          opacity: 1;
        }

        .feature-card-3d:hover {
          transform: translateZ(30px) rotateY(5deg);
          border-color: rgba(0, 212, 255, 0.3);
          box-shadow: 0 15px 50px rgba(0, 212, 255, 0.2);
        }

        .feature-icon-3d {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateZ(10px);
          transition: all 0.3s ease;
        }

        .feature-card-3d:hover .feature-icon-3d {
          transform: translateZ(20px) rotateY(360deg);
        }

        .timeline-3d {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          transform-style: preserve-3d;
        }

        .timeline-item-3d {
          display: flex;
          align-items: center;
          margin: 4rem 0;
          transform-style: preserve-3d;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(50px) translateZ(-20px);
        }

        .timeline-item-3d.fade-in-active {
          opacity: 1;
          transform: translateY(0) translateZ(0);
        }

        .timeline-item-3d:hover {
          transform: translateZ(20px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3);
        }

        .timeline-item-3d:nth-child(even) {
          animation-delay: 0.2s;
        }

        .timeline-item-3d:nth-child(odd) {
          animation-delay: 0.4s;
        }

        .timeline-number-3d {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.5rem;
          color: #000;
          margin-right: 2rem;
          transform: translateZ(15px);
          box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
        }

        .timeline-content-3d {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          transform: translateZ(5px);
        }

        .floating-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1));
          animation: floatingShape 20s infinite linear;
        }

        @keyframes floatingShape {
          0% {
            transform: translate3d(-100px, 100vh, 0) rotate(0deg);
          }
          100% {
            transform: translate3d(100vw, -100px, 0) rotate(360deg);
          }
        }

        .scroll-indicator {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }

        @media (max-width: 768px) {
          .hero-content-3d {
            padding: 0 1rem;
          }
          
          .features-grid-3d {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .timeline-item-3d {
            flex-direction: column;
            text-align: center;
          }
          
          .timeline-number-3d {
            margin-right: 0;
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div className="landing-3d" ref={containerRef}>
        {/* Header Navigation */}
        <header className="header-nav">
          <div className="nav-container">
            <a href="#home" className="nav-logo">
              <img src="/wave_logo.png" alt="Wave AI" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              WAVE AI
            </a>
            <nav className="nav-menu">
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
              <button onClick={handleTryForFree} style={{ 
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)', 
                border: 'none', 
                padding: '0.5rem 1.5rem', 
                borderRadius: '25px', 
                color: '#000', 
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Try for Free
              </button>
            </nav>
          </div>
        </header>

        {/* 3D Particles */}
        <div className="particles-3d-container" id="particles-3d" />

        {/* Floating Elements */}
        <div className="floating-elements">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="floating-shape"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${Math.random() * 10 + 15}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <section id="home" className="hero-3d">
          <div className="hero-content-3d">
            <h1 className="title-3d fade-in-element">WAVE AI</h1>
            <h2 className="subtitle-3d fade-in-element fade-in-delay-1">The Idea Graveyard</h2>
            <div className="fade-in-element fade-in-delay-2" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
              <img 
                src="/wave_logo.png" 
                alt="Wave AI Logo" 
                style={{ 
                  width: '300px', 
                  height: '300px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 40px rgba(0, 212, 255, 0.7))'
                }} 
              />
            </div>
            <p className="fade-in-element fade-in-delay-3" style={{ fontSize: '1.25rem', marginBottom: '3rem', color: '#cccccc', transform: 'translateZ(8px)' }}>
              Transform abandoned ideas into future successes with AI + live data
            </p>
            <button onClick={handleTryForFree} className="cta-button-3d fade-in-element fade-in-delay-4">
              Try for Free
            </button>
          </div>
        </section>

        {/* What Inspired Section */}
        <section id="about" className="section-3d">
          <div className="container-3d">
            <div className="glass-card-3d fade-in-element">
              <h2 className="section-title-3d fade-in-element fade-in-delay-1">What Inspired This Idea?</h2>
              <p className="fade-in-element fade-in-delay-2" style={{ fontSize: '1.25rem', lineHeight: '1.8', textAlign: 'center', color: '#e0e0e0' }}>
                Wave AI was born from a simple truth: most great ideas die not because they're bad — but because they're mistimed, misunderstood, or under-resourced. We built Wave to give those ideas a second life, powered by AI, empathy, and real-time insight.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="section-3d">
          <div className="container-3d">
            <div className="glass-card-3d">
              <h2 className="section-title-3d">About Wave AI</h2>
              <p style={{ fontSize: '1.25rem', lineHeight: '1.8', textAlign: 'center', color: '#e0e0e0' }}>
                Wave AI isn't just an idea repository — it's an innovation engine. Upload failed ideas, run an autopsy, and let AI + real-time market data guide you with viability scores, creative pivots, and actionable blueprints.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section id="features" className="section-3d">
          <div className="container-3d">
            <h2 className="section-title-3d">Key Features</h2>
            <div className="features-grid-3d">
              {[
                { icon: "🔍", title: "Idea Logging & Autopsy", desc: "Deep dive analysis of why ideas failed and what can be learned from them." },
                { icon: "🧬", title: "AI-powered Mutations & Fusions", desc: "Intelligent combinations and transformations of existing ideas into new opportunities." },
                { icon: "📊", title: "Viability Scoring", desc: "Real-time market analysis to score the potential success of revived ideas." },
                { icon: "🛠️", title: "Barrier-Busting Blueprints", desc: "Actionable plans to overcome obstacles that previously killed your ideas." },
                { icon: "🤖", title: "Decision Maker AI", desc: "AI-powered guidance system to help you make informed decisions about your ideas." },
                { icon: "📡", title: "Live Data Integration", desc: "Real-time market data integration for accurate trend analysis and timing." },
              ].map((feature, index) => (
                <div key={index} className="feature-card-3d">
                  <div className="feature-icon-3d">
                    <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#fff' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#b0b0b0', lineHeight: '1.6' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section-3d">
          <div className="container-3d">
            <h2 className="section-title-3d">How It Works</h2>
            <div className="timeline-3d">
              {[
                { title: "Submit Your Failed Idea", desc: "Upload your abandoned idea with comprehensive details about what went wrong, why it failed, and what obstacles you encountered." },
                { title: "AI-Powered Autopsy", desc: "Our advanced AI performs a deep forensic analysis to understand the root causes of failure and identify exactly what went wrong." },
                { title: "Real-Time Data Enrichment", desc: "We integrate live market data, current trends, and competitive intelligence to provide fresh context and opportunities." },
                { title: "Comprehensive Analysis", desc: "Generate detailed viability scores, market opportunity assessments, and strategic recommendations for optimal revival timing." },
                { title: "Actionable Revival Blueprint", desc: "Receive your personalized step-by-step roadmap with specific actions, resource requirements, and success metrics." },
              ].map((step, index) => (
                <div key={index} className="timeline-item-3d">
                  <div className="timeline-number-3d">{index + 1}</div>
                  <div className="timeline-content-3d">
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#00d4ff' }}>
                      {step.title}
                    </h3>
                    <p style={{ color: '#e0e0e0', lineHeight: '1.6' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-3d">
          <div className="container-3d">
            <div className="glass-card-3d" style={{ textAlign: 'center' }}>
              <h2 className="section-title-3d">Ideas Don't Die. They Evolve.</h2>
              <p style={{ fontSize: '1.25rem', marginBottom: '3rem', color: '#b0b0b0' }}>
                Give your abandoned ideas a second chance.
              </p>
              <button onClick={handleTryForFree} className="cta-button-3d">
                Try for Free
              </button>
            </div>
          </div>
        </section>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </div>
    </>
  );
}

export default Landing3D;
