'use client';

import { useHighlightsContext } from '@/lib/contexts/highlights-context';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';
import { formatTime } from '@/lib/utils/format-time';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';

export function HighlightsView() {
  const { highlights, removeHighlight, updateHighlight } =
    useHighlightsContext();
  const { seekTo } = useVideoPlayer();
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const handlePlay = (startTime: number) => {
    seekTo(startTime);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this highlight?')) {
      await removeHighlight(id);
    }
  };

  const handleEdit = async (id: string) => {
    const highlight = highlights.find(h => h.id === id);
    if (!highlight) return;

    setEditingHighlight(id);
    setEditNote(highlight.note || '');
  };

  const handleSaveNote = async (id: string) => {
    await updateHighlight(id, { note: editNote });
    setEditingHighlight(null);
    setEditNote('');
  };

  if (highlights.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No highlights yet
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <AnimatePresence>
        {highlights.map(highlight => (
          <motion.div
            key={highlight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {formatTime(highlight.start_offset)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlay(highlight.start_offset)}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Play from here"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(highlight.id)}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Edit note"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(highlight.id)}
                  className="rounded p-1 hover:bg-gray-100"
                  title="Delete highlight"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-700">{highlight.content}</p>

            {editingHighlight === highlight.id ? (
              <div className="mt-2">
                <textarea
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  rows={3}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setEditingHighlight(null)}
                    className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveNote(highlight.id)}
                    className="rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              highlight.note && (
                <p className="mt-2 text-sm italic text-gray-500">
                  {highlight.note}
                </p>
              )
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
