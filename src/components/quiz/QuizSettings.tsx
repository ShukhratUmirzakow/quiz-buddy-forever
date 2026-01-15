import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ListOrdered, Play, Zap } from 'lucide-react';
import { Quiz, QuizSettings as QuizSettingsType } from '@/types/quiz';
import { validateQuestionRange } from '@/lib/quizParser';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GlowIcon } from '@/components/GlowIcon';

interface QuizSettingsProps {
  quiz: Quiz;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (settings: QuizSettingsType) => void;
}

export function QuizSettingsDialog({ quiz, open, onOpenChange, onStart }: QuizSettingsProps) {
  const [settings, setSettings] = useState<QuizSettingsType>({
    shuffleQuestions: false,
    shuffleAnswers: true,
    fastMode: false,
    questionRange: {
      enabled: false,
      start: 1,
      end: quiz.questions.length,
    },
  });

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      questionRange: {
        ...prev.questionRange,
        end: quiz.questions.length,
      },
    }));
  }, [quiz.questions.length]);

  const handleStart = () => {
    if (settings.questionRange.enabled) {
      const validation = validateQuestionRange(
        settings.questionRange.start,
        settings.questionRange.end,
        quiz.questions.length
      );
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid question range');
        return;
      }
    }
    onStart(settings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Quiz Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Quiz Info */}
          <div className="p-4 rounded-2xl gradient-primary relative overflow-hidden shadow-glow-violet">
            <div className="absolute -right-4 -top-4 opacity-20">
              <Play className="w-20 h-20 text-white blur-sm" strokeWidth={1} />
            </div>
            <h3 className="font-bold text-lg text-white relative">{quiz.name}</h3>
            <p className="text-white/60 text-sm mt-1 relative font-medium">
              {quiz.questions.length} questions total
            </p>
          </div>

          {/* Settings Options */}
          <div className="space-y-2">
            {/* Shuffle Questions */}
            <div className="flex items-center justify-between p-4 rounded-2xl glass-card">
              <div className="flex items-center gap-3">
                <GlowIcon icon={Shuffle} color="violet" size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">Shuffle Questions</p>
                  <p className="text-xs text-white/40 font-medium">Randomize order</p>
                </div>
              </div>
              <Switch
                checked={settings.shuffleQuestions}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, shuffleQuestions: checked }))
                }
              />
            </div>

            {/* Shuffle Answers */}
            <div className="flex items-center justify-between p-4 rounded-2xl glass-card">
              <div className="flex items-center gap-3">
                <GlowIcon icon={Shuffle} color="emerald" size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">Shuffle Answers</p>
                  <p className="text-xs text-white/40 font-medium">Randomize options</p>
                </div>
              </div>
              <Switch
                checked={settings.shuffleAnswers}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, shuffleAnswers: checked }))
                }
              />
            </div>

            {/* Fast Mode */}
            <div className="flex items-center justify-between p-4 rounded-2xl glass-card">
              <div className="flex items-center gap-3">
                <GlowIcon icon={Zap} color="cyan" size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">Fast Mode</p>
                  <p className="text-xs text-white/40 font-medium">Auto-advance questions</p>
                </div>
              </div>
              <Switch
                checked={settings.fastMode}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, fastMode: checked }))
                }
              />
            </div>

            {/* Question Range */}
            <div className="p-4 rounded-2xl glass-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <GlowIcon icon={ListOrdered} color="amber" size="sm" />
                  <div>
                    <p className="font-semibold text-white text-sm">Question Range</p>
                    <p className="text-xs text-white/40 font-medium">Practice specific part</p>
                  </div>
                </div>
                <Switch
                  checked={settings.questionRange.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      questionRange: { ...prev.questionRange, enabled: checked },
                    }))
                  }
                />
              </div>

              <AnimatePresence>
                {settings.questionRange.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-white/40 mb-1 block font-semibold">From</Label>
                          <Input
                            type="number"
                            min={1}
                            max={quiz.questions.length}
                            value={settings.questionRange.start || ''}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                questionRange: {
                                  ...prev.questionRange,
                                  start: e.target.value ? parseInt(e.target.value) : 0,
                                },
                              }))
                            }
                            placeholder="1"
                            className="h-12 rounded-xl text-center font-bold text-lg bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <span className="text-white/30 mt-5 font-bold text-lg">—</span>
                        <div className="flex-1">
                          <Label className="text-xs text-white/40 mb-1 block font-semibold">To</Label>
                          <Input
                            type="number"
                            min={1}
                            max={quiz.questions.length}
                            value={settings.questionRange.end || ''}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                questionRange: {
                                  ...prev.questionRange,
                                  end: e.target.value ? parseInt(e.target.value) : 0,
                                },
                              }))
                            }
                            placeholder={String(quiz.questions.length)}
                            className="h-12 rounded-xl text-center font-bold text-lg bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-white/30 mt-2 text-center font-medium">
                        Total: {quiz.questions.length} questions
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStart}
          className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg shadow-glow-emerald border-0 press-effect"
        >
          <Play className="w-5 h-5 mr-2" strokeWidth={2.5} />
          Start Quiz
        </Button>
      </DialogContent>
    </Dialog>
  );
}
