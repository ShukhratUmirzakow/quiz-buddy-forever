import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  RefreshCcw, 
  Eye, 
  Target, 
  Clock,
  CheckCircle2,
  XCircle
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
              particleCount: 100,
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
      <div className="min-h-screen bg-gradient-to-b from-violet-600 to-purple-700 flex items-center justify-center">
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
        questionRange: { enabled: false, start: 1, end: attempt.totalQuestions },
      },
    }));
    
    navigate(`/quiz/${attempt.quizId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-violet-700">
      {/* Header */}
      <div className="px-5 pt-14 pb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-black text-white mb-2"
        >
          Test yakunlandi!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 font-medium"
        >
          {attempt.quizName}
        </motion.p>
      </div>

      {/* Results Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-t-[2.5rem] min-h-[70vh]"
      >
        <div className="px-5 py-8">
          {/* Score */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="text-7xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              {attempt.score}%
            </motion.div>
            <p className="text-gray-400 font-medium">
              Natija: {correctCount} / {attempt.totalQuestions} to'g'ri
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-emerald-50 rounded-2xl p-4 text-center"
            >
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{correctCount}</p>
              <p className="text-xs text-emerald-600/70 font-medium">To'g'ri</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-red-50 rounded-2xl p-4 text-center"
            >
              <XCircle className="w-7 h-7 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{wrongCount}</p>
              <p className="text-xs text-red-600/70 font-medium">Noto'g'ri</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-amber-50 rounded-2xl p-4 text-center"
            >
              <Clock className="w-7 h-7 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600">{formatTime(attempt.timeSpent)}</p>
              <p className="text-xs text-amber-600/70 font-medium">Vaqt</p>
            </motion.div>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 rounded-3xl p-6 mb-8"
          >
            <p className="text-sm text-gray-400 text-center mb-4 font-medium">Siz badge oldingiz</p>
            <Badge badge={badge} percentage={attempt.score} />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <Button
              onClick={() => setShowDetails(!showDetails)}
              className="h-14 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold shadow-lg shadow-red-500/30 border-0"
            >
              <Eye className="w-5 h-5 mr-2" />
              {showDetails ? 'Yopish' : "Javoblar"}
            </Button>
            
            <Button
              onClick={handleRetryWrong}
              disabled={wrongCount === 0}
              className="h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30 border-0 disabled:opacity-50"
            >
              <Target className="w-5 h-5 mr-2" />
              Xatolarni ishlash
            </Button>
            
            <Button
              onClick={handleRestartQuiz}
              className="h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold shadow-lg shadow-yellow-500/30 border-0"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Qayta boshlash
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              className="h-14 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-bold shadow-lg shadow-green-500/30 border-0"
            >
              <Home className="w-5 h-5 mr-2" />
              Bosh sahifa
            </Button>
          </motion.div>

          {/* Answers Table */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Javoblar tahlili</h3>
                <button
                  onClick={() => setShowWrongOnly(!showWrongOnly)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    showWrongOnly ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {showWrongOnly ? "Hammasi" : "Faqat xatolar"}
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100">
                      <TableHead className="w-12 font-bold">#</TableHead>
                      <TableHead className="font-bold">Savol</TableHead>
                      <TableHead className="w-20 font-bold">Javob</TableHead>
                      <TableHead className="w-20 font-bold">To'g'ri</TableHead>
                      <TableHead className="w-16 text-right font-bold">Natija</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedAnswers.map((answer, idx) => (
                      <TableRow key={idx} className="border-gray-100">
                        <TableCell className="font-bold text-gray-600">
                          {answer.questionIndex + 1}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-gray-700">
                          {answer.questionText}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-gray-600">
                          {answer.selectedAnswer}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-emerald-600">
                          {answer.correctAnswer}
                        </TableCell>
                        <TableCell className="text-right">
                          {answer.isCorrect ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100">
                              <XCircle className="w-4 h-4 text-red-600" />
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResults;
