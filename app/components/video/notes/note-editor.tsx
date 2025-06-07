'use client';

import { useState, useRef } from 'react';
import type { NoteType } from '@/lib/types/video';

interface NoteEditorProps {
  initialContent?: string;
  type?: NoteType;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
}

export function NoteEditor({
  initialContent = '',
  type = 'takeaway',
  onSave,
  onCancel,
  placeholder = 'Write your note...',
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle save
  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await onSave(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" ref={editorRef}>
      <div className="min-h-[200px] p-4 bg-white border rounded-lg">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full min-h-[180px] resize-none focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded disabled:opacity-50"
          disabled={!content.trim() || saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
