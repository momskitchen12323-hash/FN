import { useEffect, useRef, useState } from 'react';

/** Hides (nav bar / FAB) when scrolling down, shows again on scroll up. */
export function useScrollHide(ref: React.RefObject<HTMLElement | null>): boolean {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const top = el.scrollTop;
      const dy = top - last.current;
      last.current = top;
      if (top <= 8) setHidden(false);
      else if (dy > 10) setHidden(true);
      else if (dy < -10) setHidden(false);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [ref]);

  return hidden;
}

/** Preserves the scroll position per view key across route changes. */
const cache = new Map<string, number>();

export function useRestoredScroll(key: string, ref: React.RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const saved = cache.get(key);
    if (saved) el.scrollTop = saved;
    const onScroll = () => cache.set(key, el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [key, ref]);
}
