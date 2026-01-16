import { motion } from 'framer-motion';
import { Badge as BadgeType } from '@/types/quiz';
import { Award, Medal, Star, Trophy } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface BadgeProps {
  badge: BadgeType;
  percentage: number;
  animate?: boolean;
}

export function Badge({ badge, percentage, animate = true }: BadgeProps) {
  const { t } = useLanguage();
  
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

  const getBadgeName = () => {
    switch (badge.type) {
      case 'gold': return t('gold_medal');
      case 'silver': return t('silver_medal');
      case 'bronze': return t('bronze_medal');
      default: return t('participant');
    }
  };

  const getBadgeDescription = () => {
    switch (badge.type) {
      case 'gold': return t('outstanding');
      case 'silver': return t('great_job');
      case 'bronze': return t('good_effort');
      default: return t('keep_practicing');
    }
  };

  // Get subtle background accent color for the achievement box
  const getAccentStyle = () => {
    switch (badge.type) {
      case 'gold':
        return { background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)' };
      case 'silver':
        return { background: 'radial-gradient(ellipse at center, rgba(148, 163, 184, 0.15) 0%, transparent 70%)' };
      case 'bronze':
        return { background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.15) 0%, transparent 70%)' };
      default:
        return { background: 'radial-gradient(ellipse at center, rgba(96, 165, 250, 0.15) 0%, transparent 70%)' };
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Subtle color accent behind the badge */}
      <div 
        className="absolute inset-0 blur-2xl opacity-60"
        style={getAccentStyle()}
      />
      
      <motion.div
        initial={animate ? { scale: 0, rotate: -180 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
        className={`relative p-6 rounded-full bg-gradient-to-br ${getBadgeColors()}`}
      >
        {getBadgeIcon()}
      </motion.div>

      <motion.div
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center relative z-10"
      >
        <h3 className="font-bold text-xl text-white">{getBadgeName()}</h3>
        <p className="text-white/50">{getBadgeDescription()}</p>
      </motion.div>
    </div>
  );
}
