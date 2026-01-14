import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizQuestion, QuizSettings, QuizAttempt } from '@/types/quiz';
import { getQuiz, saveAttempt, updateQuizStats, updateUserStats } from '@/lib/quizStorage';
import { prepareQuizQuestions } from '@/lib/quizParser';
import { AnswerOption } from '@/components/quiz/AnswerOption';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { Timer } from '@/components/quiz/Timer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  const [loading, setLoading] = useState(true);
  
  const timeRef = useRef(0);
  const hasTriggeredConfetti = useRef(false);

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

        // Get settings from sessionStorage
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

        // Prepare questions with settings
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

  const triggerConfetti = useCallback(() => {
    if (hasTriggeredConfetti.current) return;
    hasTriggeredConfetti.current = true;

    const duration = 700;
    const end = Date.now() + duration;

    const colors = ['#22c55e', '#10b981', '#34d399', '#6ee7b7'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleAnswerSelect = (label: string) => {
    if (showResult) return;
    
    setSelectedAnswer(label);
    setShowResult(true);

    const isCorrect = label === currentQuestion.correctAnswer;

    // Record answer
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

    // Trigger confetti for correct answer
    if (isCorrect) {
      hasTriggeredConfetti.current = false;
      setTimeout(triggerConfetti, 200);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Finish quiz
      setIsTimerRunning(false);

      const correctCount = answers.filter(a => a.isCorrect).length;
      const score = Math.round((correctCount / questions.length) * 100);

      // Create attempt record
      const attempt: QuizAttempt = {
        id: crypto.randomUUID(),
        quizId: quiz!.id,
        quizName: quiz!.name,
        score,
        totalQuestions: questions.length,
        timeSpent: timeRef.current,
        completedAt: Date.now(),
        answers,
      };

      // Save to database
      await saveAttempt(attempt);
      await updateQuizStats(quiz!.id, score);
      await updateUserStats(correctCount, questions.length);

      // Navigate to results
      sessionStorage.setItem('quizAttempt', JSON.stringify(attempt));
      navigate(`/results/${attempt.id}`);
    } else {
      // Next question
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate('/');
    }
  };

  const handleTimeUpdate = (seconds: number) => {
    timeRef.current = seconds;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz || !currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-primary-foreground font-bold"
          >
            {String(currentIndex + 1).padStart(2, '0')} of {String(questions.length).padStart(2, '0')}
          </motion.div>

          <Timer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} />
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 shadow-card border-0 mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {quiz.name}
              </p>
              <h2 className="text-lg font-bold text-foreground leading-relaxed">
                {currentQuestion.question}
              </h2>
            </Card>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => (
                <AnswerOption
                  key={option.label}
                  label={option.label}
                  text={option.text}
                  selected={selectedAnswer === option.label}
                  isCorrect={option.label === currentQuestion.correctAnswer}
                  showResult={showResult}
                  disabled={showResult}
                  onClick={() => handleAnswerSelect(option.label)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Button
                onClick={handleNext}
                className="w-full h-14 text-lg font-bold gradient-success text-success-foreground shadow-success hover:opacity-90"
              >
                {isLastQuestion ? 'View Results' : 'Next'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPlay;
