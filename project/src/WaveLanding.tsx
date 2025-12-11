import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Add blob animation styles
const blobStyles = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -50px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(50px, 50px) scale(1.05); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = blobStyles;
  document.head.appendChild(styleSheet);
}

const METEOR_CONFIG = {
  maxCount: 10,
  spawnChance: 0.12,
  colorHex: '#00FFFF',
  sizeRange: [1, 3],
  opacity: 0.9,
  speedMultiplier: 0.8,
};

export default function WaveLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let meteors: Array<{
      x: number;
      y: number;
      size: number;
      length: number;
      speed: number;
      alpha: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const createMeteor = () => {
      if (meteors.length < METEOR_CONFIG.maxCount && Math.random() < METEOR_CONFIG.spawnChance) {
        meteors.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          size: Math.random() * (METEOR_CONFIG.sizeRange[1] - METEOR_CONFIG.sizeRange[0]) + METEOR_CONFIG.sizeRange[0],
          length: Math.random() * 20 + 10,
          speed: (Math.random() * 3 + 2) * METEOR_CONFIG.speedMultiplier,
          alpha: METEOR_CONFIG.opacity
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      meteors.forEach((m, i) => {
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.length * 0.6, m.y + m.length * 0.6);
        grad.addColorStop(0, METEOR_CONFIG.colorHex);
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.size;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.length, m.y + m.length);
        ctx.stroke();
        m.x -= m.speed;
        m.y += m.speed * 0.5;
        if (m.x < -50 || m.y > canvas.height + 50) meteors.splice(i, 1);
      });

      createMeteor();
      requestAnimationFrame(draw);
    };

    draw();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9 } }
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      boxShadow: '0 0 20px rgba(0,255,255,0.6)',
      transition: { duration: 0.6, delay: i * 0.1 }
    })
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <nav className="fixed top-0 left-0 w-full z-20 backdrop-blur-md bg-black/40 flex items-center justify-between px-8 py-5 border-b border-cyan-500/10">
        <a href="#home" className="flex items-center gap-2 text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
          <img src="/no_bg_wave_logo.png" alt="Wave Logo" className="h-8 w-8 object-contain"/>
           Wave AI
        </a>
        <ul className="hidden md:flex space-x-8 text-sm font-medium">
          {['About', 'Features', 'How It Works'].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="hover:text-cyan-400 transition-colors duration-200"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <button 
          onClick={() => navigate('/login')}
          className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg px-6 py-2 text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-200"
        >
          Try for Free
        </button>
      </nav>

      <section id="home" className="min-h-screen flex flex-col justify-center items-center text-center relative z-10 px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="mb-8 relative"
          style={{
            filter: 'drop-shadow(0 0 35px rgba(0,255,255,0.15))'
          }}
        >
          <img
            src="/wave_logo.png" alt="Wave Logo"
            className="h-64 md:h-80 w-auto mx-auto object-contain"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-bold text-cyan-400 mb-6 leading-tight"
        >
        Ideas Never Die 
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed"
        >
           Empowering the Next Level of Ideation and Creativity with{' '}
            <span className="text-cyan-400 font-semibold">Wave AI</span> - The World's First Idea Resurrection Engine.
        </motion.p>
        <motion.button
            onClick={() => navigate('/login')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg px-10 py-4 text-lg font-semibold shadow-lg shadow-cyan-500/40 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Try For Free</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
          </motion.button>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-cyan-300 text-2xl cursor-pointer"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          ↓
        </motion.div>
      </section>

      <motion.section
        id="about"
        className="min-h-[80vh] flex items-center justify-center px-8 py-12 relative z-10"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-3xl text-center">
          <h2 className="text-5xl font-bold text-cyan-400 mb-6">About Wave AI</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Wave AI isn't just an idea repository — it's an innovation engine. Upload failed ideas, run an autopsy, and let AI + real-time market data guide you with viability scores, creative pivots, and actionable blueprints. Built for modern innovators who demand both power and elegance.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Speed', 'Reliability', 'Innovation'].map((value) => (
              <motion.div
                key={value}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20"
              >
                <h3 className="text-cyan-300 font-semibold mb-2">{value}</h3>
                <p className="text-gray-400 text-sm">Designed with precision and care for every detail.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        className="min-h-[80vh] flex flex-col justify-center items-center space-y-12 px-8 py-12 relative z-10"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-5xl font-bold text-cyan-400">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {[
            { title: 'Idea Logging & Autopsy', desc: 'Deep dive analysis of why ideas failed and what can be learned from them.' },
            { title: 'AI-powered Mutations', desc: 'Intelligent combinations and transformations of existing ideas into new opportunities.' },
            { title: 'Viability Scoring', desc: 'Real-time market analysis to score the potential success of revived ideas.' },
            { title: 'Barrier-Busting Blueprints', desc: 'Actionable plans to overcome obstacles that previously killed your ideas.' },
            { title: 'Decision Maker AI', desc: 'AI-powered guidance system to help you make informed decisions about your ideas.' },
            { title: 'Denodo-powered Live Data', desc: 'Real-time market data integration for accurate trend analysis and timing.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -8, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3)' }}
              className="bg-gradient-to-br from-gray-800/50 to-cyan-900/20 rounded-2xl p-8 border border-cyan-500/20 shadow-xl hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
            >
              <div className="w-12 h-12 mb-4 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                <div className="w-6 h-6 border-2 border-cyan-400 rounded group-hover:scale-110 transition-transform"></div>
              </div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-3 group-hover:text-cyan-200 transition-colors">{feature.title}</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        className="min-h-[80vh] flex flex-col justify-center items-center px-8 py-12 relative z-10" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-5xl font-bold text-cyan-400 mb-16">How It Works</h2>
        <div className="w-full max-w-3xl">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-500" />
            <div className="space-y-8 pl-16">
              {[
                { title: 'Submit', desc: 'Upload your failed idea with details about what went wrong and why it didn\'t succeed initially.' },
                { title: 'Autopsy', desc: 'Our AI performs a deep analysis to understand the root causes of failure and identify key learnings.' },
                { title: 'Enrich', desc: 'We integrate real-time market data and trends to provide current context and opportunities.' },
                { title: 'Analyze', desc: 'Generate comprehensive viability scores and identify the best paths forward for your idea.' },
                { title: 'Revive', desc: 'Receive your personalized actionable blueprint with clear steps to bring your idea back to life.' }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  className="bg-gradient-to-r from-black/50 to-cyan-900/20 rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
                >
                  <div className="absolute -left-8 w-4 h-4 bg-cyan-500 rounded-full border-4 border-black" />
                  <h4 className="text-cyan-300 font-semibold text-lg mb-2">Step {i + 1}: {step.title}</h4>
                  <p className="text-gray-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="min-h-screen flex flex-col justify-center items-center px-8 py-20 relative z-10"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="text-center max-w-3xl">
          <h2 className="text-5xl font-bold text-cyan-400 mb-6">Ready to ride the wave?</h2>
          <p className="text-lg text-gray-300 mb-8">Join hundreds of teams transforming their ideas and business.</p>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg px-8 py-4 text-lg font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-200"
          >
            Start Your Free Trial
          </motion.button>
        </div>
      </motion.section>

      <footer className="text-center text-gray-500 py-8 text-sm border-t border-cyan-500/10 relative z-10">
        © 2025 Wave AI. All rights reserved.
      </footer>

      {/* Support Bot */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-4 rounded-full shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-110 animate-pulse"
          onClick={() => {
            // Simple support bot functionality
            const message = "Hi! 👋 Welcome to Wave AI!\n\nI'm here to help you get started:\n\n• Click 'Try for Free' to create your account\n• Use Google sign-in for quick access\n• Explore our AI-powered features\n\nNeed help? Contact us at support@wave.ai";
            alert(message);
          }}
          title="Need Help? Click for support!"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.529-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
