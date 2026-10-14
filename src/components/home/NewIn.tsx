"use client";
import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCard as Card } from "@/lib/types";

export type NewInTab = { key: string; label: string; count: number; href: string; products: Card[] };

export function NewIn({ tabs }: { tabs: NewInTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!tab) return null;
  const all = tabs[0];
  return (
    <section className="container home-section" aria-labelledby="newin-title">
      <div className="section-head section-head--hair newin-head">
        <div>
          <div className="mono-label hide-mobile">(02) — THIS WEEK</div>
          <h2 id="newin-title" className="serif section-head__title newin-title">
            New <em>in</em>
          </h2>
        </div>
        <div className="newin-tabs">
          <div role="tablist" aria-label="Filter new in" className="row gap-28 hide-mobile">
            {tabs.map((t) => (
              <button key={t.key} role="tab" aria-selected={t.key === tab.key} className={`tab${t.key === tab.key ? " is-on" : ""}`} onClick={() => setActive(t.key)}>
                {t.label}
                <sup className="nav-count">{t.count}</sup>
              </button>
            ))}
          </div>
          <Link href={all.href} className="ap-link newin-all hide-mobile">View all {all.count} →</Link>
          <Link href={all.href} className="mono-xs show-mobile">{all.count} PIECES →</Link>
        </div>
      </div>
      <div className="product-grid product-grid--fill" role="tabpanel" aria-label={tab.label}>
        {tab.products.slice(0, 4).map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 2} />
        ))}
        {!tab.products.length && <p className="body-copy">New pieces land every week. Check back soon.</p>}
      </div>
    </section>
  );
}
