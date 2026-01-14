import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Target, Zap, Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-violet-700">
      <div className="px-5 pt-14 pb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-1">QuizMaster</h1>
          <p className="text-white/70 font-medium">Your personal quiz companion</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center"><Trophy className="w-5 h-5 text-amber-900" /></div>
              <div><p className="text-white/60 text-xs font-medium">Total Score</p><p className="text-white text-xl font-bold">{stats.totalScore}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-400 flex items-center justify-center"><BookOpen className="w-5 h-5 text-violet-900" /></div>
              <div><p className="text-white/60 text-xs font-medium">Quizzes</p><p className="text-white text-xl font-bold">{stats.totalQuizzesTaken}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center"><Target className="w-5 h-5 text-emerald-900" /></div>
              <div><p className="text-white/60 text-xs font-medium">Correct</p><p className="text-white text-xl font-bold">{stats.totalCorrectAnswers}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400 flex items-center justify-center"><Zap className="w-5 h-5 text-cyan-900" /></div>
              <div><p className="text-white/60 text-xs font-medium">Accuracy</p><p className="text-white text-xl font-bold">{accuracy}%</p></div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex-1 bg-gray-50 rounded-t-[2.5rem] min-h-[50vh]">
        <div className="px-5 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Quizzes {quizzes.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({quizzes.length})</span>}</h2>
            <Button onClick={() => setShowUpload(true)} className="h-11 px-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30"><Plus className="w-5 h-5 mr-1.5" />Add Quiz</Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"><BookOpen className="w-10 h-10 text-gray-300" /></div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">No quizzes yet</h3>
              <p className="text-gray-400 mb-6">Upload your first quiz to get started!</p>
              <Button onClick={() => setShowUpload(true)} className="h-12 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg"><Plus className="w-5 h-5 mr-2" />Upload Quiz</Button>
            </div>
          ) : (
            <div className="space-y-3"><AnimatePresence mode="popLayout">{quizzes.map((quiz, index) => (<QuizCard key={quiz.id} quiz={quiz} index={index} onPlay={() => handlePlayQuiz(quiz)} onDelete={() => setQuizToDelete(quiz)} />))}</AnimatePresence></div>
          )}
        </div>
      </motion.div>
      <Dialog open={showUpload} onOpenChange={setShowUpload}><DialogContent className="sm:max-w-md rounded-3xl border-0"><DialogHeader><DialogTitle className="text-xl font-bold">Upload Quiz</DialogTitle></DialogHeader><FileUpload onQuizUploaded={handleQuizUploaded} /></DialogContent></Dialog>
      {selectedQuiz && <QuizSettingsDialog quiz={selectedQuiz} open={showSettings} onOpenChange={setShowSettings} onStart={handleStartQuiz} />}
      <DeleteConfirmDialog open={!!quizToDelete} onOpenChange={(open) => !open && setQuizToDelete(null)} quizName={quizToDelete?.name || ''} onConfirm={handleDeleteQuiz} />
    </div>
  );
};

export default Index;
