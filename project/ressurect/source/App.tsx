import React from 'react';
import { IdeaCard } from './components/IdeaCard';
import { QuestionCard } from './components/QuestionCard';
import { SummaryCard } from './components/SummaryCard';
import { ActionButtons } from './components/ActionButtons';
import { useResurrectFlow } from './hooks/useResurrectFlow';
import { originalIdea } from './data/questionsData';

function App() {
  const {
    availableQuestions,
    currentQuestion,
    currentAnswer,
    sessionSummary,
    hasStarted,
    canProceed,
    selectQuestion,
    handleValidate,
    handleMutate,
    handleBuild
  } = useResurrectFlow();

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23009DFF%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#009DFF] mb-4">
            Resurrect Your Idea
          </h1>
          <p className="text-[#B0B0B0] text-lg max-w-2xl mx-auto px-4">
            Transform your business concept through AI-powered analysis and strategic questioning
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 pb-12 space-y-8">
          {/* Original Idea Card */}
          <IdeaCard idea={originalIdea} />

          {/* Question Card */}
          <QuestionCard
            currentQuestion={currentQuestion}
            currentAnswer={currentAnswer}
            availableQuestions={availableQuestions}
            onSelectQuestion={selectQuestion}
            hasStarted={hasStarted}
          />

          {/* Summary Card */}
          <SummaryCard summary={sessionSummary} />

          {/* Action Buttons */}
          <ActionButtons
            onNext={() => {}} // No longer needed with interactive selection
            onValidate={handleValidate}
            onMutate={handleMutate}
            onBuild={handleBuild}
            canProceed={canProceed}
          />
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-[#B0B0B0]">
          <p className="text-sm">
            Powered by AI-driven insights • Build better ideas faster
          </p>
        </div>
      </div>
    </div>
  )
}

export default App;