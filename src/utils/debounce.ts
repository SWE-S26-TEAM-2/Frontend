/**
 * debounce — typed utility
 *
 * Returns a debounced version of `fn` that delays execution until `delayMs`
 * milliseconds have elapsed since the last call.
 *
 * Exposes `.cancel()` for useEffect cleanup — prevents state updates
 * on unmounted components.
 */

type AnyArgs = unknown[];

interface IDebouncedFn<T extends AnyArgs> {
  (...args: T): void;
  cancel: () => void;
}

export function debounce<T extends AnyArgs>(
  fn: (...args: T) => void,
  delayMs: number
): IDebouncedFn<T> {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: T): void => {
    if (timerId !== null) clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}
