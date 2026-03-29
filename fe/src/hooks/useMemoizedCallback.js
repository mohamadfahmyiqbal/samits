import { useCallback, useMemo } from 'react';

export function useMemoizedCallback(fn, deps) {
  return useCallback(fn, deps);
}

export function useMemoizedValue(factory, deps) {
  return useMemo(factory, deps);
}
