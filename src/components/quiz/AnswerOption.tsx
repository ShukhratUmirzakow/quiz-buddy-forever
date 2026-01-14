import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface AnswerOptionProps {
  label: string;
  text: string;
  selected: boolean;
  isCorrect: boolean | null;
  showResult: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function AnswerOption({
  label,
  text,
  selected,
  isCorrect,
  showResult,
  disabled,
  onClick,
}: AnswerOptionProps) {
  const getStateClasses = () => {
    if (!showResult) {
      if (selected) {
        return 'border-primary bg-primary/5 ring-2 ring-primary/30';
      }
      return 'border-border bg-card hover:border-primary/50 hover:bg-primary/5';
    }

    if (isCorrect) {
      return 'border-success bg-success/10 ring-2 ring-success/30';
    }

    if (selected && !isCorrect) {
      return 'border-destructive bg-destructive/10 ring-2 ring-destructive/30';
    }

    return 'border-border bg-card opacity-50';
  };

  const getIcon = () => {
    if (!showResult) return null;
    
    if (isCorrect) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-success text-success-foreground"
        >
          <Check className="w-5 h-5" />
        </motion.div>
      );
    }

    if (selected && !isCorrect) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive text-destructive-foreground"
        >
          <X className="w-5 h-5" />
        </motion.div>
      );
    }

    return null;
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      className={`
        w-full p-4 rounded-xl border-2 transition-all duration-200
        flex items-center justify-between gap-4 text-left
        ${getStateClasses()}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${showResult && selected ? (isCorrect ? 'animate-pulse-success' : 'animate-pulse-error') : ''}
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
          ${showResult && isCorrect ? 'bg-success text-success-foreground' : ''}
          ${showResult && selected && !isCorrect ? 'bg-destructive text-destructive-foreground' : ''}
          ${!showResult ? 'bg-muted text-muted-foreground' : ''}
          ${!showResult && selected ? 'bg-primary text-primary-foreground' : ''}
        `}>
          {label}
        </span>
        <span className="text-foreground font-medium">{text}</span>
      </div>
      {getIcon()}
    </motion.button>
  );
}
