'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import { Category } from '@/lib/types/database';
import { GUEST_USER_ID } from '@/lib/supabase';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  addCategory: (name: string, color?: string) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refresh: () => void;
}

const defaultCategory: Category = {
  id: '',
  name: '',
  color: '#2563eb',
  created_at: '',
};

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  loading: false,
  error: null,
  addCategory: async () => ({ ...defaultCategory }),
  updateCategory: async () => ({ ...defaultCategory }),
  deleteCategory: async () => {},
  refresh: () => {},
});

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);
  const { data: session } = useSession();

  const fetchCategories = useCallback(async () => {
    try {
      const userId = session?.user?.id || GUEST_USER_ID;
      const response = await fetch(`/api/categories?userId=${userId}`);
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
  }, [session?.user?.id]);

  useEffect(() => {
    fetchCategories();
  }, [version, fetchCategories]);

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

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
        throw new Error(errorData.message || 'Failed to add category');
      }

      const data = await response.json();
      refresh();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add category');
    }
  };

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
        throw new Error(errorData.message || 'Failed to update category');
      }

      const data = await response.json();
      refresh();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      console.log('Deleting category:', id);
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
        throw new Error(errorData.message || 'Failed to delete category');
      }

      refresh();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete category');
    }
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        refresh,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
};
