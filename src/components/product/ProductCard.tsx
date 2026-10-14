"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { HeartIcon } from "@/components/chrome/Icons";
import { Tag } from "@/components/ui/Tag";
import { WasPrice } from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { naira } from "@/lib/format";
import { iconKind, tagFor } from "@/lib/product";
import { startProductTransition } from "@/lib/motion";
import type { Product, ProductCard as Card } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { loadProduct } from "./quickAddCache";

/** Frosted QUICK ADD size strip — loads variants lazily on first hover/focus. */
function QuickAdd({ slug, name }: { slug: string; name: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [err, setErr] = useState(false);
  const { add, busy } = useCart();
  const started = useRef(false);

  const ensure = () => {
    if (started.current) return;
    started.current = true;
    loadProduct(slug).then(setProduct).catch(() => setErr(true));
  };

  const sizes = product?.options.sizes ?? [];
  const availFor = (s: string) => product!.variants.filter((v) => v.size === s).reduce((n, v) => n + v.available, 0);
  const addSize = (s: string | null, el: HTMLElement) => {
    if (!product) return;
    const v = product.variants.find((x) => (s ? x.size === s : true) && x.available > 0);
    if (v) void add(v.id, 1, { origin: el, label: name });
  };

  return (
    <div className="card__quick" onMouseEnter={ensure} onFocus={ensure}>
      <span className="mono-xs">QUICK ADD</span>
      <span className="card__quick-sizes">
        {!product && !err && <span className="mono-xs" aria-live="polite">…</span>}
        {err && <span className="mono-xs">Unavailable</span>}
        {product && sizes.length === 0 && (
          <button type="button" className="qa-size qa-size--wide" disabled={busy || !product.inStock} onClick={(e) => addSize(null, e.currentTarget)} aria-label={`Add ${name} to bag`}>
            Add +
          </button>
        )}
        {product &&
          sizes.slice(0, 6).map((s) => {
            const out = availFor(s) <= 0;
            return (
              <button key={s} type="button" className={`qa-size${out ? " is-out" : ""}`} disabled={out || busy} onClick={(e) => addSize(s, e.currentTarget)} aria-label={out ? `${s}, sold out` : `Add ${name} in ${s}`}>
                {s}
              </button>
            );
          })}
      </span>
    </div>
  );
}

export function ProductCard({ product: p, priority, sizes }: { product: Card; priority?: boolean; sizes?: string }) {
  const router = useRouter();
  const media = useRef<HTMLDivElement>(null);
  const tag = tagFor(p);
  const sale = p.compareAtKobo != null && p.compareAtKobo > p.priceKobo;
  const { has, toggle } = useWishlist();
  const saved = has(p.id);
  const href = `/p/${p.slug}`;
  const kind = iconKind(p);
  const second = p.images[1]?.url;

  const onNav = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    startProductTransition(p.slug, media.current, () => router.push(href));
  };

  return (
    <article className={`card${tag?.soldOut ? " is-out" : ""}`} onMouseEnter={() => p.inStock && loadProduct(p.slug).catch(() => {})}>
      <div className="card__mediawrap">
        <Link href={href} className="card__media" onClick={onNav} tabIndex={-1} aria-hidden>
          <div ref={media} className="card__img">
            <ProductImage src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} kind={kind} priority={priority} sizes={sizes} />
          </div>
          {second && (
            <div className="card__img card__img--second">
              <ProductImage src={second} alt="" kind={kind} sizes={sizes} />
            </div>
          )}
          <span className="card__no">{p.number}</span>
          {tag && <Tag label={tag.label} dot={tag.dot} className="card__tag" />}
        </Link>
        <button type="button" className={`card__save${saved ? " is-on" : ""}`} aria-label={saved ? `Remove ${p.name} from saved` : `Save ${p.name}`} aria-pressed={saved} onClick={() => toggle(p)}>
          <HeartIcon filled={saved} />
        </button>
        {p.inStock && <QuickAdd slug={p.slug} name={p.name} />}
      </div>
      <Link href={href} className="card__info" onClick={onNav}>
        <span className="card__row">
          <span className="card__name">{p.name}</span>
          <span className={`card__price tnum${sale ? " red" : ""}`}>
            {sale && <span className="sr-only">Sale price </span>}
            {naira(p.priceKobo)}
          </span>
        </span>
        <span className="card__row card__row--meta">
          <span className="meta">{p.material}</span>
          <span className="card__dots">
            {p.colours.slice(0, 4).map((c) => (
              <span key={c.name} className="dot10" style={{ background: c.hex }} title={c.name}>
                <span className="sr-only">{c.name}</span>
              </span>
            ))}
            {sale && <WasPrice kobo={p.compareAtKobo!} />}
          </span>
        </span>
        {tag?.soldOut && <span className="sr-only">Sold out</span>}
      </Link>
    </article>
  );
}

/** Lighter card used by "Complete the look" (no tags/quick add — per ProductV2). */
export function LookCard({ product: p }: { product: Card }) {
  return (
    <Link href={`/p/${p.slug}`} className="look-card">
      <div className="look-card__img">
        <ProductImage src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} kind={iconKind(p)} iconSize={48} />
        <span className="card__no">{p.number}</span>
      </div>
      <span className="card__row">
        <span className="card__name">{p.name}</span>
        <span className="tnum">{naira(p.priceKobo)}</span>
      </span>
      <span className="meta">{p.material?.split(" · ")[0]}</span>
    </Link>
  );
}
