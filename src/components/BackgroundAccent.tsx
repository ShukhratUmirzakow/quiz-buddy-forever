// Subtle background accent blobs - very minimal and blurred

interface BackgroundAccentProps {
  variant?: 'home' | 'quiz' | 'results';
  badgeColor?: 'gold' | 'silver' | 'bronze' | 'participant';
}

export function BackgroundAccent({ variant = 'home', badgeColor }: BackgroundAccentProps) {
  // Base dark greenish accent color
  const getAccentColor = () => {
    if (badgeColor) {
      switch (badgeColor) {
        case 'gold':
          return 'rgba(251, 191, 36, 0.08)';
        case 'silver':
          return 'rgba(148, 163, 184, 0.08)';
        case 'bronze':
          return 'rgba(251, 146, 60, 0.08)';
        case 'participant':
          return 'rgba(96, 165, 250, 0.08)';
      }
    }
    return 'rgba(34, 197, 94, 0.04)'; // Very subtle dark green
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top right accent */}
      <div 
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px]"
        style={{ backgroundColor: getAccentColor() }}
      />
      
      {/* Bottom left accent */}
      <div 
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[150px]"
        style={{ backgroundColor: getAccentColor() }}
      />
      
      {/* Center subtle accent for quiz/results */}
      {(variant === 'quiz' || variant === 'results') && (
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px]"
          style={{ backgroundColor: getAccentColor() }}
        />
      )}
    </div>
  );
}
