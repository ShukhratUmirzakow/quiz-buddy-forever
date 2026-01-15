import { motion } from 'framer-motion';
import { Trash2, ChevronRight, Trophy } from 'lucide-react';
import { Quiz } from '@/types/quiz';
import { EmojiIcon } from '@/components/EmojiIcon';

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
      exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      layout
      className="glass-card rounded-[20px] p-4"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl glass-button flex items-center justify-center flex-shrink-0">
          <EmojiIcon type="books" size="lg" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm mb-0.5">
            {quiz.name}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
            <span>{quiz.questions.length} questions</span>
            {quiz.totalAttempts > 0 && (
              <>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} />
                  <span className="text-amber-400 font-semibold">{quiz.bestScore}%</span>
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
            className="w-10 h-10 rounded-2xl glass-button flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all press-effect"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
          </button>
          
          <button
            onClick={onPlay}
            className="w-10 h-10 rounded-2xl gradient-success flex items-center justify-center text-white press-effect"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}