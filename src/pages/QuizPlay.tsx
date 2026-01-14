import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Pause, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizQuestion, QuizSettings, QuizAttempt } from '@/types/quiz';
import { getQuiz, saveAttempt, updateQuizStats, updateUserStats } from '@/lib/quizStorage';
import { prepareQuizQuestions } from '@/lib/quizParser';
import { Button } from '@/components/ui/button';
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
  
  const hasTriggeredConfetti = useRef(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
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
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const loadedQuiz = await getQuiz(id);
        if (!loadedQuiz) {
          navigate('/');
          return;
        }

        setQuiz(loadedQuiz);

        const settingsData = sessionStorage.getItem('quizSettings');
        let settings: QuizSettings = {
          shuffleQuestions: false,
          shuffleAnswers: true,
          questionRange: { enabled: false, start: 1, end: loadedQuiz.questions.length },
        };

        if (settingsData) {
          const parsed = JSON.parse(settingsData);
          if (parsed.quizId === id) {
            settings = parsed.settings;
          }
          sessionStorage.removeItem('quizSettings');
        }

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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#10b981', '#34d399'],
    });
  }, []);

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
      setTimeout(triggerConfetti, 150);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setIsTimerRunning(false);

      const correctCount = answers.filter(a => a.isCorrect).length;
      const score = Math.round((correctCount / questions.length) * 100);

      const attempt: QuizAttempt = {
        id: crypto.randomUUID(),
        quizId: quiz!.id,
        quizName: quiz!.name,
        score,
        totalQuestions: questions.length,
        timeSpent: seconds,
        completedAt: Date.now(),
        answers,
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
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleExit = () => {
    setShowExitDialog(true);
    setIsPaused(true);
  };

  const confirmExit = () => {
    navigate('/');
  };

  const getOptionState = (label: string) => {
    if (!showResult) {
      return 'default';
    }
    if (label === currentQuestion.correctAnswer) {
      return 'correct';
    }
    if (label === selectedAnswer && label !== currentQuestion.correctAnswer) {
      return 'wrong';
    }
    return 'disabled';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-violet-700 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz || !currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-violet-700 flex flex-col">
      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && !showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={handlePauseToggle}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Pause className="w-10 h-10 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Paused</h2>
              <p className="text-gray-500 mb-6">Take your time</p>
              <Button
                onClick={handlePauseToggle}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/30"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          {/* Back/Exit Button */}
          <button
            onClick={handleExit}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Question Counter */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-bold text-lg"
          >
            {String(currentIndex + 1).padStart(2, '0')} of {String(questions.length).padStart(2, '0')}
          </motion.div>

          {/* Timer */}
          <button
            onClick={handlePauseToggle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-400 text-amber-900 font-bold shadow-lg shadow-amber-400/30"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-200" />
            </div>
            <span className="tabular-nums">{formatTime(seconds)}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 px-5 pb-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* White Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-purple-900/20 mb-6">
              <p className="text-sm text-gray-400 font-medium mb-3">
                {quiz.name}
              </p>
              <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
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
                      ${state === 'default' ? 'bg-white shadow-md hover:shadow-lg' : ''}
                      ${state === 'correct' ? 'bg-emerald-50 shadow-md ring-2 ring-emerald-400' : ''}
                      ${state === 'wrong' ? 'bg-red-50 shadow-md ring-2 ring-red-400' : ''}
                      ${state === 'disabled' ? 'bg-white/80 shadow-sm' : ''}
                      ${!showResult ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}
                    `}
                  >
                    <span className={`
                      font-semibold text-base leading-snug pr-4
                      ${state === 'correct' ? 'text-emerald-700' : ''}
                      ${state === 'wrong' ? 'text-red-700' : ''}
                      ${state === 'default' || state === 'disabled' ? 'text-gray-800' : ''}
                    `}>
                      {option.text}
                    </span>

                    {/* Result Icon */}
                    {showResult && state === 'correct' && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                    {showResult && state === 'wrong' && (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                      >
                        <X className="w-5 h-5 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Button
                onClick={handleNext}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/30 border-0"
              >
                {isLastQuestion ? 'View Results' : 'Next'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Testni bekor qilmoqchimisiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Natijalaringiz saqlanmaydi. Ishonchingiz komilmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={() => setIsPaused(false)}
              className="rounded-xl h-12"
            >
              Davom etish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="rounded-xl h-12 bg-red-500 hover:bg-red-600"
            >
              Chiqish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizPlay;
