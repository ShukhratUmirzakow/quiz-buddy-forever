import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  RefreshCcw, 
  Eye, 
  Target, 
  Clock,
  CheckCircle2,
  XCircle,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizAttempt, getBadge } from '@/types/quiz';
import { Badge } from '@/components/quiz/Badge';
import { Button } from '@/components/ui/button';
import { GlowIcon } from '@/components/GlowIcon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const QuizResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const attemptData = sessionStorage.getItem('quizAttempt');
    if (attemptData) {
      const parsed = JSON.parse(attemptData);
      if (parsed.id === id) {
        setAttempt(parsed);
        sessionStorage.removeItem('quizAttempt');
        
        if (parsed.score >= 70) {
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#fbbf24', '#f59e0b', '#22c55e', '#10b981', '#8b5cf6'],
            });
          }, 300);
        }
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const badge = getBadge(attempt.score);
  const correctCount = attempt.answers.filter(a => a.isCorrect).length;
  const wrongCount = attempt.answers.length - correctCount;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayedAnswers = showWrongOnly 
    ? attempt.answers.filter(a => !a.isCorrect)
    : attempt.answers;

  const handleRetryWrong = () => {
    const wrongQuestions = attempt.answers
      .filter(a => !a.isCorrect)
      .map(a => a.questionIndex + 1);
    
    if (wrongQuestions.length === 0) return;
    
    sessionStorage.setItem('quizSettings', JSON.stringify({
      quizId: attempt.quizId,
      settings: {
        shuffleQuestions: false,
        shuffleAnswers: true,
        fastMode: false,
        questionRange: {
          enabled: true,
          start: Math.min(...wrongQuestions),
          end: Math.max(...wrongQuestions),
        },
      },
    }));
    
    navigate(`/quiz/${attempt.quizId}`);
  };

  const handleRestartQuiz = () => {
    sessionStorage.setItem('quizSettings', JSON.stringify({
      quizId: attempt.quizId,
      settings: {
        shuffleQuestions: false,
        shuffleAnswers: true,
        fastMode: false,
        questionRange: { enabled: false, start: 1, end: attempt.totalQuestions },
      },
    }));
    
    navigate(`/quiz/${attempt.quizId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Header */}
      <div className="px-5 pt-14 pb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-white mb-1"
        >
          Quiz Complete! <span className="emoji">🎉</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-white/50 font-medium text-sm"
        >
          {attempt.quizName}
        </motion.p>
      </div>

      {/* Results Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-content rounded-t-[2rem] min-h-[75vh]"
      >
        <div className="px-5 py-6">
          {/* Score */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="text-6xl font-black text-gradient mb-1"
            >
              {attempt.score}%
            </motion.div>
            <p className="text-white/40 font-medium text-sm">
              Score: {correctCount} / {attempt.totalQuestions} correct
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="glass-card rounded-2xl p-4 text-center shadow-glow-emerald"
            >
              <GlowIcon icon={CheckCircle2} color="emerald" size="sm" className="mx-auto mb-2" />
              <p className="text-xl font-bold text-emerald-400">{correctCount}</p>
              <p className="text-xs text-white/40 font-medium">Correct</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="glass-card rounded-2xl p-4 text-center shadow-glow-red"
            >
              <GlowIcon icon={XCircle} color="red" size="sm" className="mx-auto mb-2" />
              <p className="text-xl font-bold text-red-400">{wrongCount}</p>
              <p className="text-xs text-white/40 font-medium">Wrong</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="glass-card rounded-2xl p-4 text-center shadow-glow-amber"
            >
              <GlowIcon icon={Clock} color="amber" size="sm" className="mx-auto mb-2" />
              <p className="text-xl font-bold text-amber-400">{formatTime(attempt.timeSpent)}</p>
              <p className="text-xs text-white/40 font-medium">Time</p>
            </motion.div>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="glass-card rounded-3xl p-5 mb-6"
          >
            <p className="text-xs text-white/40 text-center mb-3 font-semibold uppercase tracking-wide">Achievement</p>
            <Badge badge={badge} percentage={attempt.score} />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-5"
          >
            <Button
              onClick={() => setShowDetails(!showDetails)}
              className="h-12 rounded-2xl glass-card hover:bg-white/10 text-white font-semibold border-0 press-effect"
            >
              <GlowIcon icon={showDetails ? EyeOff : Eye} color="violet" size="sm" className="mr-2" />
              {showDetails ? 'Hide' : 'Answers'}
            </Button>
            
            <Button
              onClick={handleRetryWrong}
              disabled={wrongCount === 0}
              className="h-12 rounded-2xl glass-card hover:bg-white/10 text-white font-semibold border-0 disabled:opacity-40 press-effect"
            >
              <GlowIcon icon={Target} color="amber" size="sm" className="mr-2" />
              Retry Wrong
            </Button>
            
            <Button
              onClick={handleRestartQuiz}
              className="h-12 rounded-2xl glass-card hover:bg-white/10 text-white font-semibold border-0 press-effect"
            >
              <GlowIcon icon={RefreshCcw} color="cyan" size="sm" className="mr-2" />
              Restart
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              className="h-12 rounded-2xl gradient-success text-white font-semibold shadow-glow-emerald border-0 press-effect"
            >
              <Home className="w-5 h-5 mr-2" strokeWidth={2.5} />
              Home
            </Button>
          </motion.div>

          {/* Answers Table */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-2xl">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-white">Answer Review</h3>
                    <button
                      onClick={() => setShowWrongOnly(!showWrongOnly)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        showWrongOnly ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {showWrongOnly ? "All" : "Wrong Only"}
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="w-12 font-semibold text-xs text-white/50">#</TableHead>
                          <TableHead className="font-semibold text-xs text-white/50">Question</TableHead>
                          <TableHead className="w-16 font-semibold text-xs text-white/50">Your</TableHead>
                          <TableHead className="w-16 font-semibold text-xs text-white/50">Correct</TableHead>
                          <TableHead className="w-12 text-right font-semibold text-xs text-white/50">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedAnswers.map((answer, idx) => (
                          <TableRow key={idx} className="border-white/10">
                            <TableCell className="font-semibold text-white/50 text-sm">
                              {answer.questionIndex + 1}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate text-white text-sm">
                              {answer.questionText}
                            </TableCell>
                            <TableCell className="font-mono font-semibold text-white/50 text-sm">
                              {answer.selectedAnswer}
                            </TableCell>
                            <TableCell className="font-mono font-semibold text-emerald-400 text-sm">
                              {answer.correctAnswer}
                            </TableCell>
                            <TableCell className="text-right">
                              {answer.isCorrect ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20">
                                  <XCircle className="w-4 h-4 text-red-400" strokeWidth={2.5} />
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizResults;
