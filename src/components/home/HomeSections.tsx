import Link from "next/link";
import { AdirePattern, AsookeStripe } from "@/components/patterns/Patterns";
import { ProductImage } from "@/components/product/ProductImage";
import { iconKind } from "@/lib/product";
import type { Collection, ProductCard, StoreSettings } from "@/lib/types";

const pad = (n: number | undefined) => `${n ?? 0} PIECES`;

export function CategoryTiles({ collections }: { collections: Collection[] }) {
  const get = (slug: string) => collections.find((c) => c.slug === slug);
  return (
    <section className="container home-section" aria-labelledby="shopby">
      <div id="shopby" className="mono-label rule-head">(03) — SHOP BY</div>
      <div className="tiles">
        <Link href="/c/women" className="tile tile--women on-dark">
          <AdirePattern className="tile__pattern" />
          <span className="tile__index">C/01 · {pad(get("women")?.count)}</span>
          <span className="tile__card">
            <span className="serif tile__name">Women</span>
            <span className="tile__arrow" aria-hidden>→</span>
          </span>
        </Link>
        <Link href="/c/men" className="tile tile--men">
          <span className="tile__index">C/02 · {pad(get("men")?.count)}</span>
          <span className="serif tile__giant">Men</span>
          <span className="tile__foot">
            <span>Tailoring, knitwear, leather</span>
            <span className="tile__arrow" aria-hidden>→</span>
          </span>
        </Link>
        <Link href="/c/bags-accessories" className="tile tile--bags">
          <span className="tile__index">C/03 · {pad(get("bags-accessories")?.count)}</span>
          <AsookeStripe height={64} />
          <span className="tile__foot tile__foot--plain">
            <span className="serif tile__name">
              Bags &amp;
              <br />
              <em>accessories</em>
            </span>
            <span className="tile__arrow" aria-hidden>→</span>
          </span>
        </Link>
      </div>
    </section>
  );
}

export function BrandStatement() {
  const promises = [
    ["01", "Delivered across Nigeria", "Lagos in 1–3 working days."],
    ["02", "Exchange, not refund", "Swap any unworn piece for credit."],
    ["03", "Pay your way", "Paystack in naira, Bachs abroad."],
    ["04", "A stylist on WhatsApp", "Fit and sizing, answered fast."],
  ];
  return (
    <section className="container brand" aria-label="Our promise">
      <p className="serif brand__line">
        Cut in Lagos <em className="navy-em">for</em> the evenings that matter<span className="red">.</span>
      </p>
      <ul className="promises">
        {promises.map(([n, t, d]) => (
          <li key={n} className="promise">
            <div className="mono-label">{n}</div>
            <div className="promise__title">{t}</div>
            <div className="promise__desc">{d}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** PG-1 Instagram/TikTok strip — styled from the design language (not in the v2 frames). */
export function SocialStrip({ settings, products }: { settings: StoreSettings; products: ProductCard[] }) {
  const handle = settings.instagramUrl ? "@" + settings.instagramUrl.replace(/\/$/, "").split("/").pop() : "@amerapelle";
  return (
    <section className="container social" aria-labelledby="social-title">
      <div className="section-head section-head--ink">
        <div>
          <div className="mono-label">(04) — {handle.toUpperCase()}</div>
          <h2 id="social-title" className="serif section-head__title social__title">
            Worn in <em>Lagos</em>
          </h2>
        </div>
        <div className="row gap-24 section-head__aside">
          {settings.instagramUrl && (
            <a href={settings.instagramUrl} className="ap-link" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
          )}
          {settings.tiktokUrl && (
            <a href={settings.tiktokUrl} className="ap-link" target="_blank" rel="noopener noreferrer">TikTok ↗</a>
          )}
        </div>
      </div>
      <ul className="social__strip">
        <li>
          <Link href="/reel" className="social__tile social__tile--reel on-dark">
            <AdirePattern tile={120} className="tile__pattern" />
            <span className="social__reel">
              <span className="mono-xs">LOOKS · VIDEO</span>
              <span className="serif">Shop the <em>reel</em> →</span>
            </span>
          </Link>
        </li>
        {products.slice(0, 5).map((p) => (
          <li key={p.id}>
            <a href={settings.instagramUrl || `/p/${p.slug}`} className="social__tile" target={settings.instagramUrl ? "_blank" : undefined} rel="noopener noreferrer">
              <ProductImage src={p.images[0]?.url} alt={p.name} kind={iconKind(p)} iconSize={40} sizes="200px" />
              <span className="social__cap mono-xs">{p.number.toUpperCase()}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
