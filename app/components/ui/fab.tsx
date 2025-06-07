'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

interface FABProps {
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  label?: string;
  badge?: number;
  title?: string;
}

export function FAB({
  onClick,
  className = '',
  icon = <Plus size={24} />,
  label,
  badge,
}: FABProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50 ${className}`}
    >
      {badge !== undefined && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      {icon}
      {label && <span className="sr-only">{label}</span>}
    </motion.button>
  );
}
