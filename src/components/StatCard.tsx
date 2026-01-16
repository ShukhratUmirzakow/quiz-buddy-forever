import { motion } from 'framer-motion';
import { IconImage } from './IconImage';
import { cn } from '@/lib/utils';

type IconType = 'trophy' | 'accuracy' | 'correct' | 'congrats' | 'settings' | 'user' | 'quizzes';

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string | number;
  index: number;
  className?: string;
}

export function StatCard({ icon, label, value, index, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'glass-card rounded-[20px] p-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl glass-button flex items-center justify-center">
          <IconImage type={icon} size="md" />
        </div>
        <div>
          <p className="text-white/40 text-xs font-medium tracking-wide uppercase">{label}</p>
          <p className="text-white text-xl font-bold font-display">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
