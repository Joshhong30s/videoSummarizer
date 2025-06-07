'use client';

import { useEffect, useState, useCallback } from 'react';
import { Category } from '@/lib/types/database';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0); // Add version control

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch categories')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize and fetch categories on force update
  useEffect(() => {
    fetchCategories();
  }, [version, fetchCategories]);

  // Force update method
  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  // Add new category
  const addCategory = async (name: string, color?: string) => {
    try {
      console.log('Adding category:', { name, color });
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response error:', errorData);
        throw new Error(errorData.message || 'Failed to add category');
      }

      const data = await response.json();
      console.log('Category added successfully:', data);
      refresh(); // Force update
      return data;
    } catch (err) {
      console.error('Failed to add category:', err);
      if (err instanceof Error) {
        console.error('Add category error details:', err);
      }
      throw err instanceof Error ? err : new Error('Failed to add category');
    }
  };

  // Update category
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      console.log('Updating category:', { id, updates });
      const response = await fetch('/api/categories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response error:', errorData);
        throw new Error(errorData.message || 'Failed to update category');
      }

      const data = await response.json();
      console.log('Category updated successfully:', data);
      refresh(); // Force update
      return data;
    } catch (err) {
      console.error('Failed to update category:', err);
      throw err instanceof Error ? err : new Error('Failed to update category');
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      console.log('Preparing to delete category:', id);
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete category API error:', errorData);
        throw new Error(errorData.message || 'Failed to delete category');
      }

      console.log('Category deleted successfully');
      refresh(); // Force update
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err instanceof Error ? err : new Error('Failed to delete category');
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh, // Export refresh method
  };
}
