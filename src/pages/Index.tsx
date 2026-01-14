import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Target, Zap, Plus, User } from 'lucide-react';
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

const Index = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <User className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white/70 text-sm font-medium">Welcome back</p>
            <h1 className="text-xl font-bold text-white">Shuxrat</h1>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Trophy, label: 'Total Score', value: stats.totalScore, color: 'amber', iconColor: 'text-amber-600' },
            { icon: BookOpen, label: 'Quizzes', value: stats.totalQuizzesTaken, color: 'violet', iconColor: 'text-violet-600' },
            { icon: Target, label: 'Correct', value: stats.totalCorrectAnswers, color: 'emerald', iconColor: 'text-emerald-600' },
            { icon: Zap, label: 'Accuracy', value: `${accuracy}%`, color: 'cyan', iconColor: 'text-cyan-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="glass-dark rounded-2xl p-4 relative overflow-hidden"
            >
              {/* Blurred icon background */}
              <div className="absolute -right-2 -top-2 opacity-20">
                <stat.icon className="w-16 h-16 text-white blur-[2px]" strokeWidth={1.5} />
              </div>
              <div className="relative flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-${stat.color}-400/90 flex items-center justify-center shadow-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold tracking-wide">{stat.label}</p>
                  <p className="text-white text-xl font-bold">{stat.value}</p>
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
        transition={{ delay: 0.3 }}
        className="flex-1 bg-gray-50/95 backdrop-blur-xl rounded-t-[2rem] flex flex-col"
      >
        <div className="px-6 py-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Your Quizzes
              {quizzes.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-400">({quizzes.length})</span>
              )}
            </h2>
            <Button 
              onClick={() => setShowUpload(true)} 
              className="h-10 px-4 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-purple-500/25 border-0"
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
              <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">No quizzes yet</h3>
              <p className="text-gray-400 mb-6 text-sm">Upload your first quiz to get started!</p>
              <Button 
                onClick={() => setShowUpload(true)} 
                className="h-12 px-6 rounded-xl gradient-primary text-white font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
                Upload Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-3 flex-1 pb-6">
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
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Upload Quiz</DialogTitle>
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