import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RefreshCcw, Eye, Target, Clock, CheckCircle2, XCircle, EyeOff, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizAttempt, getBadge } from '@/types/quiz';
import { Badge } from '@/components/quiz/Badge';
import { Button } from '@/components/ui/button';
import checkIcon from '@/assets/check.png';
import { BackgroundAccent } from '@/components/BackgroundAccent';
import { AnswerReviewModal } from '@/components/AnswerReviewModal';
import { useLanguage } from '@/hooks/useLanguage';

const QuizResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    const attemptData = sessionStorage.getItem('quizAttempt');
    if (attemptData) {
      const parsed = JSON.parse(attemptData);
      if (parsed.id === id) {
        setAttempt(parsed);
        sessionStorage.removeItem('quizAttempt');
        if (parsed.score >= 70) { setTimeout(() => { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#22c55e', '#10b981'] }); }, 300); }
      } else { navigate('/'); }
    } else { navigate('/'); }
  }, [id, navigate]);

  if (!attempt) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" /></div>;

  const badge = getBadge(attempt.score);
  const correctCount = attempt.answers.filter(a => a.isCorrect).length;
  const wrongCount = attempt.answers.length - correctCount;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const displayedAnswers = showWrongOnly ? attempt.answers.filter(a => !a.isCorrect) : attempt.answers;

  const handleRetryWrong = () => {
    // Get the actual question IDs from wrong answers
    const wrongQuestionIds = attempt.answers
      .filter(a => !a.isCorrect)
      .map(a => (a as any).questionId || a.questionIndex + 1); // Use questionId if available
    if (wrongQuestionIds.length === 0) return;
    // Use specificQuestionIds to only play exactly the wrong questions
    sessionStorage.setItem('quizSettings', JSON.stringify({ 
      quizId: attempt.quizId, 
      settings: { 
        shuffleQuestions: false, 
        shuffleAnswers: true, 
        fastMode: false, 
        questionRange: { enabled: false, start: 1, end: attempt.totalQuestions },
        specificQuestionIds: wrongQuestionIds
      } 
    }));
    navigate(`/quiz/${attempt.quizId}`);
  };

  const handleRestartQuiz = () => {
    sessionStorage.setItem('quizSettings', JSON.stringify({ quizId: attempt.quizId, settings: { shuffleQuestions: false, shuffleAnswers: true, fastMode: false, questionRange: { enabled: false, start: 1, end: attempt.totalQuestions } } }));
    navigate(`/quiz/${attempt.quizId}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen flex flex-col relative">
      <BackgroundAccent variant="results" badgeColor={badge.type} />
      
      <div className="px-5 pt-14 pb-6 text-center relative z-10">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
          {t('quiz_complete')} <img src={checkIcon} alt="Complete" className="w-8 h-8" />
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/50 font-medium text-sm">{attempt.quizName}</motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="flex-1 bg-content rounded-t-[2rem] relative z-10">
        <div className="px-5 py-6 h-full flex flex-col">
          <div className="text-center mb-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2, stiffness: 200 }} className="text-6xl font-black text-white mb-1">{attempt.score}%</motion.div>
            <p className="text-white/40 font-medium text-sm">{t('score_correct', { correct: correctCount, total: attempt.totalQuestions })}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-[20px] p-4 text-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
              <p className="text-xl font-bold text-emerald-400">{correctCount}</p><p className="text-xs text-white/40 font-medium">{t('correct')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-[20px] p-4 text-center">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-2"><XCircle className="w-4 h-4 text-red-400" /></div>
              <p className="text-xl font-bold text-red-400">{wrongCount}</p><p className="text-xs text-white/40 font-medium">{t('wrong')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-[20px] p-4 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-2"><Clock className="w-4 h-4 text-amber-400" /></div>
              <p className="text-xl font-bold text-amber-400">{formatTime(attempt.timeSpent)}</p><p className="text-xs text-white/40 font-medium">{t('time')}</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-[24px] p-5 mb-6 overflow-hidden">
            <p className="text-xs text-white/40 text-center mb-3 font-semibold uppercase tracking-wide">{t('achievement')}</p>
            <Badge badge={badge} percentage={attempt.score} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 gap-3 mb-5">
            <Button onClick={() => setShowFullscreen(true)} className="h-12 rounded-2xl glass-button hover:bg-white/10 text-white font-semibold border-0 press-effect">
              <Eye className="w-4 h-4 mr-2" />{t('answers')}
            </Button>
            <Button onClick={handleRetryWrong} disabled={wrongCount === 0} className="h-12 rounded-2xl glass-button hover:bg-white/10 text-white font-semibold border-0 disabled:opacity-40 press-effect"><Target className="w-4 h-4 mr-2" />{t('retry_wrong')}</Button>
            <Button onClick={handleRestartQuiz} className="h-12 rounded-2xl glass-button hover:bg-white/10 text-white font-semibold border-0 press-effect"><RefreshCcw className="w-4 h-4 mr-2" />{t('restart')}</Button>
            <Button onClick={() => navigate('/')} className="h-12 rounded-2xl gradient-success text-white font-semibold border-0 press-effect"><Home className="w-4 h-4 mr-2" />{t('home')}</Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Fullscreen Answer Review Modal */}
      <AnswerReviewModal 
        open={showFullscreen} 
        onOpenChange={setShowFullscreen} 
        answers={attempt.answers}
        quizId={attempt.quizId}
      />
    </motion.div>
  );
};

export default QuizResults;
