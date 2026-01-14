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
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-2xl font-extrabold text-white mb-1"
        >
          Quiz Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-white/70 font-semibold text-sm"
        >
          {attempt.quizName}
        </motion.p>
      </div>

      {/* Results Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-content rounded-t-[2rem] min-h-[75vh] shadow-xl"
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
            <p className="text-muted-foreground font-bold text-sm">
              Score: {correctCount} / {attempt.totalQuestions} correct
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl p-4 text-center relative overflow-hidden shadow-edge-emerald"
            >
              <div className="absolute -right-1 -top-1 opacity-15">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 blur-sm" strokeWidth={1.5} />
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" strokeWidth={2.5} />
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{correctCount}</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-bold">Correct</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="bg-red-50 dark:bg-red-950/50 rounded-2xl p-4 text-center relative overflow-hidden shadow-edge-red"
            >
              <div className="absolute -right-1 -top-1 opacity-15">
                <XCircle className="w-12 h-12 text-red-500 blur-sm" strokeWidth={1.5} />
              </div>
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" strokeWidth={2.5} />
              <p className="text-xl font-extrabold text-red-600 dark:text-red-400">{wrongCount}</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 font-bold">Wrong</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-amber-50 dark:bg-amber-950/50 rounded-2xl p-4 text-center relative overflow-hidden shadow-edge-amber"
            >
              <div className="absolute -right-1 -top-1 opacity-15">
                <Clock className="w-12 h-12 text-amber-500 blur-sm" strokeWidth={1.5} />
              </div>
              <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" strokeWidth={2.5} />
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{formatTime(attempt.timeSpent)}</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-bold">Time</p>
            </motion.div>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-card rounded-3xl p-5 mb-6 shadow-soft"
          >
            <p className="text-xs text-muted-foreground text-center mb-3 font-bold uppercase tracking-wide">Achievement</p>
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
              className="h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/50 hover:bg-violet-200 dark:hover:bg-violet-900/70 text-violet-700 dark:text-violet-300 font-bold shadow-edge-violet border-0 relative overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute -right-1 -top-1 opacity-20">
                <Eye className="w-10 h-10 text-violet-500 blur-sm" strokeWidth={1.5} />
              </div>
              {showDetails ? <EyeOff className="w-5 h-5 mr-2" strokeWidth={2.5} /> : <Eye className="w-5 h-5 mr-2" strokeWidth={2.5} />}
              {showDetails ? 'Hide' : 'Answers'}
            </Button>
            
            <Button
              onClick={handleRetryWrong}
              disabled={wrongCount === 0}
              className="h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-700 dark:text-amber-300 font-bold shadow-edge-amber border-0 disabled:opacity-50 relative overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute -right-1 -top-1 opacity-20">
                <Target className="w-10 h-10 text-amber-500 blur-sm" strokeWidth={1.5} />
              </div>
              <Target className="w-5 h-5 mr-2" strokeWidth={2.5} />
              Retry Wrong
            </Button>
            
            <Button
              onClick={handleRestartQuiz}
              className="h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/50 hover:bg-cyan-200 dark:hover:bg-cyan-900/70 text-cyan-700 dark:text-cyan-300 font-bold shadow-edge-cyan border-0 relative overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute -right-1 -top-1 opacity-20">
                <RefreshCcw className="w-10 h-10 text-cyan-500 blur-sm" strokeWidth={1.5} />
              </div>
              <RefreshCcw className="w-5 h-5 mr-2" strokeWidth={2.5} />
              Restart
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              className="h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-bold shadow-edge-emerald border-0 relative overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute -right-1 -top-1 opacity-20">
                <Home className="w-10 h-10 text-emerald-500 blur-sm" strokeWidth={1.5} />
              </div>
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
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-2xl shadow-soft">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-extrabold text-foreground">Answer Review</h3>
                    <button
                      onClick={() => setShowWrongOnly(!showWrongOnly)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        showWrongOnly ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {showWrongOnly ? "All" : "Wrong Only"}
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="w-12 font-bold text-xs">#</TableHead>
                          <TableHead className="font-bold text-xs">Question</TableHead>
                          <TableHead className="w-16 font-bold text-xs">Your</TableHead>
                          <TableHead className="w-16 font-bold text-xs">Correct</TableHead>
                          <TableHead className="w-12 text-right font-bold text-xs">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedAnswers.map((answer, idx) => (
                          <TableRow key={idx} className="border-border">
                            <TableCell className="font-bold text-muted-foreground text-sm">
                              {answer.questionIndex + 1}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate text-foreground text-sm">
                              {answer.questionText}
                            </TableCell>
                            <TableCell className="font-mono font-bold text-muted-foreground text-sm">
                              {answer.selectedAnswer}
                            </TableCell>
                            <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              {answer.correctAnswer}
                            </TableCell>
                            <TableCell className="text-right">
                              {answer.isCorrect ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50">
                                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2.5} />
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
    </div>
  );
};

export default QuizResults;
