import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { QuizAttempt } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/hooks/useLanguage';

interface AnswerReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: QuizAttempt['answers'];
}

export function AnswerReviewModal({ open, onOpenChange, answers }: AnswerReviewModalProps) {
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const { t } = useLanguage();
  
  const displayedAnswers = showWrongOnly 
    ? answers.filter(a => !a.isCorrect) 
    : answers;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 glass-overlay flex flex-col"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 flex flex-col bg-background/95 backdrop-blur-xl mt-12 rounded-t-[2rem]"
          >
            {/* Header */}
            <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-display">{t('answer_review')}</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowWrongOnly(!showWrongOnly)} 
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${showWrongOnly ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}
                >
                  {showWrongOnly ? t('all') : t('wrong_only')}
                </button>
                <Button
                  onClick={() => onOpenChange(false)}
                  size="icon"
                  className="w-10 h-10 rounded-full glass-button border-0 press-effect"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto px-5 py-4">
              <div className="space-y-3">
                {displayedAnswers.map((answer, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card rounded-[20px] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${answer.isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        {answer.isCorrect 
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/40 font-semibold mb-1">
                          {t('question')} {answer.questionIndex + 1}
                        </p>
                        <p className="text-white text-sm font-medium mb-2 leading-relaxed">
                          {answer.questionText}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-lg font-semibold ${answer.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {t('your')}: {answer.selectedAnswer}
                          </span>
                          {!answer.isCorrect && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold">
                              {t('correct')}: {answer.correctAnswer}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg border-0 press-effect"
              >
                {t('close')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
