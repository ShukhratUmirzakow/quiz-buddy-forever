import { cn } from '@/lib/utils';

// Import all custom icons
import trophyIcon from '@/assets/trophy.png';
import accuracyIcon from '@/assets/accuracy.png';
import correctIcon from '@/assets/correct.png';
import congratsIcon from '@/assets/congrats.png';
import settingsIcon from '@/assets/settings.png';
import userIcon from '@/assets/user.png';
import quizzesIcon from '@/assets/quizzes.png';
import puzzleIcon from '@/assets/puzzle.png';

type IconType = 'trophy' | 'accuracy' | 'correct' | 'congrats' | 'settings' | 'user' | 'quizzes' | 'puzzle';

const iconMap: Record<IconType, string> = {
  trophy: trophyIcon,
  accuracy: accuracyIcon,
  correct: correctIcon,
  congrats: congratsIcon,
  settings: settingsIcon,
  user: userIcon,
  quizzes: quizzesIcon,
  puzzle: puzzleIcon,
};

interface IconImageProps {
  type: IconType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export function IconImage({ type, size = 'md', className }: IconImageProps) {
  return (
    <img
      src={iconMap[type]}
      alt={type}
      className={cn(sizeMap[size], 'object-contain', className)}
    />
  );
}

export { trophyIcon, accuracyIcon, correctIcon, congratsIcon, settingsIcon, userIcon };
