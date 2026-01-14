import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Target, Zap } from 'lucide-react';
import { Quiz, UserStats } from '@/types/quiz';
import { getAllQuizzes, deleteQuiz, getUserStats } from '@/lib/quizStorage';
import { QuizCard } from '@/components/quiz/QuizCard';
import { FileUpload } from '@/components/quiz/FileUpload';
import { QuizSettingsDialog } from '@/components/quiz/QuizSettings';
import { DeleteConfirmDialog } from '@/components/quiz/DeleteConfirmDialog';
import { StatsCard } from '@/components/quiz/StatsCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [loadedQuizzes, loadedStats] = await Promise.all([
        getAllQuizzes(),
        getUserStats(),
      ]);
      setQuizzes(loadedQuizzes);
      setStats(loadedStats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuizUploaded = (quiz: Quiz) => {
    setQuizzes(prev => [quiz, ...prev]);
  };

  const handlePlayQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowSettings(true);
  };

  const handleStartQuiz = (settings: any) => {
    if (!selectedQuiz) return;
    
    // Store settings in sessionStorage for the quiz page to use
    sessionStorage.setItem('quizSettings', JSON.stringify({
      quizId: selectedQuiz.id,
      settings,
    }));
    
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
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    } finally {
      setQuizToDelete(null);
    }
  };

  const accuracy = stats && stats.totalQuestionsAnswered > 0
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground">
        <div className="container py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-black mb-2">QuizMaster</h1>
            <p className="opacity-90">Your personal quiz companion</p>
          </motion.div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard
                icon={Trophy}
                label="Total Score"
                value={stats.totalScore}
                color="warning"
                delay={0.1}
              />
              <StatsCard
                icon={BookOpen}
                label="Quizzes Taken"
                value={stats.totalQuizzesTaken}
                color="primary"
                delay={0.2}
              />
              <StatsCard
                icon={Target}
                label="Correct Answers"
                value={stats.totalCorrectAnswers}
                color="success"
                delay={0.3}
              />
              <StatsCard
                icon={Zap}
                label="Accuracy"
                value={`${accuracy}%`}
                color="accent"
                delay={0.4}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 px-4">
        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Upload New Quiz
          </h2>
          <FileUpload onQuizUploaded={handleQuizUploaded} />
        </motion.section>

        {/* Quizzes List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Your Quizzes
            {quizzes.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({quizzes.length})
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="p-4 mx-auto w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No quizzes yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Upload your first quiz to get started!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onPlay={() => handlePlayQuiz(quiz)}
                    onDelete={() => setQuizToDelete(quiz)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>

      {/* Dialogs */}
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
