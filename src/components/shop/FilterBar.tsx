"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "@/components/chrome/Icons";
import { naira } from "@/lib/format";
import type { Facets } from "@/lib/types";
import { NAV } from "@/components/chrome/Header";

function Dropdown({ label, active, children }: { label: string; active?: boolean; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="dd" ref={ref}>
      <button type="button" className={`filter-btn${active ? " is-active" : ""}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {label}
        <ChevronDown style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 200ms" }} />
      </button>
      {open && <div className="dd__panel ap-slide-down">{children(() => setOpen(false))}</div>}
    </div>
  );
}

export function useQueryNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  return { params, set };
}

/** CAT-3: category, size, colour, price range, in-stock toggle, sort, view. */
export function FilterBar({ facets, slug, cols, setCols }: { facets: Facets; slug?: string; cols: 2 | 4; setCols: (c: 2 | 4) => void }) {
  const { params, set } = useQueryNav();
  const size = params.get("size");
  const colour = params.get("colour");
  const min = params.get("minKobo");
  const max = params.get("maxKobo");
  const inStock = params.get("inStock") === "true";
  const sort = params.get("sort") ?? "newest";
  const [minN, setMinN] = useState(min ? String(Number(min) / 100) : "");
  const [maxN, setMaxN] = useState(max ? String(Number(max) / 100) : "");
  const qs = params.toString();

  const chips: { label: string; clear: Record<string, null> }[] = [];
  if (inStock) chips.push({ label: "In stock", clear: { inStock: null } });
  if (size) chips.push({ label: `Size ${size}`, clear: { size: null } });
  if (colour) chips.push({ label: colour, clear: { colour: null } });
  if (min || max) chips.push({ label: `${min ? naira(Number(min)) : "₦0"} – ${max ? naira(Number(max)) : "any"}`, clear: { minKobo: null, maxKobo: null } });

  const presets: [string, number | null, number | null][] = [
    ["Under ₦75,000", null, 75_000_00],
    ["₦75,000 – ₦150,000", 75_000_00, 150_000_00],
    ["₦150,000 and above", 150_000_00, null],
  ];

  return (
    <div className="filters">
      <div className="filters__bar">
        <div className="filters__left">
          <Dropdown label="Category" active={false}>
            {() => (
              <ul className="dd__list">
                {[{ slug: "new-in", label: "New in" }, ...NAV, { slug: "sale", label: "Sale" }].map((c) => (
                  <li key={c.slug}>
                    <Link href={`/c/${c.slug}${qs ? `?${qs}` : ""}`} className={`dd__item${c.slug === slug ? " is-on" : ""}`}>{c.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </Dropdown>
          <Dropdown label="Size" active={!!size}>
            {(close) => (
              <div className="dd__sizes">
                {facets.sizes.length === 0 && <span className="mono-xs">ONE SIZE</span>}
                {facets.sizes.map((s) => (
                  <button key={s} type="button" className={`size-cell${s === size ? " is-on" : ""}`} aria-pressed={s === size} onClick={() => { set({ size: s === size ? null : s }); close(); }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </Dropdown>
          <Dropdown label="Colour" active={!!colour}>
            {(close) => (
              <ul className="dd__list">
                {facets.colours.map((c) => (
                  <li key={c.name}>
                    <button type="button" className={`dd__item${c.name === colour ? " is-on" : ""}`} aria-pressed={c.name === colour} onClick={() => { set({ colour: c.name === colour ? null : c.name }); close(); }}>
                      <span className="dot10" style={{ background: c.hex }} /> {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Dropdown>
          <Dropdown label="Price" active={!!(min || max)}>
            {(close) => (
              <div className="dd__price">
                <ul className="dd__list">
                  {presets.map(([l, lo, hi]) => (
                    <li key={l}>
                      <button type="button" className="dd__item" onClick={() => { set({ minKobo: lo ? String(lo) : null, maxKobo: hi ? String(hi) : null }); close(); }}>{l}</button>
                    </li>
                  ))}
                </ul>
                <form
                  className="dd__range"
                  onSubmit={(e) => {
                    e.preventDefault();
                    set({ minKobo: minN ? String(Math.round(Number(minN) * 100)) : null, maxKobo: maxN ? String(Math.round(Number(maxN) * 100)) : null });
                    close();
                  }}
                >
                  <label className="mono-xs">MIN ₦<input inputMode="numeric" value={minN} onChange={(e) => setMinN(e.target.value.replace(/\D/g, ""))} placeholder={String(Math.floor(facets.priceRangeKobo[0] / 100))} /></label>
                  <label className="mono-xs">MAX ₦<input inputMode="numeric" value={maxN} onChange={(e) => setMaxN(e.target.value.replace(/\D/g, ""))} placeholder={String(Math.ceil(facets.priceRangeKobo[1] / 100))} /></label>
                  <button type="submit" className="btn btn--ghost">Apply</button>
                </form>
              </div>
            )}
          </Dropdown>
          <button type="button" className="filter-btn" role="switch" aria-checked={inStock} onClick={() => set({ inStock: inStock ? null : "true" })}>
            <span className={`switch${inStock ? " is-on" : ""}`} aria-hidden><span /></span>
            In stock only
          </button>
        </div>
        <div className="filters__right">
          <label htmlFor="sort" className="mono-label">SORT</label>
          <select id="sort" className="sort-select" value={sort} onChange={(e) => set({ sort: e.target.value === "newest" ? null : e.target.value })}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price, low to high</option>
            <option value="price_desc">Price, high to low</option>
          </select>
          <span className="filters__sep hide-mobile" aria-hidden />
          <span className="mono-label hide-mobile">VIEW</span>
          <button type="button" className={`view-btn hide-mobile${cols === 2 ? " is-on" : ""}`} aria-pressed={cols === 2} aria-label="Two columns" onClick={() => setCols(2)}>
            <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect width="6" height="14" /><rect x="8" width="6" height="14" /></svg>
          </button>
          <button type="button" className={`view-btn hide-mobile${cols === 4 ? " is-on" : ""}`} aria-pressed={cols === 4} aria-label="Four columns" onClick={() => setCols(4)}>
            <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect width="2.5" height="14" /><rect x="3.8" width="2.5" height="14" /><rect x="7.6" width="2.5" height="14" /><rect x="11.4" width="2.6" height="14" /></svg>
          </button>
        </div>
      </div>
      {chips.length > 0 && (
        <div className="filters__active">
          <span className="mono-label">ACTIVE</span>
          {chips.map((c) => (
            <button key={c.label} type="button" className="chip chip--active" onClick={() => set(c.clear)} aria-label={`Remove filter ${c.label}`}>
              {c.label} <span aria-hidden>×</span>
            </button>
          ))}
          {chips.length > 1 && (
            <button type="button" className="ap-link small-link" onClick={() => set({ inStock: null, size: null, colour: null, minKobo: null, maxKobo: null })}>Clear all</button>
          )}
        </div>
      )}
    </div>
  );
}
