export interface GallerySlide {
  id: string;
  title: string;
  desc: string;
  href: string;
  thumbnail: string;
  viewUrl: string;
  attribution?: { text: string; href: string };
}

export function wrapIndex(index: number, count: number): number {
  return count > 0 ? ((index % count) + count) % count : 0;
}

export function thumbnailGroups(active: number, count: number): { left: number[]; right: number[] } {
  const remaining = Math.max(0, count - 1);
  const leftCount = Math.floor(remaining / 2);
  return {
    left: Array.from({ length: leftCount }, (_, index) => wrapIndex(active - leftCount + index, count)),
    right: Array.from({ length: remaining - leftCount }, (_, index) => wrapIndex(active + index + 1, count)),
  };
}
