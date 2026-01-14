import { motion } from 'framer-motion';
import { BookOpen, Trophy, Trash2, ChevronRight } from 'lucide-react';
import { Quiz } from '@/types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  onPlay: () => void;
  onDelete: () => void;
}

export function QuizCard({ quiz, index, onPlay, onDelete }: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-2xl p-4 shadow-soft hover:shadow-lift transition-shadow"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <BookOpen className="w-10 h-10 text-white blur-[1px] absolute -right-1 -top-1" strokeWidth={1} />
          </div>
          <BookOpen className="w-6 h-6 text-white relative" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate text-sm mb-0.5">
            {quiz.name}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span>{quiz.questions.length} questions</span>
            {quiz.totalAttempts > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} />
                  <span className="text-amber-600 font-bold">{quiz.bestScore}%</span>
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
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
          </button>
          
          <button
            onClick={onPlay}
            className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center text-white shadow-lg shadow-green-500/25"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}