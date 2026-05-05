import type { IAdjustedHeader } from './types';

export function calculateFixedCardPosition(rect: DOMRect, cardHeight: number = 280) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let calculatedLeft = rect.left - 150;
  let calculatedTop = rect.bottom;

  if (calculatedLeft < 0) calculatedLeft = 10;
  if (calculatedLeft + 300 > viewportWidth) calculatedLeft = viewportWidth - 220;
  if (calculatedTop + cardHeight > viewportHeight) {
    calculatedTop = viewportHeight - cardHeight;
  }

  return { calculatedTop, calculatedLeft };
}

export function getObjKeyByValue(object: Record<string, string | number>, value: string | number) {
  return Object.keys(object).find((key) => object[key] === value);
}

/**
 * Menghitung lebar scrollbar pada elemen dengan ref yang diberikan.
 * dengan cara mengurangi offsetWidth dengan clientWidth.
 * Jika elemen tidak ada, kembalikan 0.
 */
export function getScrollbarWidth(ref: React.RefObject<HTMLDivElement | null>) {
  if (!ref.current) return 0;
  return ref.current.offsetWidth - ref.current.clientWidth;
}

export function calculateElementOverflow(rect: DOMRect, cardWidth: number, cardHeight: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const right = viewportWidth - (rect.left + cardWidth); // < 0 berarti overflow kanan
  const bottom = viewportHeight - (rect.top + cardHeight); // < 0 berarti overflow bawah
  const left = rect.left; // < 0 berarti overflow kiri
  const top = rect.top; // < 0 berarti overflow atas

  return { right, bottom, left, top };
}

// Fungsi untuk mencari child secara rekursif
export const findChildRecursive = (parent: IAdjustedHeader, targetChildKey: string): IAdjustedHeader | undefined => {
  // Cek children langsung
  const directChild = parent.children?.find((c) => c.key === targetChildKey);
  if (directChild) return directChild;

  // Jika tidak ditemukan, cari di children yang memiliki children (nested)
  return parent.children?.reduce<IAdjustedHeader | undefined>((found, child) => {
    if (found) return found;
    if (child.children?.length) {
      return findChildRecursive(child, targetChildKey);
    }
    return undefined;
  }, undefined);
};
