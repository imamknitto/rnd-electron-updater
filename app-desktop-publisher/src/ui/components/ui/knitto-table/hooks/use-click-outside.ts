import { useEffect } from 'react';

export default function useOnClickOutside(
  refs: React.RefObject<HTMLDivElement | HTMLElement | null>[],
  handler: (currentTarget?: HTMLElement | null, el?: HTMLDivElement | HTMLElement) => void
) {
  useEffect(() => {
    const safeRefs = Array.isArray(refs) ? refs : [];

    if (!safeRefs.some((ref) => ref.current)) return;

    function handleClickOutside(event: MouseEvent) {
      const isOutside = safeRefs.filter((ref) => ref.current).every((ref) => ref.current && !ref.current.contains(event.target as Node));
      if (isOutside) handler();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, handler]);
}
