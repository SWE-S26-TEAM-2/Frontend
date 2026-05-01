/**
 * mutationQueue.ts
 *
 * A promise-based serial mutation queue.
 *
 * Problem it solves:
 *   When a user rapidly adds tracks, toggles like, or saves while a
 *   previous save is in-flight, concurrent API calls race and corrupt
 *   server state. This queue serialises every mutation so only one
 *   runs at a time.
 *
 * Usage:
 *   const queue = createMutationQueue()
 *   await queue.enqueue(async () => await api.addTrack(...))
 *   await queue.enqueue(async () => await api.removeTrack(...))
 *   // second call waits for first to finish
 *
 * Features:
 *   • Serial execution (FIFO)
 *   • Each operation is independently rejected/resolved
 *   • Queue never stalls on error — failed op is rejected, next runs
 *   • `drain()` returns a promise that resolves when queue is empty
 *   • `size` getter for UI pending indicators
 */

type MutationFn<T> = () => Promise<T>;

interface IQueueItem<T> {
  fn: MutationFn<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

export interface IMutationQueue {
  enqueue<T>(fn: MutationFn<T>): Promise<T>;
  drain(): Promise<void>;
  readonly size: number;
  readonly isRunning: boolean;
}

export function createMutationQueue(): IMutationQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: IQueueItem<any>[] = [];
  let running = false;
  let drainResolvers: Array<() => void> = [];

  async function processNext() {
    if (running || items.length === 0) return;
    running = true;

    const item = items.shift()!;
    try {
      const result = await item.fn();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      running = false;
      if (items.length > 0) {
        // Schedule next tick to avoid deep recursion on long queues
        setTimeout(processNext, 0);
      } else {
        // Notify drain() waiters
        drainResolvers.forEach((r) => r());
        drainResolvers = [];
      }
    }
  }

  return {
    enqueue<T>(fn: MutationFn<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        items.push({ fn, resolve, reject });
        processNext();
      });
    },

    drain(): Promise<void> {
      if (!running && items.length === 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        drainResolvers.push(resolve);
      });
    },

    get size() {
      return items.length + (running ? 1 : 0);
    },

    get isRunning() {
      return running;
    },
  };
}

/**
 * withRetry
 *
 * Wraps an async function with linear-backoff retry logic.
 * Use inside queue items for retryable operations (cover upload, track sync).
 *
 * @param fn          — async operation to retry
 * @param maxAttempts — total attempts (default 3)
 * @param delayMs     — base delay between attempts in ms (default 800)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 800,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastErr;
}
