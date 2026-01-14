import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, Trash2, ChevronRight } from 'lucide-react';
import { Quiz } from '@/types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  onPlay: () => void;
  onDelete: () => void;
}

export function QuizCard({ quiz, index, onPlay, onDelete }: QuizCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate mb-1">
            {quiz.name}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{quiz.questions.length} questions</span>
            {quiz.totalAttempts > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {quiz.bestScore}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={onPlay}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
