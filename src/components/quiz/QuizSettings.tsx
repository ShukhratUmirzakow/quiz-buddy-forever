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
import { useLanguage } from '@/hooks/useLanguage';

interface QuizSettingsProps {
  quiz: Quiz;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (settings: QuizSettingsType) => void;
}

export function QuizSettingsDialog({ quiz, open, onOpenChange, onStart }: QuizSettingsProps) {
  const { t } = useLanguage();
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
    <div className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
          <Icon className="w-5 h-5 text-white/80" strokeWidth={2} />
        </div>
        <div><p className="font-semibold text-white text-sm">{title}</p><p className="text-xs text-white/40 font-medium">{subtitle}</p></div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="text-xl font-bold text-center">{t('quiz_settings')}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="p-4 rounded-[20px] bg-gradient-to-br from-[#2ECC71]/20 to-[#2ECC71]/5 border border-[#2ECC71]/20">
            <h3 className="font-bold text-lg text-white">{quiz.name}</h3>
            <p className="text-white/50 text-sm mt-1 font-medium">{quiz.questions.length} {t('questions_total')}</p>
          </div>
          <div className="space-y-2">
            <SettingRow icon={Shuffle} title={t('shuffle_questions')} subtitle={t('randomize_order')} checked={settings.shuffleQuestions} onCheckedChange={(c) => setSettings(p => ({ ...p, shuffleQuestions: c }))} />
            <SettingRow icon={Shuffle} title={t('shuffle_answers')} subtitle={t('randomize_options')} checked={settings.shuffleAnswers} onCheckedChange={(c) => setSettings(p => ({ ...p, shuffleAnswers: c }))} />
            <SettingRow icon={Zap} title={t('fast_mode')} subtitle={t('auto_advance')} checked={settings.fastMode} onCheckedChange={(c) => setSettings(p => ({ ...p, fastMode: c }))} />
            <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                    <ListOrdered className="w-5 h-5 text-white/80" strokeWidth={2} />
                  </div>
                  <div><p className="font-semibold text-white text-sm">{t('question_range')}</p><p className="text-xs text-white/40 font-medium">{t('practice_specific')}</p></div>
                </div>
                <Switch checked={settings.questionRange.enabled} onCheckedChange={(c) => setSettings(p => ({ ...p, questionRange: { ...p.questionRange, enabled: c } }))} />
              </div>
              <AnimatePresence>
                {settings.questionRange.enabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="mt-4 flex items-center gap-1.5">
                      <div className="flex-1">
                        <Label className="text-xs text-white/40 mb-1.5 block font-semibold">{t('from')}</Label>
                        <Input 
                          type="number" 
                          min={1} 
                          max={quiz.questions.length} 
                          value={settings.questionRange.start || ''} 
                          onChange={(e) => setSettings(p => ({ ...p, questionRange: { ...p.questionRange, start: e.target.value ? parseInt(e.target.value) : 0 } }))} 
                          className="h-11 rounded-2xl text-center font-bold text-sm bg-white/[0.08] border-0 text-white focus:ring-2 focus:ring-white/20 focus:ring-offset-0 focus:bg-white/[0.12] transition-colors" 
                        />
                      </div>
                      <span className="text-white/30 mt-5 font-bold text-sm px-1">—</span>
                      <div className="flex-1">
                        <Label className="text-xs text-white/40 mb-1.5 block font-semibold">{t('to')}</Label>
                        <Input 
                          type="number" 
                          min={1} 
                          max={quiz.questions.length} 
                          value={settings.questionRange.end || ''} 
                          onChange={(e) => setSettings(p => ({ ...p, questionRange: { ...p.questionRange, end: e.target.value ? parseInt(e.target.value) : 0 } }))} 
                          className="h-11 rounded-2xl text-center font-bold text-sm bg-white/[0.08] border-0 text-white focus:ring-2 focus:ring-white/20 focus:ring-offset-0 focus:bg-white/[0.12] transition-colors" 
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/30 mt-3 text-center font-medium">{t('total')}: {quiz.questions.length} {t('questions')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <Button onClick={handleStart} className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg border-0 press-effect">
          <Play className="w-5 h-5 mr-2" strokeWidth={2.5} />{t('start_quiz')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
