import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, ListOrdered, Play, AlertCircle } from 'lucide-react';
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
    questionRange: {
      enabled: false,
      start: 1,
      end: quiz.questions.length,
    },
  });
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      questionRange: {
        ...prev.questionRange,
        end: quiz.questions.length,
      },
    }));
  }, [quiz.questions.length]);

  useEffect(() => {
    if (settings.questionRange.enabled) {
      const validation = validateQuestionRange(
        settings.questionRange.start,
        settings.questionRange.end,
        quiz.questions.length
      );
      setRangeError(validation.valid ? null : validation.error || null);
    } else {
      setRangeError(null);
    }
  }, [settings.questionRange, quiz.questions.length]);

  const handleStart = () => {
    if (rangeError) return;
    onStart(settings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quiz Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quiz Info */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white">
            <h3 className="font-bold text-lg">{quiz.name}</h3>
            <p className="text-white/70 text-sm mt-1">
              {quiz.questions.length} questions total
            </p>
          </div>

          {/* Shuffle Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Shuffle className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Shuffle Questions</p>
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

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Shuffle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Shuffle Answers</p>
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

            <div className="p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <ListOrdered className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Question Range</p>
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
                  className="mt-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-400 mb-1 block">From</Label>
                      <Input
                        type="number"
                        min={1}
                        max={quiz.questions.length}
                        value={settings.questionRange.start}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            questionRange: {
                              ...prev.questionRange,
                              start: parseInt(e.target.value) || 1,
                            },
                          }))
                        }
                        className="h-12 rounded-xl text-center font-bold text-lg"
                      />
                    </div>
                    <span className="text-gray-300 mt-5 font-bold">—</span>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-400 mb-1 block">To</Label>
                      <Input
                        type="number"
                        min={1}
                        max={quiz.questions.length}
                        value={settings.questionRange.end}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            questionRange: {
                              ...prev.questionRange,
                              end: parseInt(e.target.value) || quiz.questions.length,
                            },
                          }))
                        }
                        className="h-12 rounded-xl text-center font-bold text-lg"
                      />
                    </div>
                  </div>

                  {rangeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {rangeError}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={!!rangeError}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/30 border-0"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Quiz
        </Button>
      </DialogContent>
    </Dialog>
  );
}
