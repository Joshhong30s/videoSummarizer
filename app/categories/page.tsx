'use client';

import { useState } from 'react';
import { useCategories } from '@/lib/contexts/categories-context';
import { AppHeader } from '@/app/components/layout/app-header';
import { Button } from '@/app/components/ui/button';
import { CategoryTag } from '@/app/components/ui/category-tag';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, refresh } =
    useCategories();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
  ];

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await addCategory(newCategoryName, newCategoryColor);

      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
      setIsCreating(false);
      await refresh();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    try {
      await updateCategory(id, {
        name: editName,
        color: editColor,
      });
      setEditingId(null);
      await refresh();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?'))
      return;

    try {
      await deleteCategory(id);
      await refresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const startEdit = (category: any) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize your videos with custom categories
            </p>
          </div>

          {/* Create new category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Category</h2>
              {!isCreating && (
                <Button
                  onClick={() => setIsCreating(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>

            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />

                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newCategoryColor === color
                          ? 'scale-125 ring-2 ring-offset-2 ring-gray-400'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreate} size="sm" className="gap-2">
                    <Check className="h-4 w-4" />
                    Create
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(false);
                      setNewCategoryName('');
                      setNewCategoryColor('#3B82F6');
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Categories list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Your Categories</h2>

            {categories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No categories yet. Create your first category above.
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map(category => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    {editingId === category.id ? (
                      <div className="flex-1 flex items-center gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          {colors.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditColor(color)}
                              className={`w-6 h-6 rounded-full transition-transform ${
                                editColor === color
                                  ? 'scale-125 ring-2 ring-offset-1 ring-gray-400'
                                  : ''
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <Button
                          onClick={() => handleUpdate(category.id)}
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <CategoryTag category={category} />
                          <span className="text-sm text-gray-500 dark:text-gray-400"></span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => startEdit(category)}
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(category.id)}
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
