import type { Metadata } from "next";
import Link from "next/link";
import { ShopView } from "@/components/shop/ShopView";
import { catalogApi, safe } from "@/lib/api";
import { parseFilters, type SearchParams } from "@/lib/filters";
import type { Facets } from "@/lib/types";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { filters, page } = parseFilters(sp);
  const q = filters.q ?? "";
  const res = q ? await safe(catalogApi.products(filters), null) : null;
  const items = res?.items ?? [];
  const sizes = Array.from(new Set(["XS", "S", "M", "L", "XL"]));
  const facets: Facets = { sizes, colours: Array.from(new Map(items.flatMap((p) => p.colours).map((c) => [c.name, c])).values()), priceRangeKobo: [0, 500_000_00] };

  return (
    <>
      <section className="container shop-head">
        <div className="shop-head__main">
          <div className="mono-label">
            <Link href="/" className="crumb">INDEX</Link> / SEARCH
          </div>
          <h1 className="serif shop-head__title shop-head__title--search">
            {q ? <>“{q}”</> : <>Search</>}
            {res && <em className="shop-head__count">({res.total})</em>}
          </h1>
        </div>
        <div className="shop-head__aside">
          <form action="/search" role="search" className="line-input search-inline">
            <label htmlFor="q" className="sr-only">Search</label>
            <input id="q" name="q" defaultValue={q} placeholder="Search the store" />
            <button type="submit">Search →</button>
          </form>
        </div>
      </section>
      {q ? (
        <ShopView facets={facets} products={items} total={res?.total ?? 0} page={page} showEdit={false} />
      ) : (
        <div className="container empty"><p className="body-copy">Type above to search pieces, materials or collections.</p></div>
      )}
    </>
  );
}
