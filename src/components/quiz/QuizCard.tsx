import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, Trash2, Play } from 'lucide-react';
import { Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuizCardProps {
  quiz: Quiz;
  onPlay: () => void;
  onDelete: () => void;
}

export function QuizCard({ quiz, onPlay, onDelete }: QuizCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-5 bg-card shadow-card hover:shadow-lg transition-all duration-300 border-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground truncate mb-2">
              {quiz.name}
            </h3>
            
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {quiz.questions.length} questions
              </span>
              
              {quiz.totalAttempts > 0 && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-warning" />
                    Best: {quiz.bestScore}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {quiz.totalAttempts} plays
                  </span>
                </>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              Added {formatDate(quiz.createdAt)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={onPlay}
              className="gradient-primary text-primary-foreground shadow-button hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Play
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
