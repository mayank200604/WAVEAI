import React from 'react';
import { MessageSquare, Brain } from 'lucide-react';

interface QuestionCardProps {
  currentQuestion: string;
  currentAnswer: string;
  availableQuestions: Array<{ q: string; a: string }>;
  onSelectQuestion: (index: number) => void;
  hasStarted: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  currentQuestion,
  currentAnswer,
  availableQuestions,
  onSelectQuestion,
  hasStarted
}) => {
  if (availableQuestions.length === 0) {
    return (
      <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#06D6A0] text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-[#06D6A0]" />
          <h3 className="text-lg font-semibold text-[#06D6A0]">Analysis Complete</h3>
        </div>
        <p className="text-[#FFFFFF]">
          All questions answered. Review the session summary below to proceed with your next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-xl shadow-2xl border border-[#2A2A2A] hover:border-[#009DFF] hover:shadow-[0_0_20px_rgba(0,157,255,0.3)] transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#009DFF]/10 rounded-lg">
          <MessageSquare className="w-6 h-6 text-[#009DFF]" />
        </div>
        <h3 className="text-lg font-bold text-[#009DFF]">
          Interactive Q&A
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-[#2A2A2A] p-4 rounded-lg border-l-4 border-[#009DFF]">
          <p className="font-medium text-[#FFFFFF] text-base">
            {hasStarted ? currentQuestion : "Select a question below to begin:"}
          </p>
        </div>
        
        {hasStarted && (
          <div className="bg-[#009DFF]/10 p-4 rounded-lg border-l-4 border-[#009DFF]">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-[#009DFF]" />
              <span className="text-sm font-medium text-[#009DFF]">AI Analysis</span>
            </div>
            <p className="text-[#FFFFFF] leading-relaxed">
              {currentAnswer}
            </p>
          </div>
        )}

        {availableQuestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[#B0B0B0] mb-3">
              {hasStarted ? "Select another question:" : "AI will guide you by analyzing your responses step by step."}
            </h4>
            <div className="grid gap-2">
              {availableQuestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onSelectQuestion(index)}
                  className="text-left p-3 bg-[#2A2A2A] rounded-lg text-[#FFFFFF] hover:bg-[#3A3A3A] transition-all duration-200 text-sm"
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};