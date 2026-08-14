export interface Result<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function tryAsync<T>(
  fn: () => Promise<T>,
  fallback?: (err: unknown) => string,
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    const message = fallback ? fallback(err) : (err as Error).message;
    return { ok: false, error: message };
  }
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 300,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  limit = 300,
): (...args: A) => void {
  let lastRun = 0;
  return (...args: A) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      lastRun = now;
      fn(...args);
    }
  };
}
