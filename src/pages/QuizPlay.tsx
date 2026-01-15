import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Pause, Play, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizQuestion, QuizSettings, QuizAttempt } from '@/types/quiz';
import { getQuiz, saveAttempt, updateQuizStats, updateUserStats } from '@/lib/quizStorage';
import { prepareQuizQuestions } from '@/lib/quizParser';
import { Button } from '@/components/ui/button';
import { GlowIcon } from '@/components/GlowIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<QuizAttempt['answers']>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [fastMode, setFastMode] = useState(false);
  
  const hasTriggeredConfetti = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isPaused) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    async function loadQuiz() {
      if (!id) { navigate('/'); return; }

      try {
        const loadedQuiz = await getQuiz(id);
        if (!loadedQuiz) { navigate('/'); return; }

        setQuiz(loadedQuiz);

        const settingsData = sessionStorage.getItem('quizSettings');
        let settings: QuizSettings = {
          shuffleQuestions: false,
          shuffleAnswers: true,
          fastMode: false,
          questionRange: { enabled: false, start: 1, end: loadedQuiz.questions.length },
        };

        if (settingsData) {
          const parsed = JSON.parse(settingsData);
          if (parsed.quizId === id) settings = parsed.settings;
          sessionStorage.removeItem('quizSettings');
        }

        setFastMode(settings.fastMode);

        const range = settings.questionRange.enabled
          ? { start: settings.questionRange.start, end: settings.questionRange.end }
          : undefined;

        const preparedQuestions = prepareQuizQuestions(loadedQuiz.questions, {
          shuffleQuestions: settings.shuffleQuestions,
          shuffleAnswers: settings.shuffleAnswers,
          range,
        });

        setQuestions(preparedQuestions);
      } catch (error) {
        console.error('Error loading quiz:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [id, navigate]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  const triggerConfetti = useCallback(() => {
    if (hasTriggeredConfetti.current) return;
    hasTriggeredConfetti.current = true;
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#10b981', '#34d399'],
    });
  }, []);

  const goToNext = useCallback(async () => {
    if (isLastQuestion) {
      setIsTimerRunning(false);
      const correctCount = answers.filter(a => a.isCorrect).length + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
      const finalAnswers = [...answers];
      if (selectedAnswer) {
        finalAnswers.push({
          questionIndex: currentIndex,
          selectedAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect: selectedAnswer === currentQuestion.correctAnswer,
          questionText: currentQuestion.question,
        });
      }
      const score = Math.round((correctCount / questions.length) * 100);

      const attempt: QuizAttempt = {
        id: crypto.randomUUID(),
        quizId: quiz!.id,
        quizName: quiz!.name,
        score,
        totalQuestions: questions.length,
        timeSpent: seconds,
        completedAt: Date.now(),
        answers: finalAnswers,
      };

      await saveAttempt(attempt);
      await updateQuizStats(quiz!.id, score);
      await updateUserStats(correctCount, questions.length);

      sessionStorage.setItem('quizAttempt', JSON.stringify(attempt));
      navigate(`/results/${attempt.id}`);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [isLastQuestion, answers, selectedAnswer, currentQuestion, currentIndex, questions, quiz, seconds, navigate]);

  const handleAnswerSelect = (label: string) => {
    if (showResult) return;
    
    setSelectedAnswer(label);
    setShowResult(true);

    const isCorrect = label === currentQuestion.correctAnswer;

    setAnswers(prev => [
      ...prev,
      {
        questionIndex: currentIndex,
        selectedAnswer: label,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        questionText: currentQuestion.question,
      },
    ]);

    if (isCorrect) {
      hasTriggeredConfetti.current = false;
      setTimeout(triggerConfetti, 100);
    }

    if (fastMode) {
      setTimeout(() => {
        goToNext();
      }, isCorrect ? 600 : 1000);
    }
  };

  const handleNext = () => goToNext();
  const handlePauseToggle = () => setIsPaused(!isPaused);
  const handleExit = () => { setShowExitDialog(true); setIsPaused(true); };
  const confirmExit = () => navigate('/');

  const getOptionState = (label: string) => {
    if (!showResult) return 'default';
    if (label === currentQuestion.correctAnswer) return 'correct';
    if (label === selectedAnswer && label !== currentQuestion.correctAnswer) return 'wrong';
    return 'disabled';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz || !currentQuestion) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col"
    >
      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && !showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 flex items-center justify-center"
            onClick={handlePauseToggle}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="glass-card rounded-3xl p-8 text-center shadow-glow-violet mx-5"
              onClick={e => e.stopPropagation()}
            >
              <GlowIcon icon={Pause} color="violet" size="lg" className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Paused</h2>
              <p className="text-white/50 font-medium mb-6">Take your time</p>
              <Button
                onClick={handlePauseToggle}
                className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg shadow-glow-emerald press-effect"
              >
                <Play className="w-5 h-5 mr-2" strokeWidth={2.5} />
                Resume
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={handleExit}
            className="w-11 h-11 rounded-full glass-button flex items-center justify-center text-white/70 hover:text-white transition-colors press-effect"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-white font-bold text-lg"
          >
            {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
          </motion.div>

          <button
            onClick={handlePauseToggle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full gradient-warning text-white font-semibold shadow-glow-amber press-effect"
          >
            <Clock className="w-4 h-4" strokeWidth={2.5} />
            <span className="tabular-nums text-sm">{formatTime(seconds)}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
            className="h-full gradient-success rounded-full"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 px-5 pb-8 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {/* Question Card */}
            <div className="glass-card rounded-3xl p-6 mb-5">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-3">
                {quiz.name}
              </p>
              <h2 className="text-lg font-semibold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 flex-1">
              {currentQuestion.options.map((option) => {
                const state = getOptionState(option.label);
                
                return (
                  <motion.button
                    key={option.label}
                    onClick={() => handleAnswerSelect(option.label)}
                    disabled={showResult}
                    whileTap={!showResult ? { scale: 0.98 } : undefined}
                    className={`
                      w-full p-4 rounded-2xl text-left transition-all duration-200
                      flex items-center justify-between
                      ${state === 'default' ? 'glass-card hover:border-white/20' : ''}
                      ${state === 'correct' ? 'bg-emerald-500/20 border border-emerald-400/50 shadow-glow-emerald' : ''}
                      ${state === 'wrong' ? 'bg-red-500/20 border border-red-400/50 shadow-glow-red' : ''}
                      ${state === 'disabled' ? 'glass-card opacity-50' : ''}
                      ${!showResult ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <span className={`
                      font-medium text-sm leading-snug pr-4
                      ${state === 'correct' ? 'text-emerald-300' : ''}
                      ${state === 'wrong' ? 'text-red-300' : ''}
                      ${state === 'default' || state === 'disabled' ? 'text-white' : ''}
                    `}>
                      {option.text}
                    </span>

                    {showResult && state === 'correct' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                    {showResult && state === 'wrong' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        {!fastMode && (
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="mt-5"
              >
                <Button
                  onClick={handleNext}
                  className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg shadow-glow-emerald border-0 press-effect"
                >
                  {isLastQuestion ? 'View Results' : 'Next'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Exit Quiz?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Your progress will not be saved. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={() => setIsPaused(false)}
              className="rounded-xl h-12 font-semibold glass-button border-white/10 text-white hover:bg-white/10"
            >
              Continue
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="rounded-xl h-12 gradient-danger font-semibold shadow-glow-red"
            >
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default QuizPlay;
