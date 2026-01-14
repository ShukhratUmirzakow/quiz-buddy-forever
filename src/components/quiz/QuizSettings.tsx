import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    // Validate range only on start
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
      <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-xl mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quiz Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Quiz Info */}
          <div className="p-4 rounded-2xl gradient-primary text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-20">
              <Play className="w-20 h-20 text-white blur-[2px]" strokeWidth={1} />
            </div>
            <h3 className="font-bold text-lg relative">{quiz.name}</h3>
            <p className="text-white/70 text-sm mt-1 relative">
              {quiz.questions.length} questions total
            </p>
          </div>

          {/* Settings Options */}
          <div className="space-y-2">
            {/* Shuffle Questions */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <Shuffle className="w-8 h-8 text-violet-500 blur-[1px] absolute -right-1 -top-1" strokeWidth={1.5} />
                  </div>
                  <Shuffle className="w-5 h-5 text-violet-600 relative" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Shuffle Questions</p>
                  <p className="text-xs text-gray-400">Randomize order</p>
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
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <Shuffle className="w-8 h-8 text-emerald-500 blur-[1px] absolute -right-1 -top-1" strokeWidth={1.5} />
                  </div>
                  <Shuffle className="w-5 h-5 text-emerald-600 relative" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Shuffle Answers</p>
                  <p className="text-xs text-gray-400">Randomize options</p>
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
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <Zap className="w-8 h-8 text-cyan-500 blur-[1px] absolute -right-1 -top-1" strokeWidth={1.5} />
                  </div>
                  <Zap className="w-5 h-5 text-cyan-600 relative" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Fast Mode</p>
                  <p className="text-xs text-gray-400">Auto-advance questions</p>
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
            <div className="p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      <ListOrdered className="w-8 h-8 text-amber-500 blur-[1px] absolute -right-1 -top-1" strokeWidth={1.5} />
                    </div>
                    <ListOrdered className="w-5 h-5 text-amber-600 relative" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Question Range</p>
                    <p className="text-xs text-gray-400">Practice specific part</p>
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

              {settings.questionRange.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-400 mb-1 block font-semibold">From</Label>
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
                        className="h-12 rounded-xl text-center font-bold text-lg border-gray-200"
                      />
                    </div>
                    <span className="text-gray-300 mt-5 font-bold text-lg">—</span>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-400 mb-1 block font-semibold">To</Label>
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
                        className="h-12 rounded-xl text-center font-bold text-lg border-gray-200"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Total: {quiz.questions.length} questions
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleStart}
          className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg shadow-lg border-0"
        >
          <Play className="w-5 h-5 mr-2" strokeWidth={2.5} />
          Start Quiz
        </Button>
      </DialogContent>
    </Dialog>
  );
}