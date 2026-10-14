"use client";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { AdirePattern } from "@/components/patterns/Patterns";
import { useSettings } from "@/context/SettingsContext";
import { italicWord } from "@/lib/format";
import type { Facets, ProductCard as Card } from "@/lib/types";
import { FilterBar } from "./FilterBar";

const VIEW_KEY = "ap_shop_cols";

export function EditorialTile({ span }: { span: number }) {
  const { settings, drop } = useSettings();
  if (!settings.drop) return null;
  const [a, b, c] = italicWord(settings.drop.title);
  return (
    <Link href={`/drop/${settings.drop.collectionSlug}`} className="edit-tile" style={{ gridColumn: `span ${span}` }}>
      <AdirePattern redStars className="tile__pattern" />
      <span className="edit-tile__card">
        <span className="mono-label">EDIT / {(drop?.name ?? "DROP").toUpperCase()}</span>
        <span className="serif edit-tile__title">
          {a}<em>{b}</em>{c}
        </span>
        <span className="edit-tile__copy">{drop?.description ? drop.description.split(".")[0] + "." : "Pieces for after dark."} Shop the edit →</span>
      </span>
    </Link>
  );
}

export function ProductGridWithEdit({ products, cols, showEdit }: { products: Card[]; cols: 2 | 4; showEdit: boolean }) {
  const at = cols === 2 ? 4 : 6;
  return (
    <div className={`product-grid product-grid--${cols}`}>
      {products.map((p, i) => (
        <Fragment key={p.id}>
          {showEdit && i === at && <EditorialTile span={2} />}
          <ProductCard product={p} priority={i < 4} sizes={cols === 2 ? "(max-width: 767px) 50vw, 50vw" : "(max-width: 767px) 50vw, 25vw"} />
        </Fragment>
      ))}
      {showEdit && products.length > 0 && products.length <= at && <EditorialTile span={2} />}
    </div>
  );
}

export function ShopView({
  slug,
  facets,
  products,
  total,
  page,
  showEdit = true,
}: {
  slug?: string;
  facets: Facets;
  products: Card[];
  total: number;
  page: number;
  showEdit?: boolean;
}) {
  const [cols, setColsState] = useState<2 | 4>(4);
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(VIEW_KEY);
      if (v === "2") setColsState(2);
    } catch {
      /* ignore */
    }
  }, []);
  const setCols = (c: 2 | 4) => {
    setColsState(c);
    try {
      window.localStorage.setItem(VIEW_KEY, String(c));
    } catch {
      /* ignore */
    }
  };
  const shown = products.length;
  const pct = total ? Math.round((shown / total) * 100) : 0;

  return (
    <>
      <section className="container shop-filters">
        <FilterBar facets={facets} slug={slug} cols={cols} setCols={setCols} />
      </section>
      <section className="container shop-grid" aria-label="Products" aria-live="polite">
        {products.length ? (
          <ProductGridWithEdit products={products} cols={cols} showEdit={showEdit} />
        ) : (
          <div className="empty">
            <span className="serif empty__title">Nothing matches <em>yet.</em></span>
            <p className="body-copy">Try removing a filter — or see everything new this week.</p>
            <Link href={slug ? `/c/${slug}` : "/c/new-in"} className="ap-link">Clear filters →</Link>
          </div>
        )}
        {total > 0 && (
          <div className="load-more">
            <span className="mono-label">{shown} / {total}</span>
            <span className="load-more__track"><span style={{ width: `${pct}%` }} /></span>
            {shown < total && (
              <LoadMoreLink page={page} />
            )}
          </div>
        )}
      </section>
    </>
  );
}

function LoadMoreLink({ page }: { page: number }) {
  const params = useSearchParams();
  const next = new URLSearchParams(params.toString());
  next.set("page", String(page + 1));
  const href = `?${next.toString()}`;
  return (
    <Link href={href} scroll={false} className="btn btn--outline btn--short" prefetch={false}>
      Load more
    </Link>
  );
}
