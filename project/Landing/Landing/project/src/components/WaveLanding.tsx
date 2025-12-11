import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import QABot from './QABot';

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }
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
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <nav className="fixed top-0 left-0 w-full z-20 backdrop-blur-md bg-black/40 flex items-center justify-between px-8 py-5 border-b border-cyan-500/10">
        <a href="#home" className="flex items-center gap-2 text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
          <img src="./no_bg_wave_logo.png" alt="Wave Logo"className="h-8 w-8 object-contain"/>
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
        <a href="login.html" className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg px-6 py-2 text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-200">
          Try for Free
        </a>
      </nav>

      <section id="home" className="h-screen flex flex-col justify-center items-center text-center relative z-10 px-4 pt-32">  <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-8 relative"
          style={{
            filter: 'drop-shadow(0 0 35px rgba(0,255,255,0.15))'
          }}
        >
          <img
            src="./wave_logo.png" alt="Wave Logo"
            className="h-96 md:h-112 w-auto mx-auto object-contain"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-7xl font-bold text-cyan-400 mb-6 leading-tight"
        >
        Ideas Never Die 
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-xl text-gray-300 max-w-2xl mb-4"
        >
           Empowering the Next level of Ideation and Creativity with <br></br>
            <b>Wave AI</b> - The World's first Idea Ressurection Engine.
        <br></br>
        <br></br>
        </motion.p>
        <motion.a
            href="login.html"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg px-8 py-4 text-lg font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-200"
          >
            Try For Free
          </motion.a>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 text-cyan-300 text-2xl"
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
          <h2 className="text-5xl font-bold text-cyan-400 mb-6">About Wave</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Wave is designed to flow seamlessly across ideas, actions, and intelligence — connecting every part of the process through clarity and motion. Built for modern teams who demand both power and elegance.
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
            { title: 'Real-time Sync', desc: 'Instant synchronization across all devices with zero latency.' },
            { title: 'AI-Powered', desc: 'Intelligent automation that adapts to your workflow.' },
            { title: 'Secure & Private', desc: 'Enterprise-grade encryption for complete peace of mind.' },
            { title: 'Scalable', desc: 'Grows with your needs from startup to enterprise.' },
            { title: 'Intuitive UI', desc: 'Beautiful design that feels natural to use.' },
            { title: '24/7 Support', desc: 'Always-on support from our dedicated team.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-black/50 to-cyan-900/20 rounded-2xl p-8 border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/20 transition-shadow duration-300"
            >
              <div className="text-cyan-400 text-4xl mb-4">✦</div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
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
                { title: 'Connect', desc: 'Link your data sources and integrate with your existing tools.' },
                { title: 'Configure', desc: 'Set up workflows that match your unique business needs.' },
                { title: 'Automate', desc: 'Let Wave handle repetitive tasks intelligently.' },
                { title: 'Scale', desc: 'Watch productivity soar as your team works smarter.' }
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
          <motion.a
            href="login.html"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg px-8 py-4 text-lg font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-200"
          >
            Start Your Free Trial
          </motion.a>
        </div>
      </motion.section>

      <footer className="text-center text-gray-500 py-8 text-sm border-t border-cyan-500/10 relative z-10">
        © 2025 Wave. All rights reserved.
      </footer>

      {/* Q&A Support Bot */}
      <QABot />
    </div>
  );
}
