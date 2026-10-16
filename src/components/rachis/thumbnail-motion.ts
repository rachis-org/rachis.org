type Bounds = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> & { opacity?: number };
type Positions = Map<HTMLAnchorElement, Bounds>;
type Motion = { ghost: HTMLAnchorElement; animation: Animation };

/** FLIP in a common overlay lets thumbnails travel between clipped side grids. */
export class ThumbnailMotion {
  private running = new Map<HTMLAnchorElement, Motion>();
  private layer: HTMLDivElement;

  constructor(
    private root: HTMLElement,
    private thumbnails: Map<number, HTMLAnchorElement>,
    private reducedMotion: MediaQueryList
  ) {
    this.layer = document.createElement('div');
    this.layer.setAttribute('aria-hidden', 'true');
    this.layer.inert = true;
    this.layer.dataset.galleryMotionLayer = '';
    Object.assign(this.layer.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      overflow: 'clip',
      zIndex: '2',
    });
    root.append(this.layer);
  }

  capture(): Positions {
    const positions: Positions = new Map();
    for (const thumbnail of this.thumbnails.values()) {
      // Rapid navigation starts from the position currently visible on screen.
      const visible = this.running.get(thumbnail)?.ghost ?? thumbnail;
      if (visible.isConnected) {
        const { left, top, width, height } = visible.getBoundingClientRect();
        positions.set(thumbnail, { left, top, width, height, opacity: Number(getComputedStyle(visible).opacity) });
      }
    }
    return positions;
  }

  play(first: Positions, previous: number, active: number, direction: number, mobile: boolean, viewer: HTMLElement) {
    this.cancel();
    if (this.reducedMotion.matches) return;
    const last = this.capture();
    const root = this.root.getBoundingClientRect();
    const viewport = viewer.getBoundingClientRect();
    // Keep the viewer and its caption clear while cards travel between rails.
    const leftEdge = viewport.left - root.left;
    const rightEdge = viewport.right - root.left;
    const mask = mobile
      ? 'none'
      : `linear-gradient(to right, #000 0px, #000 ${leftEdge}px, transparent ${leftEdge}px, transparent ${rightEdge}px, #000 ${rightEdge}px, #000 100%)`;
    this.layer.style.maskImage = mask;
    this.layer.style.setProperty('-webkit-mask-image', mask);
    const center = (size: Bounds): Bounds => ({
      left: viewport.left + (viewport.width - size.width) / 2,
      top: viewport.top + (viewport.height - size.height) / 2,
      width: size.width,
      height: size.height,
    });
    const visible = (box: Bounds) =>
      box.left < root.right &&
      box.left + box.width > root.left &&
      box.top < root.bottom &&
      box.top + box.height > root.top;

    for (const [index, thumbnail] of this.thumbnails) {
      let from = first.get(thumbnail);
      let to = last.get(thumbnail);
      const entering = !from && !!to;
      const leaving = !!from && !to;
      if (!from && !to) continue;
      if (mobile) {
        if (entering) from = { ...to!, left: to!.left + direction * (to!.width + 16) };
        if (leaving) to = { ...from!, left: from!.left - direction * (from!.width + 16) };
      } else {
        if (entering && index === previous) from = center(to!);
        if (leaving && index === active) to = center(from!);
      }
      if (!from || !to || !from.width || !to.width || !from.height || !to.height) continue;
      // A card wrapping between two off-screen positions need not cross the viewer.
      if (!visible(from) && !visible(to)) continue;
      if (!entering && !leaving && from.left === to.left && from.top === to.top) continue;

      const ghost = thumbnail.cloneNode(true) as HTMLAnchorElement;
      ghost.removeAttribute('href');
      ghost.removeAttribute('data-gallery-index');
      ghost.removeAttribute('title');
      ghost.tabIndex = -1;
      ghost.dataset.galleryMotion = String(index);
      Object.assign(ghost.style, {
        position: 'absolute',
        left: `${to.left - root.left}px`,
        top: `${to.top - root.top}px`,
        width: `${to.width}px`,
        height: `${to.height}px`,
        margin: '0',
        opacity: '1',
        transformOrigin: 'top left',
      });
      this.layer.append(ghost);
      thumbnail.style.opacity = '0';
      const animation = ghost.animate(
        [
          {
            transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`,
            opacity: entering ? 0 : (from.opacity ?? 1),
          },
          { transform: 'none', opacity: leaving ? 0 : 1 },
        ],
        { duration: mobile ? 300 : 480, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
      );
      const motion = { ghost, animation };
      this.running.set(thumbnail, motion);
      animation.onfinish = () => {
        if (this.running.get(thumbnail) !== motion) return;
        ghost.remove();
        thumbnail.style.removeProperty('opacity');
        this.running.delete(thumbnail);
      };
    }
  }

  cancel() {
    for (const [thumbnail, { ghost, animation }] of this.running) {
      animation.cancel();
      ghost.remove();
      thumbnail.style.removeProperty('opacity');
    }
    this.running.clear();
  }

  dispose() {
    this.cancel();
    this.layer.remove();
  }
}
