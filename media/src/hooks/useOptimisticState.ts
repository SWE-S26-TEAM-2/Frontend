"use client";

/**
 * useOptimisticState.ts
 *
 * Generic hook that wraps a piece of state with optimistic update semantics:
 *
 *   1. Apply the mutation to local state immediately (optimistic)
 *   2. Execute the async operation
 *   3a. On success — keep the optimistic state
 *   3b. On failure — rollback to pre-mutation snapshot + surface error
 *
 * Powers: track list mutations, like toggle, metadata edits.
 */

import { useState, useCallback, useRef, useLayoutEffect } from "react";

export interface IOptimisticMutateOptions {
  skipRollbackOnError?: boolean;
}

export interface IUseOptimisticStateReturn<T> {
  state: T;
  isMutating: boolean;
  error: string | null;
  clearError: () => void;
  mutate(
    optimisticUpdater: (prev: T) => T,
    asyncOp: () => Promise<void>,
    options?: IOptimisticMutateOptions,
  ): Promise<boolean>;
  forceSet(value: T | ((prev: T) => T)): void;
}

export function useOptimisticState<T>(initial: T): IUseOptimisticStateReturn<T> {
  const [state, setState] = useState<T>(initial);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateRef = useRef<T>(initial);
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  const mutate = useCallback(
    async (
      optimisticUpdater: (prev: T) => T,
      asyncOp: () => Promise<void>,
      options: IOptimisticMutateOptions = {},
    ): Promise<boolean> => {
      const snapshot = stateRef.current;
      setState((prev) => optimisticUpdater(prev));
      setIsMutating(true);
      setError(null);

      try {
        await asyncOp();
        setIsMutating(false);
        return true;
      } catch (err) {
        setIsMutating(false);
        if (!options.skipRollbackOnError) {
          setState(snapshot);
        }
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        return false;
      }
    },
    [],
  );

  const forceSet = useCallback((value: T | ((prev: T) => T)) => {
    if (typeof value === "function") {
      setState(value as (prev: T) => T);
    } else {
      setState(value);
      stateRef.current = value;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { state, isMutating, error, clearError, mutate, forceSet };
}
