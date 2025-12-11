import React from 'react';
import { 
  Shield, 
  Shuffle, 
  Hammer
} from 'lucide-react';

interface ActionButtonsProps {
  onValidate: () => void;
  onMutate: () => void;
  onBuild: () => void;
  canProceed: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onValidate,
  onMutate,
  onBuild,
  canProceed,
}) => {
  const buttonClass = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-[#2A2A2A] text-[#FFFFFF] hover:bg-[#3A3A3A] transform hover:-translate-y-1";
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      <button
        onClick={onValidate}
        disabled={!canProceed}
        className={`${buttonClass} ${
          !canProceed
            ? 'bg-[#1A1A1A] text-[#B0B0B0] cursor-not-allowed hover:bg-[#1A1A1A] hover:transform-none'
            : ''
        }`}
      >
        <Shield className="w-4 h-4" />
        Validate
      </button>
      
      <button
        onClick={onMutate}
        disabled={!canProceed}
        className={`${buttonClass} ${
          !canProceed
            ? 'bg-[#1A1A1A] text-[#B0B0B0] cursor-not-allowed hover:bg-[#1A1A1A] hover:transform-none'
            : ''
        }`}
      >
        <Shuffle className="w-4 h-4" />
        Mutate
      </button>
      
      <button
        onClick={onBuild}
        disabled={!canProceed}
        className={`${buttonClass} ${
          !canProceed
            ? 'bg-[#1A1A1A] text-[#B0B0B0] cursor-not-allowed hover:bg-[#1A1A1A] hover:transform-none'
            : ''
        }`}
      >
        <Hammer className="w-4 h-4" />
        Build
      </button>
    </div>
  );
};