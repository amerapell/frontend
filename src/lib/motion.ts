/**
 * Production motion helpers (CardToProductV2.dc.html):
 *  - flyStarToBag: red four-point star on an arc from the Add button to the header bag pill
 *    (two nested elements: X linear, Y eased), resolves when it lands.
 *  - View Transitions card → PDP shared element, with an instant fallback.
 */

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)").matches;
}

const STAR_PATH = "M50 2 Q50 50 98 50 Q50 50 50 98 Q50 50 2 50 Q50 50 50 2Z";

function visibleBagPill(): HTMLElement | null {
  const pills = Array.from(document.querySelectorAll<HTMLElement>("[data-bag-pill]"));
  return pills.find((p) => {
    const r = p.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
  }) ?? pills.find((p) => p.getBoundingClientRect().width > 0) ?? null;
}

export function flyStarToBag(origin: HTMLElement, duration = 850): Promise<void> {
  if (typeof window === "undefined" || prefersReducedMotion()) return Promise.resolve();
  const target = visibleBagPill();
  if (!target || typeof (origin as HTMLElement).animate !== "function") return Promise.resolve();

  const o = origin.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const size = 28;
  const startX = o.left + o.width / 2 - size / 2;
  const startY = o.top + o.height / 2 - size / 2;
  const dx = t.left + t.width / 2 - size / 2 - startX;
  const dy = t.top + t.height / 2 - size / 2 - startY;
  const peak = Math.min(dy, 0) - Math.max(60, Math.abs(dy) * 0.1);

  const outer = document.createElement("div");
  outer.setAttribute("aria-hidden", "true");
  Object.assign(outer.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${size}px`,
    zIndex: "400",
    pointerEvents: "none",
  });
  outer.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><path d="${STAR_PATH}" fill="#d3262c"/></svg>`;
  const inner = outer.firstElementChild as SVGElement;
  document.body.appendChild(outer);

  const ax = outer.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], { duration, easing: "linear", fill: "forwards" });
  inner.animate(
    [
      { transform: "translateY(0) scale(1) rotate(0deg)" },
      { transform: `translateY(${peak}px) scale(1.3) rotate(180deg)`, offset: 0.55 },
      { transform: `translateY(${dy}px) scale(.3) rotate(360deg)` },
    ],
    { duration, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" },
  );
  return new Promise((resolve) => {
    const done = () => {
      outer.remove();
      resolve();
    };
    ax.onfinish = done;
    window.setTimeout(done, duration + 200);
  });
}

/* ---------------- View Transitions: card → product ---------------- */

type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

let pendingResolve: (() => void) | null = null;

/** Called by the PDP once its hero has mounted, so the new snapshot includes it. */
export function resolveProductTransition() {
  if (pendingResolve) {
    const r = pendingResolve;
    pendingResolve = null;
    // wait a frame so the hero image has its view-transition-name applied
    requestAnimationFrame(() => r());
  }
}

export function supportsViewTransitions() {
  return typeof document !== "undefined" && typeof (document as VTDocument).startViewTransition === "function" && !prefersReducedMotion();
}

/**
 * Starts a shared-element transition from `imageEl` to the PDP hero. `navigate` performs the
 * client navigation; the transition finishes when the PDP calls resolveProductTransition().
 */
export function startProductTransition(slug: string, imageEl: HTMLElement | null, navigate: () => void) {
  const doc = document as VTDocument;
  if (!supportsViewTransitions() || !imageEl) {
    navigate();
    return;
  }
  // only the clicked card carries the name, so it stays unique on the page
  imageEl.style.setProperty("view-transition-name", `product-${slug}`);
  doc.startViewTransition!(
    () =>
      new Promise<void>((resolve) => {
        pendingResolve = () => {
          resolve();
        };
        navigate();
        window.setTimeout(() => {
          if (pendingResolve) {
            pendingResolve = null;
            resolve();
          }
        }, 1500);
      }),
  ).finished.finally(() => {
    imageEl.style.removeProperty("view-transition-name");
  });
}
