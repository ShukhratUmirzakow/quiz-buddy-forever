import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type GlowColor = 'violet' | 'emerald' | 'amber' | 'cyan' | 'red' | 'pink';

interface GlowIconProps {
  icon: LucideIcon;
  color: GlowColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap: Record<GlowColor, { glow: string; icon: string }> = {
  violet: {
    glow: 'from-violet-500/40 via-violet-500/20 to-transparent',
    icon: 'text-violet-400',
  },
  emerald: {
    glow: 'from-emerald-500/40 via-emerald-500/20 to-transparent',
    icon: 'text-emerald-400',
  },
  amber: {
    glow: 'from-amber-500/40 via-amber-500/20 to-transparent',
    icon: 'text-amber-400',
  },
  cyan: {
    glow: 'from-cyan-500/40 via-cyan-500/20 to-transparent',
    icon: 'text-cyan-400',
  },
  red: {
    glow: 'from-red-500/40 via-red-500/20 to-transparent',
    icon: 'text-red-400',
  },
  pink: {
    glow: 'from-pink-500/40 via-pink-500/20 to-transparent',
    icon: 'text-pink-400',
  },
};

const sizeMap = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5', blur: 'w-12 h-12' },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6', blur: 'w-14 h-14' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7', blur: 'w-16 h-16' },
};

export function GlowIcon({ icon: Icon, color, size = 'md', className }: GlowIconProps) {
  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center rounded-xl',
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border border-white/[0.08]',
        sizes.container,
        className
      )}
    >
      {/* Glow effect */}
      <div 
        className={cn(
          'absolute inset-0 rounded-xl blur-lg opacity-60',
          `bg-gradient-radial ${colors.glow}`
        )}
        style={{
          background: `radial-gradient(circle at center, ${color === 'violet' ? 'rgba(139, 92, 246, 0.4)' : 
            color === 'emerald' ? 'rgba(16, 185, 129, 0.4)' :
            color === 'amber' ? 'rgba(245, 158, 11, 0.4)' :
            color === 'cyan' ? 'rgba(6, 182, 212, 0.4)' :
            color === 'red' ? 'rgba(239, 68, 68, 0.4)' :
            'rgba(236, 72, 153, 0.4)'} 0%, transparent 70%)`
        }}
      />
      
      {/* Icon */}
      <Icon 
        className={cn('relative z-10', sizes.icon, colors.icon)} 
        strokeWidth={2.5} 
      />
    </div>
  );
}
