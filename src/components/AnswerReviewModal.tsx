import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { QuizAttempt, Quiz, QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { getQuiz } from '@/lib/quizStorage';

interface AnswerReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: QuizAttempt['answers'];
  quizId?: string;
}

export function AnswerReviewModal({ open, onOpenChange, answers, quizId }: AnswerReviewModalProps) {
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const { t } = useLanguage();
  
  useEffect(() => {
    async function loadQuiz() {
      if (quizId && open) {
        const loadedQuiz = await getQuiz(quizId);
        setQuiz(loadedQuiz);
      }
    }
    loadQuiz();
  }, [quizId, open]);
  
  const displayedAnswers = showWrongOnly 
    ? answers.filter(a => !a.isCorrect) 
    : answers;

  const getAnswerText = (questionIndex: number, answerLabel: string): string | null => {
    if (!quiz) return null;
    const question = quiz.questions[questionIndex];
    if (!question) return null;
    const option = question.options.find(opt => opt.label === answerLabel);
    return option?.text || null;
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

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
            className="flex-1 flex flex-col bg-background/95 backdrop-blur-xl mt-12 rounded-t-[2rem] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
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
            
            {/* Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
              <div className="space-y-3 pb-4">
                {displayedAnswers.map((answer, idx) => {
                  const isExpanded = expandedIndex === idx;
                  const yourAnswerText = getAnswerText(answer.questionIndex, answer.selectedAnswer);
                  const correctAnswerText = getAnswerText(answer.questionIndex, answer.correctAnswer);
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="glass-card rounded-[20px] overflow-hidden"
                    >
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full p-4 text-left"
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
                            <p className="text-white text-sm font-medium leading-relaxed line-clamp-2">
                              {answer.questionText}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs mt-2">
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
                          <div className="flex-shrink-0 ml-2">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-white/40" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-white/40" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-0">
                              <div className="pt-3 space-y-3">
                                {/* Your Answer Details */}
                                <div className={`p-3 rounded-xl ${answer.isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                  <p className={`text-xs font-semibold mb-1 ${answer.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {t('your_answer')} ({answer.selectedAnswer})
                                  </p>
                                  <p className="text-white/80 text-sm">
                                    {yourAnswerText || answer.selectedAnswer}
                                  </p>
                                </div>
                                
                                {/* Correct Answer Details (only if wrong) */}
                                {!answer.isCorrect && (
                                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-xs font-semibold mb-1 text-emerald-400">
                                      {t('correct_answer')} ({answer.correctAnswer})
                                    </p>
                                    <p className="text-white/80 text-sm">
                                      {correctAnswerText || answer.correctAnswer}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
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