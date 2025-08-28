import { useState } from 'react';

export interface LoadingState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export const useLoadingState = (initialState = false): LoadingState => {
  const [loading, setLoading] = useState(initialState);

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      const result = await fn();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    withLoading,
  };
};