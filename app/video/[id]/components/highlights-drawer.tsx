// /app/video/[id]/components/highlights-drawer.tsx
'use client';

import { useHighlights } from '@/lib/hooks/video/use-highlights';
import { useVideoPlayer } from '@/lib/contexts/video-player-context';
import { formatTime } from '@/lib/utils/format-time';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Play, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HighlightsDrawerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function HighlightsDrawer({
  isOpen,
  onClose,
  videoId,
}: HighlightsDrawerProps) {
  const { highlights, removeHighlight, updateHighlight } = useHighlights({
    videoId,
  });
  const { seekTo } = useVideoPlayer();
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setEditingHighlight(null);
      setEditNote('');
    }
  }, [isOpen]);

  const handlePlay = (startTime: number) => {
    seekTo(startTime); // ✅ 呼叫播放器跳轉
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this highlight?')) {
      await removeHighlight(id);
    }
  };

  const handleEditStart = (id: string) => {
    const highlight = highlights.find(h => h.id === id);
    if (highlight) {
      setEditingHighlight(id);
      setEditNote(highlight.note || '');
    }
  };

  const handleSaveNote = async (id: string) => {
    await updateHighlight(id, { note: editNote }); // ✅ 修正型別
    setEditingHighlight(null);
    setEditNote('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-96 max-w-full bg-white shadow-lg z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Highlights</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {highlights.length === 0 ? (
                <p className="text-gray-500 text-center">No highlights yet</p>
              ) : (
                highlights.map(highlight => (
                  <motion.div
                    key={highlight.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {formatTime(highlight.start_offset)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlay(highlight.start_offset)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Play from here"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditStart(highlight.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit note"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(highlight.id)}
                          className="p-1 hover:bg-gray-100 rounded"
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
                          autoFocus
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => setEditingHighlight(null)}
                            className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(highlight.id)}
                            className="px-2 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded"
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
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
