'use client';

import { useState } from 'react';
import { useCategories } from '@/lib/contexts/categories-context';
import { Button } from '@/app/components/ui/button';
import { Plus, Save, X, Edit2, Loader2 } from 'lucide-react';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryFormData {
  name: string;
  color?: string;
}

interface CategoryEditorProps {
  onSave: () => Promise<void>;
  onCancel: () => void;
  isUpdating?: boolean;
}

export function CategoryEditor({
  onSave,
  onCancel,
  isUpdating = false,
}: CategoryEditorProps) {
  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh,
  } = useCategories();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: '#2563eb',
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const updates: Partial<Category> = {};
        if (formData.color !== editingCategory?.color) {
          updates.color = formData.color;
        }
        if (formData.name !== editingCategory?.name) {
          updates.name = formData.name;
        }

        await updateCategory(editingId, updates);
        refresh();
        setEditingId(null);
        setEditingCategory(null);
      } else {
        await addCategory(formData.name, formData.color);
        refresh();
        setIsAdding(false);
      }
      setFormData({ name: '', color: '#2563eb' });

      if (onSave) {
        await onSave();
      }
    } catch (error) {
      console.error('Failed to modify category:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Operation failed, please try again later'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await deleteCategory(id);
      refresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to delete category, please try again later'
      );
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || '#2563eb',
    });
  };

  if (loading) {
    return <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <div
            key={category.id}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1',
              'bg-gray-100 text-sm',
              editingId === category.id && 'ring-2 ring-primary'
            )}
            style={
              category.color
                ? {
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }
                : undefined
            }
          >
            {editingId === category.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-24 rounded border px-2 py-1 text-sm"
                  autoFocus
                />
                <input
                  type="color"
                  value={formData.color || '#2563eb'}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="h-6 w-6 cursor-pointer rounded-full"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={handleSubmit}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setEditingId(null);
                    setEditingCategory(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span>{category.name}</span>
                <div className="ml-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="rounded-full p-1 hover:bg-white/20"
                    disabled={isUpdating}
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    className="rounded-full p-1 hover:bg-white/20"
                    disabled={isUpdating}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Category name"
              className="w-24 rounded border px-2 py-1 text-sm"
              autoFocus
            />
            <input
              type="color"
              value={formData.color}
              onChange={e =>
                setFormData(prev => ({ ...prev, color: e.target.value }))
              }
              className="h-6 w-6 cursor-pointer rounded-full"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleSubmit}
              disabled={!formData.name || isUpdating}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => {
                setIsAdding(false);
                setFormData({ name: '', color: '#2563eb' });
              }}
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1 text-sm"
            disabled={isUpdating}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isUpdating}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Done'
          )}
        </Button>
      </div>
    </div>
  );
}
