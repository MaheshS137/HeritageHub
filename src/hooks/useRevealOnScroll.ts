import { useCallback, useEffect, useState } from 'react';

export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(threshold = 0.02) {
  const [element, setElement] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -10px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold]);

  return { ref, visible };
}

export function useAnimatedCounter(target: number, active: boolean, durationMs = 900) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setCount(target);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, active, durationMs]);

  return count;
}
