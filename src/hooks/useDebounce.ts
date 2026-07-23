import { useState, useEffect } from "react";

/**
 * Custom hook to debounce dynamic state updates (FE-14.1).
 * Delays updating the returned value until after the specified delay timeout.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timer on unmount or when dependencies modify to prevent memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
