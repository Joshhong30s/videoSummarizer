'use client';

import { useState } from 'react';
import { VideoNote } from '@/lib/types';
import { formatTime } from '@/lib/utils/format-time';
import { Edit2, Trash2, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface NoteListProps {
  notes: VideoNote[];
  onEdit?: (note: VideoNote) => void;
  onDelete?: (noteId: string) => void;
}

export function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const toggleExpand = (noteId: string) => {
    setExpandedNote(expandedNote === noteId ? null : noteId);
  };

  if (notes.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No notes yet. Click the add button to start taking notes.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {notes.map(note => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white border rounded-lg overflow-hidden shadow-sm"
          >
            {/* Note header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                  {note.type}
                </span>
                {note.timestamp && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(note.timestamp)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(note)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    aria-label="Edit note"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          'Are you sure you want to delete this note?'
                        )
                      ) {
                        onDelete(note.id);
                      }
                    }}
                    className="p-1 text-gray-500 hover:text-red-500"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Note content */}
            <div
              className={`p-4 transition-all duration-200 ${
                expandedNote === note.id ? '' : 'line-clamp-3'
              }`}
              onClick={() => toggleExpand(note.id)}
            >
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
