import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ListOrdered, Play, Zap } from 'lucide-react';
import { Quiz, QuizSettings as QuizSettingsType } from '@/types/quiz';
import { validateQuestionRange } from '@/lib/quizParser';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface QuizSettingsProps {
  quiz: Quiz;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (settings: QuizSettingsType) => void;
}

export function QuizSettingsDialog({ quiz, open, onOpenChange, onStart }: QuizSettingsProps) {
  const [settings, setSettings] = useState<QuizSettingsType>({
    shuffleQuestions: false, shuffleAnswers: true, fastMode: false,
    questionRange: { enabled: false, start: 1, end: quiz.questions.length },
  });

  useEffect(() => { setSettings(prev => ({ ...prev, questionRange: { ...prev.questionRange, end: quiz.questions.length } })); }, [quiz.questions.length]);

  const handleStart = () => {
    if (settings.questionRange.enabled) {
      const validation = validateQuestionRange(settings.questionRange.start, settings.questionRange.end, quiz.questions.length);
      if (!validation.valid) { toast.error(validation.error || 'Invalid question range'); return; }
    }
    onStart(settings);
  };

  const SettingRow = ({ icon: Icon, title, subtitle, checked, onCheckedChange }: { icon: any; title: string; subtitle: string; checked: boolean; onCheckedChange: (c: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 rounded-[20px] glass-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl glass-button flex items-center justify-center"><Icon className="w-5 h-5 text-white/70" strokeWidth={2} /></div>
        <div><p className="font-semibold text-white text-sm">{title}</p><p className="text-xs text-white/40 font-medium">{subtitle}</p></div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="text-xl font-bold text-center">Quiz Settings</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="p-4 rounded-[20px] glass-card">
            <h3 className="font-bold text-lg text-white">{quiz.name}</h3>
            <p className="text-white/50 text-sm mt-1 font-medium">{quiz.questions.length} questions total</p>
          </div>
          <div className="space-y-2">
            <SettingRow icon={Shuffle} title="Shuffle Questions" subtitle="Randomize order" checked={settings.shuffleQuestions} onCheckedChange={(c) => setSettings(p => ({ ...p, shuffleQuestions: c }))} />
            <SettingRow icon={Shuffle} title="Shuffle Answers" subtitle="Randomize options" checked={settings.shuffleAnswers} onCheckedChange={(c) => setSettings(p => ({ ...p, shuffleAnswers: c }))} />
            <SettingRow icon={Zap} title="Fast Mode" subtitle="Auto-advance questions" checked={settings.fastMode} onCheckedChange={(c) => setSettings(p => ({ ...p, fastMode: c }))} />
            <div className="p-4 rounded-[20px] glass-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl glass-button flex items-center justify-center"><ListOrdered className="w-5 h-5 text-white/70" strokeWidth={2} /></div>
                  <div><p className="font-semibold text-white text-sm">Question Range</p><p className="text-xs text-white/40 font-medium">Practice specific part</p></div>
                </div>
                <Switch checked={settings.questionRange.enabled} onCheckedChange={(c) => setSettings(p => ({ ...p, questionRange: { ...p.questionRange, enabled: c } }))} />
              </div>
              <AnimatePresence>
                {settings.questionRange.enabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1"><Label className="text-xs text-white/40 mb-1 block font-semibold">From</Label><Input type="number" min={1} max={quiz.questions.length} value={settings.questionRange.start || ''} onChange={(e) => setSettings(p => ({ ...p, questionRange: { ...p.questionRange, start: e.target.value ? parseInt(e.target.value) : 0 } }))} className="h-12 rounded-xl text-center font-bold text-lg bg-white/5 border-white/10 text-white" /></div>
                      <span className="text-white/30 mt-5 font-bold text-lg">—</span>
                      <div className="flex-1"><Label className="text-xs text-white/40 mb-1 block font-semibold">To</Label><Input type="number" min={1} max={quiz.questions.length} value={settings.questionRange.end || ''} onChange={(e) => setSettings(p => ({ ...p, questionRange: { ...p.questionRange, end: e.target.value ? parseInt(e.target.value) : 0 } }))} className="h-12 rounded-xl text-center font-bold text-lg bg-white/5 border-white/10 text-white" /></div>
                    </div>
                    <p className="text-xs text-white/30 mt-2 text-center font-medium">Total: {quiz.questions.length} questions</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <Button onClick={handleStart} className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg border-0 press-effect">
          <Play className="w-5 h-5 mr-2" strokeWidth={2.5} />Start Quiz
        </Button>
      </DialogContent>
    </Dialog>
  );
}