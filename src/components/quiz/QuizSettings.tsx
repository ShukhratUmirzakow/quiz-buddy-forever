import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shuffle, ListOrdered, Play, AlertCircle } from 'lucide-react';
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

  const isValid = !rangeError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Quiz Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quiz Info */}
          <div className="p-4 rounded-xl bg-muted/50">
            <h3 className="font-bold text-foreground">{quiz.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {quiz.questions.length} questions total
            </p>
          </div>

          {/* Shuffle Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shuffle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <Label className="font-medium">Shuffle Questions</Label>
                  <p className="text-xs text-muted-foreground">
                    Randomize question order
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.shuffleQuestions}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, shuffleQuestions: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Shuffle className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <Label className="font-medium">Shuffle Answers</Label>
                  <p className="text-xs text-muted-foreground">
                    Randomize answer options
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.shuffleAnswers}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, shuffleAnswers: checked }))
                }
              />
            </div>
          </div>

          {/* Question Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <ListOrdered className="w-4 h-4 text-success" />
                </div>
                <div>
                  <Label className="font-medium">Question Range</Label>
                  <p className="text-xs text-muted-foreground">
                    Practice specific questions
                  </p>
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
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">From</Label>
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
                      className="mt-1"
                    />
                  </div>
                  <span className="text-muted-foreground mt-5">—</span>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">To</Label>
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
                      className="mt-1"
                    />
                  </div>
                </div>

                {rangeError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {rangeError}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={!isValid}
          className="w-full gradient-primary text-primary-foreground shadow-button hover:opacity-90 h-12 text-base font-semibold"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Quiz
        </Button>
      </DialogContent>
    </Dialog>
  );
}
