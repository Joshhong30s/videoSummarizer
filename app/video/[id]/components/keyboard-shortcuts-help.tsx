'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: ['Space', 'K'], description: 'Play/Pause' },
  { keys: ['←'], description: 'Rewind 5 seconds' },
  { keys: ['→'], description: 'Forward 5 seconds' },
  { keys: ['J'], description: 'Rewind 10 seconds' },
  { keys: ['L'], description: 'Forward 10 seconds' },
  { keys: ['Home'], description: 'Go to start' },
  { keys: ['End'], description: 'Go to end' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
      >
        <Keyboard className="w-4 h-4" />
        <span className="font-medium">Keyboard Shortcuts</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Available Shortcuts</h3>
            </div>
            <div className="p-3">
              <div className="space-y-2">
                {shortcuts.map(({ keys, description }) => (
                  <div
                    key={description}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1">
                      {keys.map(key => (
                        <kbd
                          key={key}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{description}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
