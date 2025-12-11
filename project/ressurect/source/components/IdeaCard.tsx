import React from 'react';
import { Lightbulb } from 'lucide-react';

interface IdeaCardProps {
  idea: string;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <div className="bg-[#1E1E1E] p-6 rounded-xl shadow-2xl border border-[#2A2A2A] hover:border-[#009DFF] hover:shadow-[0_0_20px_rgba(0,157,255,0.3)] transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#009DFF]/10 rounded-lg">
          <Lightbulb className="w-6 h-6 text-[#009DFF]" />
        </div>
        <h2 className="text-xl font-bold text-[#009DFF]">
          Original Idea
        </h2>
      </div>
      <p className="text-[#FFFFFF] leading-relaxed text-base">
        {idea}
      </p>
    </div>
  );
};