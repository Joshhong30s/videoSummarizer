import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce hook', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  test('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 499ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(499);
    });
    
    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast-forward time by 1ms more (total 500ms)
    act(() => {
      jest.advanceTimersByTime(1);
    });
    
    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  test('should reset debounce timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // First update
    rerender({ value: 'update1', delay: 500 });
    
    // Wait 400ms
    act(() => {
      jest.advanceTimersByTime(400);
    });
    
    // Second update (should reset timer)
    rerender({ value: 'update2', delay: 500 });
    
    // Wait another 400ms (total 800ms from first update, 400ms from second)
    act(() => {
      jest.advanceTimersByTime(400);
    });
    
    // Value should still be initial because timer was reset
    expect(result.current).toBe('initial');
    
    // Wait 100ms more (500ms from second update)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Now should have the second update
    expect(result.current).toBe('update2');
  });

  test('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 }
      }
    );

    rerender({ value: 'updated', delay: 1000 });
    
    // Wait 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('initial');
    
    // Change delay while waiting
    rerender({ value: 'updated', delay: 200 });
    
    // Wait 200ms more (should trigger with new delay)
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe('updated');
  });

  test('should work with different data types', () => {
    // Test with numbers
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 300 }
      }
    );

    numberRerender({ value: 42, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(numberResult.current).toBe(42);

    // Test with objects
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: { id: 1 }, delay: 300 }
      }
    );

    const newObject = { id: 2, name: 'test' };
    objectRerender({ value: newObject, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(objectResult.current).toEqual(newObject);

    // Test with arrays
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: [1, 2, 3], delay: 300 }
      }
    );

    const newArray = [4, 5, 6];
    arrayRerender({ value: newArray, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(arrayResult.current).toEqual(newArray);
  });

  test('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    );

    rerender({ value: 'updated', delay: 0 });
    
    // With zero delay, should update immediately in next tick
    act(() => {
      jest.advanceTimersByTime(0);
    });
    
    expect(result.current).toBe('updated');
  });

  test('should cleanup timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    rerender({ value: 'updated', delay: 500 });
    
    // Unmount before timer completes
    unmount();
    
    // Advance timers - should not cause any issues
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // This test mainly ensures no memory leaks or errors occur
    expect(true).toBe(true);
  });

  test('should handle multiple rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'value0', delay: 200 }
      }
    );

    // Simulate rapid typing
    const values = ['value1', 'value2', 'value3', 'value4', 'value5'];
    
    values.forEach((value, index) => {
      rerender({ value, delay: 200 });
      
      // Wait a short time between updates
      act(() => {
        jest.advanceTimersByTime(50);
      });
    });

    // Value should still be initial because timer keeps resetting
    expect(result.current).toBe('value0');
    
    // Wait for the full delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Should now have the last value
    expect(result.current).toBe('value5');
  });

  test('should work correctly with boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: false, delay: 300 }
      }
    );

    expect(result.current).toBe(false);

    rerender({ value: true, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe(true);

    rerender({ value: false, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe(false);
  });
});