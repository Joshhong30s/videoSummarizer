'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonAnimationProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export function ButtonAnimation({
  children,
  className = '',
  onClick,
  'aria-label': ariaLabel,
}: ButtonAnimationProps) {
  return (
    <motion.button
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
