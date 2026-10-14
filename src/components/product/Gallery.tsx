"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdirePattern } from "@/components/patterns/Patterns";
import { Tag } from "@/components/ui/Tag";
import { CloseIcon } from "@/components/chrome/Icons";
import { useDialog } from "@/components/chrome/useDialog";
import { pad2 } from "@/lib/format";
import { resolveProductTransition } from "@/lib/motion";
import type { IconKind } from "@/lib/product";
import type { ProductImage as Img } from "@/lib/types";
import { ProductImage } from "./ProductImage";

type Props = {
  slug: string;
  name: string;
  images: Img[];
  colourName: string | null;
  kind: IconKind;
  tag?: { label: string; dot: string } | null;
  /** Colour hex for the swatch-change wipe; key changes trigger the wipe */
  wipe: { key: number; hex: string };
};

const MAX = 8;

/** The 5th "cloth" panel: Adire Indigo with a white caption card. */
function ClothPanel({ index, total, compact }: { index: number; total: number; compact?: boolean }) {
  return (
    <div className={`gallery__cloth${compact ? " gallery__cloth--compact" : ""}`}>
      <AdirePattern className="tile__pattern" />
      <span className="gallery__cloth-card">
        <span className="mono-xs">
          {pad2(index)} / {pad2(total)} · THE CLOTH
        </span>
        The house cloth: Adire indigo, resist-dyed in Abeokuta.
      </span>
    </div>
  );
}

/** PDP-1: up to 8 images, zoom (lightbox with pan), swipe on mobile, Adire "cloth" panel last. */
export function Gallery({ slug, name, images, colourName, kind, tag, wipe }: Props) {
  const imgs = images.slice(0, MAX);
  const total = Math.max(imgs.length, 1) + 1;
  const [zoom, setZoom] = useState<number | null>(null);
  const [mIndex, setMIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resolveProductTransition();
  }, []);

  // reset the mobile carousel when the colour (and so the image set) changes
  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    setMIndex(0);
  }, [wipe.key]);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setMIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const label = (i: number) => {
    const alt = imgs[i]?.alt;
    if (i === 0) return `${pad2(1)} / ${pad2(total)} · ${(colourName ?? alt ?? "").toUpperCase()}`;
    return `${pad2(i + 1)} / ${pad2(total)}${alt ? ` · ${alt.toUpperCase()}` : ""}`;
  };
  const list = imgs.length ? imgs : [{ url: "", alt: name }];

  return (
    <>
      {/* Desktop grid */}
      <div className="gallery hide-mobile">
        {list.map((img, i) => (
          <button
            key={`${img.url}-${i}`}
            type="button"
            className={`gallery__cell${i === 0 ? " gallery__cell--hero" : ""}`}
            onClick={() => setZoom(i)}
            aria-label={`Zoom image ${i + 1} of ${list.length}: ${img.alt || name}`}
            style={i === 0 ? { viewTransitionName: `product-${slug}` } : undefined}
          >
            <ProductImage src={img.url} alt={img.alt || name} kind={kind} priority={i === 0} sizes={i === 0 ? "(max-width: 1200px) 60vw, 820px" : "(max-width: 1200px) 30vw, 410px"} iconSize={i === 0 ? 120 : 64} iconStroke={0.6} />
            <span className="gallery__label">{label(i)}</span>
            {i === 0 && <span key={wipe.key} className={`gallery__wipe${wipe.key ? " ap-wipe" : ""}`} style={{ background: wipe.hex }} aria-hidden />}
          </button>
        ))}
        <ClothPanel index={total} total={total} />
      </div>

      {/* Mobile swipe */}
      <div className="gallery-m show-mobile">
        <div className="gallery-m__track" ref={track} onScroll={onScroll} aria-label="Product images" role="region" tabIndex={0}>
          {list.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              className="gallery-m__slide"
              onClick={() => setZoom(i)}
              aria-label={`Zoom image ${i + 1}`}
              style={i === 0 ? { viewTransitionName: `product-${slug}` } : undefined}
            >
              <ProductImage src={img.url} alt={img.alt || name} kind={kind} priority={i === 0} sizes="100vw" iconSize={96} iconStroke={0.6} />
              {i === 0 && <span key={wipe.key} className={`gallery__wipe${wipe.key ? " ap-wipe" : ""}`} style={{ background: wipe.hex }} aria-hidden />}
            </button>
          ))}
          <div className="gallery-m__slide">
            <ClothPanel index={total} total={total} compact />
          </div>
        </div>
        <span className="gallery__label gallery-m__label">{mIndex < list.length ? label(mIndex) : `${pad2(total)} / ${pad2(total)} · THE CLOTH`}</span>
        {tag && <Tag label={tag.label} dot={tag.dot} className="gallery-m__tag" />}
        <div className="gallery-m__bars" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={i === mIndex ? "is-on" : ""} />
          ))}
        </div>
      </div>

      <Lightbox images={list} index={zoom} onIndex={setZoom} name={name} kind={kind} />
    </>
  );
}

function Lightbox({ images, index, onIndex, name, kind }: { images: Img[]; index: number | null; onIndex: (i: number | null) => void; name: string; kind: IconKind }) {
  const open = index !== null;
  const close = useCallback(() => onIndex(null), [onIndex]);
  const ref = useDialog(open, close);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex(((index ?? 0) + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex(((index ?? 0) - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, images.length, onIndex]);
  if (!open) return null;
  const img = images[index!];
  return (
    <div className="lightbox" ref={ref} role="dialog" aria-modal="true" aria-label={`${name} — image ${index! + 1} of ${images.length}`}>
      <div className="lightbox__bar">
        <span className="mono-label">
          {pad2(index! + 1)} / {pad2(images.length)} · {zoomed ? "CLICK TO ZOOM OUT" : "CLICK TO ZOOM"}
        </span>
        <button className="icon-btn" aria-label="Close" onClick={close} data-autofocus>
          <CloseIcon />
        </button>
      </div>
      <div
        className={`lightbox__stage${zoomed ? " is-zoomed" : ""}`}
        onClick={() => setZoomed((z) => !z)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <div className="lightbox__img" style={{ transformOrigin: origin }}>
          <ProductImage src={img.url} alt={img.alt || name} kind={kind} sizes="100vw" iconSize={200} iconStroke={0.5} />
        </div>
      </div>
      {images.length > 1 && (
        <div className="lightbox__nav">
          <button className="btn btn--ghost" onClick={() => onIndex((index! - 1 + images.length) % images.length)}>← Previous</button>
          <button className="btn btn--ghost" onClick={() => onIndex((index! + 1) % images.length)}>Next →</button>
        </div>
      )}
    </div>
  );
}
