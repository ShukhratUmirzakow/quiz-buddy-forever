import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
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
import { StatCard } from '@/components/StatCard';
import { EmojiIcon } from '@/components/EmojiIcon';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        {/* Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-1">
            Hello, <br />
            <span className="text-white">Shuxrat</span> <EmojiIcon type="wave" size="lg" className="ml-1" />
          </h1>
          <p className="text-white/50 text-sm font-medium">Ready to test your knowledge?</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard emoji="trophy" label="Total Score" value={stats.totalScore} index={0} />
          <StatCard emoji="books" label="Quizzes" value={stats.totalQuizzesTaken} index={1} />
          <StatCard emoji="target" label="Correct" value={stats.totalCorrectAnswers} index={2} />
          <StatCard emoji="zap" label="Accuracy" value={`${accuracy}%`} index={3} />
        </div>
      </div>

      {/* Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-content rounded-t-[2rem] flex flex-col"
      >
        <div className="px-5 py-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">
              Your Quizzes
              {quizzes.length > 0 && (
                <span className="ml-2 text-sm font-medium text-white/40">({quizzes.length})</span>
              )}
            </h2>
            <Button 
              onClick={() => setShowUpload(true)} 
              className="h-10 px-4 rounded-full glass-button text-white font-semibold border-0 press-effect hover:bg-white/15"
            >
              <Plus className="w-5 h-5 mr-1" strokeWidth={2.5} />
              Add
            </Button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 mb-4 rounded-[24px] glass-card flex items-center justify-center">
                <EmojiIcon type="books" size="xl" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">No quizzes yet</h3>
              <p className="text-white/40 mb-6 text-sm">Upload your first quiz to get started!</p>
              <Button 
                onClick={() => setShowUpload(true)} 
                className="h-12 px-6 rounded-full glass-button text-white font-semibold press-effect hover:bg-white/15"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Upload Quiz</DialogTitle>
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
    </motion.div>
  );
};

export default Index;