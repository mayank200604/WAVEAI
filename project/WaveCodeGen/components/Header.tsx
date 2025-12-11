
import React from 'react';
import { ChromeRingLogo } from './IconComponents';

interface HeaderProps {
  promptCredits: number;
  onOpenCredits?: () => void;
  isUnlimited?: boolean;
}

const Header: React.FC<HeaderProps> = ({ promptCredits, onOpenCredits, isUnlimited }) => {
  return (
    <header className="app-header w-full bg-slate-950 backdrop-blur-md border-b border-blue-500/30 flex-shrink-0 shadow-lg shadow-blue-500/20 relative">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 py-2 sm:py-3 md:py-4 min-h-[56px] sm:min-h-[64px]">
          <a href="#" className="flex-shrink-0 flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <ChromeRingLogo className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0" />
            <span className="font-orbitron text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">WaveCodeGen</span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button 
              onClick={() => onOpenCredits && onOpenCredits()} 
              aria-label={isUnlimited ? 'Unlimited credits' : `${promptCredits} credits remaining`} 
              className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold transition-all duration-300 border focus:outline-none backdrop-blur-sm whitespace-nowrap ${isUnlimited ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20' : promptCredits > 0 ? 'border-blue-500/50 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20' : 'border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20'}`}
            >
              {isUnlimited ? '∞ Unlimited' : `${promptCredits} ${promptCredits === 1 ? 'Credit' : 'Credits'}`}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;