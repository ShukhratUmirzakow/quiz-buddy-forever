import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Target, Zap, Plus, User, Moon, Sun } from 'lucide-react';
import { Quiz, UserStats } from '@/types/quiz';
import { getAllQuizzes, deleteQuiz, getUserStats } from '@/lib/quizStorage';
import { QuizCard } from '@/components/quiz/QuizCard';
import { FileUpload } from '@/components/quiz/FileUpload';
import { QuizSettingsDialog } from '@/components/quiz/QuizSettings';
import { DeleteConfirmDialog } from '@/components/quiz/DeleteConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalScore: 0, totalQuizzesTaken: 0, totalCorrectAnswers: 0, totalQuestionsAnswered: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [loadedQuizzes, loadedStats] = await Promise.all([getAllQuizzes(), getUserStats()]);
      setQuizzes(loadedQuizzes);
      setStats(loadedStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleQuizUploaded = (quiz: Quiz) => { setQuizzes(prev => [quiz, ...prev]); setShowUpload(false); };
  const handlePlayQuiz = (quiz: Quiz) => { setSelectedQuiz(quiz); setShowSettings(true); };
  const handleStartQuiz = (settings: any) => {
    if (!selectedQuiz) return;
    sessionStorage.setItem('quizSettings', JSON.stringify({ quizId: selectedQuiz.id, settings }));
    setShowSettings(false);
    navigate(`/quiz/${selectedQuiz.id}`);
  };
  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    try {
      await deleteQuiz(quizToDelete.id);
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
      toast.success('Quiz deleted');
    } catch (error) {
      toast.error('Failed to delete quiz');
    } finally {
      setQuizToDelete(null);
    }
  };

  const accuracy = stats.totalQuestionsAnswered > 0 ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-edge-violet">
              <User className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold">Welcome back</p>
              <h1 className="text-xl font-extrabold text-white">Shuxrat</h1>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-11 h-11 rounded-full glass-dark flex items-center justify-center transition-transform active:scale-95"
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5 text-white" strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Trophy, label: 'Total Score', value: stats.totalScore, bgColor: 'bg-amber-400/90 dark:bg-amber-500/90', iconColor: 'text-amber-700 dark:text-amber-900', shadowClass: 'shadow-edge-amber' },
            { icon: BookOpen, label: 'Quizzes', value: stats.totalQuizzesTaken, bgColor: 'bg-violet-400/90 dark:bg-violet-500/90', iconColor: 'text-violet-700 dark:text-violet-900', shadowClass: 'shadow-edge-violet' },
            { icon: Target, label: 'Correct', value: stats.totalCorrectAnswers, bgColor: 'bg-emerald-400/90 dark:bg-emerald-500/90', iconColor: 'text-emerald-700 dark:text-emerald-900', shadowClass: 'shadow-edge-emerald' },
            { icon: Zap, label: 'Accuracy', value: `${accuracy}%`, bgColor: 'bg-cyan-400/90 dark:bg-cyan-500/90', iconColor: 'text-cyan-700 dark:text-cyan-900', shadowClass: 'shadow-edge-cyan' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`glass-dark rounded-2xl p-4 relative overflow-hidden ${stat.shadowClass}`}
            >
              {/* Blurred icon background */}
              <div className="absolute -right-2 -top-2 opacity-15">
                <stat.icon className="w-16 h-16 text-white blur-sm" strokeWidth={1.5} />
              </div>
              <div className="relative flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-bold tracking-wide">{stat.label}</p>
                  <p className="text-white text-xl font-extrabold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-content rounded-t-[2rem] flex flex-col shadow-xl"
      >
        <div className="px-5 py-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold text-foreground">
              Your Quizzes
              {quizzes.length > 0 && (
                <span className="ml-2 text-sm font-bold text-muted-foreground">({quizzes.length})</span>
              )}
            </h2>
            <Button 
              onClick={() => setShowUpload(true)} 
              className="h-10 px-4 rounded-xl gradient-primary text-white font-bold shadow-edge-violet border-0 transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5 mr-1" strokeWidth={2.5} />
              Add
            </Button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 mb-4 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <h3 className="font-extrabold text-foreground text-lg mb-2">No quizzes yet</h3>
              <p className="text-muted-foreground mb-6 text-sm">Upload your first quiz to get started!</p>
              <Button 
                onClick={() => setShowUpload(true)} 
                className="h-12 px-6 rounded-xl gradient-primary text-white font-bold shadow-edge-violet transition-transform active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
                Upload Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-3 flex-1 pb-8">
              <AnimatePresence mode="popLayout">
                {quizzes.map((quiz, index) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    index={index} 
                    onPlay={() => handlePlayQuiz(quiz)} 
                    onDelete={() => setQuizToDelete(quiz)} 
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Dialogs */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Upload Quiz</DialogTitle>
          </DialogHeader>
          <FileUpload onQuizUploaded={handleQuizUploaded} />
        </DialogContent>
      </Dialog>

      {selectedQuiz && (
        <QuizSettingsDialog 
          quiz={selectedQuiz} 
          open={showSettings} 
          onOpenChange={setShowSettings} 
          onStart={handleStartQuiz} 
        />
      )}

      <DeleteConfirmDialog 
        open={!!quizToDelete} 
        onOpenChange={(open) => !open && setQuizToDelete(null)} 
        quizName={quizToDelete?.name || ''} 
        onConfirm={handleDeleteQuiz} 
      />
    </div>
  );
};

export default Index;
