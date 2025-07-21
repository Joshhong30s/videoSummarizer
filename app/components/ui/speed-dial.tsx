'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState, ReactNode } from 'react';

interface SpeedDialAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
  color?: string;
}

interface SpeedDialProps {
  actions: SpeedDialAction[];
  className?: string;
}

export function SpeedDial({ actions, className = '' }: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-2">
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.3, 
                  y: 20,
                  transition: { delay: (actions.length - index - 1) * 0.05 }
                }}
                className="flex items-center gap-3"
              >
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
                >
                  {action.label}
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`
                    relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center
                    ${action.color || 'bg-gray-700 dark:bg-gray-600 text-white'}
                    hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900
                  `}
                  aria-label={action.label}
                >
                  {action.badge !== undefined && action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {action.badge > 99 ? '99+' : action.badge}
                    </span>
                  )}
                  {action.icon}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 
          dark:from-blue-500 dark:to-blue-600 rounded-full shadow-lg 
          flex items-center justify-center text-white 
          hover:shadow-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 
          focus:ring-blue-500 dark:focus:ring-offset-gray-900
        `}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 -z-10 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}