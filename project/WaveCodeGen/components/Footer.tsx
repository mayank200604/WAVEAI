import React from 'react';
import { ChromeRingLogo } from './IconComponents';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer flex-shrink-0 bg-gradient-to-r from-slate-900/60 via-slate-800/60 to-slate-900/60 backdrop-blur-md border-t border-blue-500/15 shadow-lg shadow-black/20">
      <div className="w-full max-w-[1920px] mx-auto">
        <div className="flex items-center justify-center h-12 sm:h-14 py-2 px-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <ChromeRingLogo className="h-4 w-4 sm:h-5 sm:w-5 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors text-center">
                    <span className="hidden sm:inline">WaveCodeGen © 2025 • </span>AI-Powered Code Generation
                </p>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
