import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';

const App: React.FC = () => {
  const MAX_CREDITS = 2;
  const LAST_RESTORE_KEY = 'waveCodeGenLastRestore';

  const [promptCredits, setPromptCredits] = useState(() => {
    const credits = localStorage.getItem('waveCodeGenCredits');
    return credits !== null ? JSON.parse(credits) : MAX_CREDITS;
  });

  // Restore credits once per day (based on local client date). Stores iso date (YYYY-MM-DD).
  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_RESTORE_KEY);
      const today = new Date().toISOString().slice(0, 10);
      // If user unlocked unlimited credits, don't reset them
      const unlimitedFlag = localStorage.getItem('waveCodeGenUnlimited') === 'true';
      if (!unlimitedFlag && last !== today) {
        localStorage.setItem('waveCodeGenCredits', JSON.stringify(MAX_CREDITS));
        localStorage.setItem(LAST_RESTORE_KEY, today);
        setPromptCredits(MAX_CREDITS);
      }
    } catch (e) {
      // ignore storage errors
      // console.warn('Could not access localStorage for credits', e);
    }
  }, []);

  // Keep localStorage in sync whenever credits change
  useEffect(() => {
    try {
      localStorage.setItem('waveCodeGenCredits', JSON.stringify(promptCredits));
    } catch (e) {
      // ignore
    }
  }, [promptCredits]);

  // Credits modal state
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditUnlockInput, setCreditUnlockInput] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(() => {
    try {
      return localStorage.getItem('waveCodeGenUnlimited') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleUnlockSubmit = () => {
    if (creditUnlockInput.trim() === 'Krish') {
      setIsUnlimited(true);
      try {
        localStorage.setItem('waveCodeGenUnlimited', 'true');
      } catch (e) {}
      setShowCreditsModal(false);
    } else {
      // simple feedback: clear input
      setCreditUnlockInput('');
      setShowCreditsModal(false);
    }
  };

  return (
    <div className="app-root">
      {/* Background Effects - Behind everything */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }}>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-cyan-500/[0.06] animated-grid"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-radial-gradient from-cyan-500/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-radial-gradient from-purple-600/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[15%] w-[40%] h-[40%] bg-radial-gradient from-indigo-700/15 to-transparent blur-3xl"></div>
      </div>
      
      {/* Main Layout */}
      <Header promptCredits={promptCredits} isUnlimited={isUnlimited} onOpenCredits={() => setShowCreditsModal(true)} />
      <main className="app-main">
        <Hero 
          promptCredits={promptCredits} 
          setPromptCredits={setPromptCredits}
          isUnlimited={isUnlimited}
        />
      </main>
      <Footer />

      {showCreditsModal && (
        <div className="modal-backdrop" onClick={() => setShowCreditsModal(false)}>
          <div className="modal-content w-11/12 max-w-sm bg-gray-800/90 backdrop-blur rounded-lg border border-cyan-500/20 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Enter unlock code</h3>
            <input value={creditUnlockInput} onChange={e => setCreditUnlockInput(e.target.value)} placeholder="Type your name..." className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreditsModal(false)} className="px-3 py-1 bg-gray-600 rounded">Cancel</button>
              <button onClick={handleUnlockSubmit} className="px-3 py-1 bg-cyan-600 rounded text-white">Unlock</button>
            </div>
            <p className="mt-3 text-xs text-gray-400">Tip: type your name to unlock unlimited credits.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;