import { useEffect, useState } from 'react';

export function useCountdown(targetMs: number | null, onComplete?: () => void): number {
  const [remaining, setRemaining] = useState<number>(() =>
    targetMs ? Math.max(0, targetMs - Date.now()) : 0,
  );

  useEffect(() => {
    if (!targetMs) return;
    const tick = () => {
      const rem = Math.max(0, targetMs - Date.now());
      setRemaining(rem);
      if (rem === 0) onComplete?.();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetMs, onComplete]);

  return remaining;
}

export function useCountdownTotal(durationMs: number, active: boolean, onComplete?: () => void): number {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const rem = Math.max(0, durationMs - (Date.now() - start));
      setRemaining(rem);
      if (rem === 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [durationMs, active, onComplete]);

  return remaining;
}
