"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUI } from "@/context/UIContext";
import { catalogApi } from "@/lib/api";
import { naira } from "@/lib/format";
import type { SearchSuggest } from "@/lib/types";
import { ProductThumb } from "@/components/product/ProductImage";
import { CloseIcon, SearchIcon } from "./Icons";
import { useDialog } from "./useDialog";

/** CAT-4: instant suggestions (debounced) — products (max 6) + collections (max 3). */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<SearchSuggest | null>(null);
  const [loading, setLoading] = useState(false);
  const close = () => setSearchOpen(false);
  const ref = useDialog(searchOpen, close);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => setSearchOpen(false), [pathname, setSearchOpen]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setRes(null);
      return;
    }
    const t = window.setTimeout(async () => {
      ctrl.current?.abort();
      ctrl.current = new AbortController();
      setLoading(true);
      try {
        setRes(await catalogApi.suggest(term, ctrl.current.signal));
      } catch {
        /* aborted or offline */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(t);
  }, [q]);

  if (!searchOpen) return null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  const empty = res && !res.products.length && !res.collections.length;

  return (
    <div className="overlay overlay--search" onClick={close}>
      <div ref={ref} className="search-panel ap-slide-down" role="dialog" aria-modal="true" aria-label="Search" onClick={(e) => e.stopPropagation()}>
        <div className="container">
          <form className="search-panel__form" role="search" onSubmit={submit}>
            <label htmlFor="search-q" className="mono-label">SEARCH</label>
            <div className="search-panel__field">
              <SearchIcon width={22} height={22} />
              <input
                id="search-q"
                data-autofocus
                type="search"
                autoComplete="off"
                placeholder="Leather jacket, silk, tote…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-controls="search-results"
              />
              <button type="button" className="icon-btn" aria-label="Close search" onClick={close}><CloseIcon /></button>
            </div>
          </form>
          <div id="search-results" className="search-panel__results" aria-busy={loading}>
            {empty && <p className="body-copy">Nothing for “{q}”. Try “leather”, “silk” or “tote”.</p>}
            {res && res.collections.length > 0 && (
              <div className="search-panel__cols">
                <span className="mono-label">COLLECTIONS</span>
                {res.collections.map((c) => (
                  <Link key={c.id} href={`/c/${c.slug}`} className="search-panel__col" onClick={close}>
                    <span className="serif">{c.name}</span><sup className="nav-count">{c.count}</sup>
                  </Link>
                ))}
              </div>
            )}
            {res && res.products.length > 0 && (
              <div>
                <span className="mono-label">PIECES</span>
                <ul className="search-panel__grid">
                  {res.products.map((p) => (
                    <li key={p.id}>
                      <Link href={`/p/${p.slug}`} className="search-hit" onClick={close}>
                        <ProductThumb product={p} />
                        <span className="stack gap-8">
                          <span className="search-hit__name">{p.name}</span>
                          <span className="meta">{p.material}</span>
                          <span className={`tnum ${p.compareAtKobo ? "red" : ""}`}>{naira(p.priceKobo)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button className="ap-link search-panel__all" onClick={submit as unknown as React.MouseEventHandler}>See all results for “{q}” →</button>
              </div>
            )}
            {!res && (
              <div className="search-panel__popular">
                <span className="mono-label">POPULAR</span>
                {["Leather", "Silk", "Tote", "Blazer", "Mule"].map((t) => (
                  <button key={t} className="chip" onClick={() => setQ(t)}>{t}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
