"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdirePattern, FourPointStar } from "@/components/patterns/Patterns";
import { ChatIcon, ChevronDownLg, ChevronUp, CloseIcon, HeartIcon } from "@/components/chrome/Icons";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { useWishlist } from "@/context/WishlistContext";
import { naira, upper } from "@/lib/format";
import { categoryOf, productUrl, whatsappLink } from "@/lib/product";
import type { Product } from "@/lib/types";

const TONES = [
  { base: "#1e3172", tone: "#22357a", ink: "#e7eaf4", dark: true, pattern: false },
  { base: "#0b1c4f", tone: "#0b1c4f", ink: "#ffffff", dark: true, pattern: true },
  { base: "#f2f2ef", tone: "#ecebe6", ink: "#6a6b75", dark: false, pattern: false },
];

const isVideo = (u: string) => /\.(mp4|webm|mov)(\?|$)/i.test(u);

/**
 * Shop the reel (ShopTheReelV2): vertical full-screen looks, progress bars, side actions,
 * frosted product panel with size grid + add to bag + burst + toast; swipe/wheel/arrow nav.
 */
export function ShopTheReel({ looks }: { looks: Product[] }) {
  const router = useRouter();
  const { add, count, busy } = useCart();
  const { settings } = useSettings();
  const { has, toggle } = useWishlist();
  const [i, setI] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [burst, setBurst] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const lastWheel = useRef(0);
  const touchY = useRef<number | null>(null);
  const n = looks.length;

  const go = useCallback(
    (d: number) => {
      setI((cur) => {
        const next = Math.max(0, Math.min(n - 1, cur + d));
        if (next !== cur) {
          setSize(null);
          setToast(null);
          setBurst(false);
        }
        return next;
      });
    },
    [n],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "j"].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowUp", "PageUp", "k"].includes(e.key)) { e.preventDefault(); go(-1); }
      if (e.key === "Escape") router.push("/");
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, router]);

  if (!n) {
    return (
      <div className="reel reel--empty">
        <p className="serif">No looks <em>yet.</em></p>
        <Link href="/" className="ap-link">Back to the store</Link>
      </div>
    );
  }

  const cur = looks[i];
  const tone = TONES[i % TONES.length];
  const sizes = cur.options.sizes;
  const needsSize = sizes.length > 0;
  const chosen = needsSize ? size : "One size";
  const variant = cur.variants.find((v) => (needsSize ? v.size === size : true) && v.available > 0);
  const ready = !!chosen && !!variant;
  const saved = has(cur.id);

  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheel.current < 800 || Math.abs(e.deltaY) < 20) return;
    lastWheel.current = now;
    go(e.deltaY > 0 ? 1 : -1);
  };

  const onAdd = async () => {
    if (!ready || busy) return;
    setBurst(true);
    const ok = await add(variant!.id, 1, { silent: true, label: cur.name });
    window.setTimeout(() => {
      setBurst(false);
      if (ok) setToast(`Added · ${cur.name}${needsSize ? `, ${size}` : ""}`);
    }, 650);
  };

  return (
    <div
      className="reel"
      onWheel={onWheel}
      onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (touchY.current == null) return;
        const dy = touchY.current - e.changedTouches[0].clientY;
        touchY.current = null;
        if (Math.abs(dy) > 50) go(dy > 0 ? 1 : -1);
      }}
      aria-roledescription="carousel"
      aria-label="Shop the reel"
    >
      <div className="reel__frame">
        <div className="reel__track" style={{ transform: `translateY(${-i * 100}%)` }}>
          {looks.map((p, k) => {
            const t = TONES[k % TONES.length];
            const media = p.images.find((m) => m.url)?.url;
            return (
              <div key={p.id} className="reel__look" style={{ background: t.base }} aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`Look ${k + 1} of ${n}: ${p.name}`}>
                <div className="reel__media ap-kb" style={{ background: t.tone }}>
                  {media ? (
                    isVideo(media) ? (
                      <video src={media} autoPlay={k === i} muted loop playsInline className="reel__video" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media} alt={p.images[0]?.alt || p.name} className="reel__video" loading={k === 0 ? "eager" : "lazy"} />
                    )
                  ) : (
                    <>
                      {t.pattern && <AdirePattern tile={120} className="tile__pattern" />}
                      <span className="reel__label" style={{ color: t.ink }}>[{upper(p.name)}]</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="reel__bars" aria-hidden>
          {looks.map((p, k) => (
            <div key={p.id} className="reel__bar">
              <div
                key={`${k}-${i}`}
                className={k === i && !paused && !size ? "ap-fill" : ""}
                style={{ transform: `scaleX(${k < i ? 1 : 0})` }}
                onAnimationEnd={() => k === i && i < n - 1 && !size && go(1)}
              />
            </div>
          ))}
        </div>

        <div className="reel__chrome" style={{ color: tone.dark ? "#ffffff" : "#0a0a0f" }}>
          <Link href="/" className="serif reel__mark" style={{ color: "inherit" }}>Amerapelle</Link>
          <span className="row gap-2">
            <Link href="/bag" className="mono-xs reel__bag" style={{ color: "inherit" }} data-bag-pill>BAG {count}</Link>
            <button type="button" className="icon-btn" aria-label="Close" style={{ color: "inherit" }} onClick={() => router.push("/")}>
              <CloseIcon />
            </button>
          </span>
        </div>

        <div className="reel__side">
          <button type="button" className="reel__fab" aria-label="Previous look" onClick={() => go(-1)} disabled={i === 0}><ChevronUp /></button>
          <button type="button" className={`reel__fab${saved ? " is-on" : ""}`} aria-label={saved ? "Remove from saved" : "Save"} aria-pressed={saved} onClick={() => toggle(cur)}><HeartIcon width={18} height={18} filled={saved} /></button>
          <a className="reel__fab" aria-label="Ask a stylist on WhatsApp" href={whatsappLink(settings.whatsappNumber, `Hi Amerapelle, I'd like styling advice on the ${cur.name}: ${productUrl(cur.slug)}`)} target="_blank" rel="noopener noreferrer"><ChatIcon /></a>
          <button type="button" className="reel__fab" aria-label="Next look" onClick={() => go(1)} disabled={i === n - 1}><ChevronDownLg /></button>
        </div>

        <div className="reel__panel" onFocus={() => setPaused(true)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="reel__meta">
            <span>{upper(cur.number)}{categoryOf(cur.material) ? ` — ${upper(categoryOf(cur.material))}` : ""}</span>
            <span>LOOK {i + 1} / {n}</span>
          </div>
          <div className="reel__titlerow">
            <h1 className="serif reel__title">
              <Link href={`/p/${cur.slug}`}>{cur.name}</Link>
            </h1>
            <span className="tnum reel__price">{naira(cur.priceKobo)}</span>
          </div>
          {needsSize && (
            <div className="reel__sizes" role="radiogroup" aria-label="Size">
              {sizes.slice(0, 4).map((s) => {
                const out = !cur.variants.some((v) => v.size === s && v.available > 0);
                return (
                  <button key={s} type="button" role="radio" aria-checked={size === s} disabled={out} aria-label={out ? `${s}, sold out` : s} className={`size-cell${size === s ? " is-on" : ""}${out ? " is-out" : ""}`} onClick={() => { setSize(s); setToast(null); }}>
                    {s}
                  </button>
                );
              })}
            </div>
          )}
          <div className="reel__addwrap">
            <button type="button" className="btn btn--block reel__add" disabled={!ready || busy} onClick={onAdd}>
              <span>{ready ? "Add to bag" : needsSize ? "Pick a size" : "Sold out"}</span>
              <span aria-hidden>→</span>
            </button>
            {burst && <FourPointStar size={56} className="ap-burst reel__burst" />}
          </div>
          {toast && (
            <div className="reel__toast ap-toast" role="status">
              <span>{toast}</span>
              <Link href="/bag" className="reel__viewbag">View bag</Link>
            </div>
          )}
          {i < n - 1 && !toast && <span className="mono-xs ap-hint reel__hint">SWIPE UP · NEXT LOOK</span>}
        </div>
      </div>
    </div>
  );
}
