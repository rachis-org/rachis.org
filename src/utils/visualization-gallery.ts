export interface GallerySlide {
  id: string;
  title: string;
  desc: string;
  href: string;
  thumbnail: string;
  viewUrl: string;
}

export function wrapIndex(index: number, count: number): number {
  return count > 0 ? ((index % count) + count) % count : 0;
}

export function thumbnailGroups(active: number, count: number): { left: number[]; right: number[] } {
  const remaining = Math.max(0, count - 1);
  const leftCount = Math.floor(remaining / 2);
  // Keep two rows as the catalog grows, extending outward into the margins.
  // Neighbors sit beside the viewer and follow a clockwise path around it.
  const rows = (indices: number[], reverseFirst: boolean) => {
    const columns = Math.ceil(indices.length / 2);
    const top = indices.slice(0, columns);
    const bottom = indices.slice(columns);
    return reverseFirst ? [...top.reverse(), ...bottom] : [...top, ...bottom.reverse()];
  };
  return {
    left: rows(
      Array.from({ length: leftCount }, (_, index) => wrapIndex(active - index - 1, count)),
      true
    ),
    right: rows(
      Array.from({ length: remaining - leftCount }, (_, index) => wrapIndex(active + index + 1, count)),
      false
    ),
  };
}
