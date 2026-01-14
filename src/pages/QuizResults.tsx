import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  RefreshCcw, 
  Eye, 
  RotateCcw, 
  Clock,
  CheckCircle2,
  XCircle,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizAttempt, getBadge } from '@/types/quiz';
import { Badge } from '@/components/quiz/Badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
        
        // Trigger celebration confetti for good scores
        if (parsed.score >= 70) {
          setTimeout(() => {
            const duration = 1500;
            const end = Date.now() + duration;

            (function frame() {
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#fbbf24', '#f59e0b', '#d97706', '#22c55e', '#10b981'],
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#fbbf24', '#f59e0b', '#d97706', '#22c55e', '#10b981'],
              });

              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            })();
          }, 500);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
    // Store wrong questions for retry
    const wrongQuestions = attempt.answers
      .filter(a => !a.isCorrect)
      .map(a => a.questionIndex + 1);
    
    if (wrongQuestions.length === 0) {
      return;
    }
    
    // Navigate with special retry mode
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground py-8">
        <div className="container px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black mb-2"
          >
            Test yakunlandi!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="opacity-90"
          >
            {attempt.quizName}
          </motion.p>
        </div>
      </div>

      <div className="container px-4 py-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 text-center shadow-card border-0 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="text-6xl font-black text-primary mb-2"
            >
              {attempt.score}%
            </motion.div>
            
            <p className="text-muted-foreground mb-6">
              Natija: {correctCount} / {attempt.totalQuestions} to'g'ri
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-1" />
                <p className="text-lg font-bold text-success">{correctCount}</p>
                <p className="text-xs text-muted-foreground">To'g'ri</p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <XCircle className="w-6 h-6 text-destructive mx-auto mb-1" />
                <p className="text-lg font-bold text-destructive">{wrongCount}</p>
                <p className="text-xs text-muted-foreground">Noto'g'ri</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="w-6 h-6 text-warning mx-auto mb-1" />
                <p className="text-lg font-bold text-warning">{formatTime(attempt.timeSpent)}</p>
                <p className="text-xs text-muted-foreground">Vaqt</p>
              </div>
            </div>

            {/* Badge */}
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-4">Siz badge oldingiz</p>
              <Badge badge={badge} percentage={attempt.score} />
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="h-12 gradient-danger text-destructive-foreground hover:opacity-90"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showDetails ? 'Yopish' : "Xato javoblarni ko'rish"}
          </Button>
          
          <Button
            onClick={handleRetryWrong}
            disabled={wrongCount === 0}
            className="h-12 gradient-warning text-warning-foreground hover:opacity-90"
          >
            <Target className="w-4 h-4 mr-2" />
            Xato javoblarni qayta ishlash
          </Button>
          
          <Button
            onClick={handleRestartQuiz}
            className="h-12 bg-warning text-warning-foreground hover:bg-warning/90"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Testni qayta boshlash
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            className="h-12 gradient-success text-success-foreground hover:opacity-90"
          >
            <Home className="w-4 h-4 mr-2" />
            Bosh sahifa
          </Button>
        </motion.div>

        {/* Answers Table */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="shadow-card border-0 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold text-foreground">Javoblar tahlili</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWrongOnly(!showWrongOnly)}
                  className={showWrongOnly ? 'text-destructive' : ''}
                >
                  {showWrongOnly ? "Barcha javoblar" : "Faqat xatolar"}
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Savol</TableHead>
                      <TableHead className="w-24">Sizning javob</TableHead>
                      <TableHead className="w-24">To'g'ri javob</TableHead>
                      <TableHead className="w-20 text-right">Natija</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedAnswers.map((answer, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {answer.questionIndex + 1}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {answer.questionText}
                        </TableCell>
                        <TableCell className="font-mono">
                          {answer.selectedAnswer}
                        </TableCell>
                        <TableCell className="font-mono text-success">
                          {answer.correctAnswer}
                        </TableCell>
                        <TableCell className="text-right">
                          {answer.isCorrect ? (
                            <span className="text-success font-medium">To'g'ri</span>
                          ) : (
                            <span className="text-destructive font-medium">Noto'g'ri</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
