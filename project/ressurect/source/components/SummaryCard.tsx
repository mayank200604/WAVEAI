import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  return (
    <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#009DFF]/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#009DFF]/20 rounded-lg">
          <FileText className="w-6 h-6 text-[#009DFF]" />
        </div>
        <h3 className="text-xl font-bold text-[#009DFF] flex items-center gap-2">
          Session Summary
          <Sparkles className="w-5 h-5" />
        </h3>
      </div>
      
      <div className="bg-[#2A2A2A] p-4 rounded-lg">
        <div className="text-[#FFFFFF] leading-relaxed whitespace-pre-line">
          {summary || "Answers will be compiled here as you progress."}
        </div>
      </div>
    </div>
  );
};