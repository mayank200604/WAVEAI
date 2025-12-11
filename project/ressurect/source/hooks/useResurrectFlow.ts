import { useState, useCallback } from 'react';
import { questionsData } from '../data/questionsData';

export const useResurrectFlow = () => {
  const [availableQuestions, setAvailableQuestions] = useState(
    questionsData.map(item => ({ q: item.question, a: item.answer }))
  );
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const selectQuestion = useCallback((index: number) => {
    const selected = availableQuestions[index];
    setCurrentQuestion(selected.q);
    setCurrentAnswer(selected.a);
    setHasStarted(true);

    // Add to session summary
    const newSummary = sessionSummary + '• ' + selected.a + '\n';
    setSessionSummary(newSummary);

    // Remove selected question from available questions
    const updatedQuestions = availableQuestions.filter((_, i) => i !== index);
    setAvailableQuestions(updatedQuestions);
  }, [availableQuestions, sessionSummary]);

  const handleValidate = useCallback(() => {
    console.log('Navigating to validation...');
    alert('Validation feature would be implemented here');
  }, []);

  const handleMutate = useCallback(() => {
    console.log('Navigating to mutation...');
    alert('Mutation feature would be implemented here');
  }, []);

  const handleBuild = useCallback(() => {
    console.log('Navigating to build...');
    alert('Build feature would be implemented here');
  }, []);

  const canProceed = hasStarted;

  return {
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
  };
};