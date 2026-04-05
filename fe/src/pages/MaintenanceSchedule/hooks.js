import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Custom hook for debounced values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for async operations with cleanup
export const useAsyncOperation = () => {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeAsyncOperation = useCallback(async (asyncOperation) => {
    if (!mountedRef.current) return null;
    
    try {
      const result = await asyncOperation();
      return mountedRef.current ? result : null;
    } catch (error) {
      if (mountedRef.current) {
        throw error;
      }
      return null;
    }
  }, []);

  return safeAsyncOperation;
};

// Custom hook for API error handling
export const useApiErrorHandler = () => {
  const handleError = useCallback((error, fallbackMessage = 'Terjadi kesalahan') => {
    console.error('API Error:', error);
    
    // You can integrate with your notification system here
    if (error?.response?.data?.message) {
      return error.response.data.message;
    } else if (error?.message) {
      return error.message;
    }
    return fallbackMessage;
  }, []);

  return handleError;
};
