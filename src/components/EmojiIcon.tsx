import { cn } from '@/lib/utils';

type EmojiType = 'wave' | 'fire' | 'trophy' | 'target' | 'books' | 'zap' | 'sparkles' | 'party' | 'check' | 'cross';

interface EmojiIconProps {
  type: EmojiType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export function EmojiIcon({ type, size = 'md', className }: EmojiIconProps) {
  return (
    <span 
      className={cn(
        'emoji inline-block',
        `emoji-${type}`,
        sizeMap[size],
        className
      )} 
      role="img" 
      aria-hidden="true"
    />
  );
}