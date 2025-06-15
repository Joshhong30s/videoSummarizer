'use client';

import { useState, useCallback } from 'react';
import { useVideoDetail } from '@/lib/hooks/video/use-video-detail';
import { NoteEditor } from './note-editor';
import { NoteList } from './note-list';
import { ObsidianExport } from '@/app/components/video';
import { useVideoNotes } from '@/lib/contexts/video-notes-context';
import type { VideoNote } from '@/lib/types/video';
import { Plus } from 'lucide-react';

interface NotesManagerProps {
  videoId: string;
}

export function NotesManager({ videoId }: NotesManagerProps) {
  const { video } = useVideoDetail(videoId);
  const { notes, loading, error, addNote, updateNote, deleteNote } =
    useVideoNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<VideoNote | null>(null);

  const handleStartEdit = useCallback((note?: VideoNote) => {
    setEditingNote(note || null);
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditingNote(null);
  }, []);

  const handleSave = useCallback(
    async (content: string) => {
      if (editingNote) {
        await updateNote(editingNote.id, { content });
      } else {
        await addNote(content);
      }
      setIsEditing(false);
      setEditingNote(null);
    },
    [editingNote, addNote, updateNote]
  );

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const transformedNotes: VideoNote[] = notes.map(note => ({
    id: note.id,
    video_id: note.video_id,
    content: note.content,
    timestamp: note.timestamp ?? null,
    created_at: note.created_at,
    updated_at: note.updated_at,
    type: 'note',
    tags: [],
  }));

  const notesContent = transformedNotes.map(note => note.content).join('\n\n');
  const highlights = transformedNotes
    .filter(note => note.timestamp)
    .map(note => ({
      timestamp: note.timestamp as number,
      content: note.content,
    }));

  const videoUrl = `https://youtube.com/watch?v=${video?.youtube_id}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notes List</h3>
        <div className="flex items-center gap-4">
          {video && (
            <ObsidianExport
              title={video.title}
              url={videoUrl}
              summary={video.summary?.zh_summary || ''}
              highlights={highlights}
              notes={notesContent}
              tags={video.category_ids || []}
            />
          )}
          <button
            onClick={() => handleStartEdit()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <NoteEditor
            initialContent={editingNote?.content}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      <NoteList
        notes={transformedNotes}
        onEdit={handleStartEdit}
        onDelete={deleteNote}
      />
    </div>
  );
}
