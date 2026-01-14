import { motion } from 'framer-motion';
import { Badge as BadgeType } from '@/types/quiz';
import { Award, Medal, Star, Trophy } from 'lucide-react';

interface BadgeProps {
  badge: BadgeType;
  percentage: number;
  animate?: boolean;
}

export function Badge({ badge, percentage, animate = true }: BadgeProps) {
  const getBadgeIcon = () => {
    switch (badge.type) {
      case 'gold':
        return <Trophy className="w-16 h-16" />;
      case 'silver':
        return <Medal className="w-16 h-16" />;
      case 'bronze':
        return <Award className="w-16 h-16" />;
      default:
        return <Star className="w-16 h-16" />;
    }
  };

  const getBadgeColors = () => {
    switch (badge.type) {
      case 'gold':
        return 'from-yellow-400 via-amber-500 to-yellow-600 text-yellow-900';
      case 'silver':
        return 'from-slate-300 via-slate-400 to-slate-500 text-slate-800';
      case 'bronze':
        return 'from-orange-400 via-orange-500 to-orange-600 text-orange-900';
      default:
        return 'from-blue-400 via-blue-500 to-blue-600 text-blue-900';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={animate ? { scale: 0, rotate: -180 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 15,
          delay: 0.3 
        }}
        className={`
          relative p-6 rounded-full bg-gradient-to-br ${getBadgeColors()}
          shadow-lg
        `}
      >
        {getBadgeIcon()}
        
        {/* Sparkles */}
        {animate && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ delay: 0.8, duration: 1, repeat: 2 }}
              className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ delay: 1, duration: 1, repeat: 2 }}
              className="absolute -bottom-1 -left-3 w-3 h-3 bg-primary rounded-full"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ delay: 1.2, duration: 1, repeat: 2 }}
              className="absolute top-1 -left-4 w-2 h-2 bg-accent rounded-full"
            />
          </>
        )}
      </motion.div>

      <motion.div
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <h3 className="font-bold text-xl text-foreground">{badge.name}</h3>
        <p className="text-muted-foreground">{badge.description}</p>
      </motion.div>
    </div>
  );
}
