'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarPickerProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const labels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const colors: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-yellow-400',
  4: 'text-lime-400',
  5: 'text-green-500',
};

export default function StarPicker({ value, onChange, size = 'md', readonly = false }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: 'h-5 w-5', md: 'h-7 w-7', lg: 'h-9 w-9' };
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-all duration-100 focus:outline-none ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
            }`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${sizes[size]} transition-all duration-100 ${
                star <= active
                  ? `fill-current ${colors[active] || 'text-yellow-400'}`
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
      {!readonly && active > 0 && (
        <span className={`ml-2 text-sm font-semibold ${colors[active]}`}>
          {labels[active]}
        </span>
      )}
    </div>
  );
}
