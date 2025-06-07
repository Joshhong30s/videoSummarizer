'use client';

import { ButtonHTMLAttributes } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  loading?: boolean;
}

export function IconButton({
  icon: Icon,
  loading,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200',
        'text-gray-500 transition-colors hover:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-gray-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Icon className="h-5 w-5" />
      )}
    </button>
  );
}
