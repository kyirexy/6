'use client';

interface PitfallRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function PitfallRating({ rating, maxRating = 5, size = 'md' }: PitfallRatingProps) {
  const sizeClasses = {
    sm: 'text-sm gap-0.5',
    md: 'text-lg gap-1',
    lg: 'text-2xl gap-1.5',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground-secondary text-sm font-medium whitespace-nowrap">
        防踩坑避雷指数
      </span>
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {Array.from({ length: maxRating }, (_, i) => (
          <span
            key={i}
            className={i < rating ? 'star-filled' : 'star-empty'}
            role="img"
            aria-label={i < rating ? 'filled star' : 'empty star'}
          >
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
}
