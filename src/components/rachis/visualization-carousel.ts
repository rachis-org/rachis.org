import { thumbnailGroups, wrapIndex, type GallerySlide } from '~/utils/visualization-gallery';
import { ThumbnailMotion } from './thumbnail-motion';

class VisualizationCarousel extends HTMLElement {
  private cleanup?: AbortController;
  private thumbnails?: Map<number, HTMLAnchorElement>;

  connectedCallback() {
    this.cleanup?.abort();
    this.cleanup = new AbortController();
    const { signal } = this.cleanup;
    const slides: Pick<GallerySlide, 'title' | 'desc' | 'viewUrl'>[] = JSON.parse(
      this.querySelector('[data-gallery-items]')!.textContent!
    );
    let active = Number(this.dataset.activeIndex);
    const viewer = this.querySelector<HTMLElement>('[data-gallery-viewer]')!;
    const frameTemplate = this.querySelector<HTMLTemplateElement>('[data-gallery-frame]')!;
    const frame = frameTemplate.content.querySelector('iframe')!.cloneNode(true) as HTMLIFrameElement;
    const title = this.querySelector<HTMLElement>('[data-gallery-title]')!;
    const description = this.querySelector<HTMLElement>('[data-gallery-description]')!;
    const count = this.querySelector<HTMLElement>('[data-gallery-count]')!;
    const open = this.querySelector<HTMLAnchorElement>('[data-gallery-open]')!;
    const left = this.querySelector<HTMLElement>('[data-gallery-left]')!;
    const right = this.querySelector<HTMLElement>('[data-gallery-right]')!;
    const mobileGrid = this.querySelector<HTMLElement>('[data-gallery-mobile]')!;
    const mobile = window.matchMedia('(max-width: 767px)');
    if (!this.thumbnails) {
      this.thumbnails = new Map(
        Array.from(this.querySelectorAll<HTMLAnchorElement>('[data-gallery-index]')).map((button) => [
          Number(button.dataset.galleryIndex),
          button,
        ])
      );
    }
    const buttons = this.thumbnails;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = new ThumbnailMotion(this, buttons, reducedMotion);
    signal.addEventListener('abort', () => motion.dispose(), { once: true });
    reducedMotion.addEventListener('change', () => motion.cancel(), { signal });
    window.addEventListener('resize', () => motion.cancel(), { signal });
    // Screen-edge clipping must also keep fully hidden thumbnails out of the tab order.
    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          (entry.target as HTMLAnchorElement).tabIndex = mobile.matches || entry.isIntersecting ? 0 : -1;
      },
      { root: this.closest('figure') }
    );
    for (const button of buttons.values()) visibility.observe(button);
    signal.addEventListener('abort', () => visibility.disconnect(), { once: true });

    const updateRails = () => {
      const groups = thumbnailGroups(active, slides.length);
      for (const [rail, indices] of [
        [left, groups.left],
        [right, groups.right],
      ] as const) {
        const columns = Math.max(1, Math.ceil(indices.length / 2));
        rail.style.setProperty('--gallery-columns', String(columns));
        rail.replaceChildren(
          ...indices.map((index, position) => {
            const button = buttons.get(index)!;
            // An incomplete left row stays against the viewer, with its gap at the outer edge.
            button.style.setProperty(
              '--gallery-column',
              rail === left && indices.length % 2 === 1 && position === columns ? '2' : 'auto'
            );
            return button;
          })
        );
      }
    };

    const select = (index: number, focusTitle = false) => {
      const next = wrapIndex(index, slides.length);
      if (next === active) return;
      const first = motion.capture();
      const previous = active;
      const direction = Math.sign(index - active);
      active = next;
      this.dataset.activeIndex = String(active);
      const slide = slides[active];
      title.textContent = slide.title;
      description.textContent = slide.desc;
      count.textContent = `${active + 1} / ${slides.length}`;
      open.href = slide.viewUrl;
      if (mobile.matches) {
        mobileGrid.replaceChildren(buttons.get(active)!);
      } else {
        // Reuse one iframe instead of leaving hidden visualization downloads running.
        viewer.setAttribute('aria-busy', 'true');
        frame.title = slide.title;
        frame.src = slide.viewUrl;
        updateRails();
      }
      if (focusTitle) {
        title.focus({ preventScroll: true });
        (mobile.matches ? mobileGrid : viewer).scrollIntoView({ block: 'start' });
      }
      motion.play(first, previous, active, direction, mobile.matches, viewer);
    };

    const syncLayout = () => {
      motion.cancel();
      this.dataset.mode = mobile.matches ? 'mobile' : 'desktop';
      this.setAttribute('aria-roledescription', 'carousel');
      for (const control of this.querySelectorAll('[data-gallery-direction]'))
        control.setAttribute('aria-controls', mobile.matches ? mobileGrid.id : viewer.id);
      for (const button of buttons.values()) {
        button.setAttribute(
          'aria-label',
          (mobile.matches ? button.dataset.galleryOpenLabel : button.dataset.gallerySelectLabel)!
        );
        if (mobile.matches) {
          button.removeAttribute('role');
          button.tabIndex = 0;
        } else button.setAttribute('role', 'button');
      }
      if (mobile.matches) {
        // Remove the document entirely so phones never download a hidden visualization.
        viewer.replaceChildren();
        frame.removeAttribute('src');
        viewer.setAttribute('aria-busy', 'false');
        left.replaceChildren();
        right.replaceChildren();
        mobileGrid.replaceChildren(buttons.get(active)!);
      } else {
        mobileGrid.replaceChildren();
        updateRails();
        viewer.setAttribute('aria-busy', 'true');
        frame.title = slides[active].title;
        viewer.replaceChildren(frame);
        frame.src = slides[active].viewUrl;
      }
    };

    frame.addEventListener('load', () => viewer.setAttribute('aria-busy', 'false'), { signal });
    mobile.addEventListener('change', syncLayout, { signal });
    syncLayout();
    this.addEventListener(
      'click',
      (event) => {
        const button = (event.target as Element).closest<HTMLElement>('[data-gallery-index], [data-gallery-direction]');
        if (!button || !this.contains(button)) return;
        if (button.dataset.galleryIndex !== undefined) {
          if (mobile.matches) return;
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          select(Number(button.dataset.galleryIndex), true);
        } else if (button.dataset.galleryDirection) select(active + Number(button.dataset.galleryDirection));
      },
      { signal }
    );
    this.addEventListener(
      'keydown',
      (event) => {
        if (!(event.target instanceof Element)) return;
        const control = event.target.closest<HTMLElement>('[data-gallery-index], [data-gallery-direction]');
        if (!control) return;
        if (!mobile.matches && event.key === ' ' && control.dataset.galleryIndex !== undefined) {
          event.preventDefault();
          select(Number(control.dataset.galleryIndex), true);
          return;
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        select(active + (event.key === 'ArrowRight' ? 1 : -1), control.hasAttribute('data-gallery-index'));
      },
      { signal }
    );
  }

  disconnectedCallback() {
    this.cleanup?.abort();
  }
}

if (!customElements.get('visualization-carousel'))
  customElements.define('visualization-carousel', VisualizationCarousel);
