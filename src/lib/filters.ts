import type { ProductFilters, SortKey } from "./types";

export const PAGE_SIZE = 12;

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** URL search params → contract filters. "Load more" grows pageSize so results accumulate. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): { filters: ProductFilters; page: number } {
  const page = Math.max(1, Math.min(20, Number(one(sp.page)) || 1));
  const sort = one(sp.sort) as SortKey | undefined;
  const num = (k: string) => {
    const v = Number(one(sp[k]));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  return {
    page,
    filters: {
      page: 1,
      pageSize: PAGE_SIZE * page,
      size: one(sp.size) || undefined,
      colour: one(sp.colour) || undefined,
      minKobo: num("minKobo"),
      maxKobo: num("maxKobo"),
      inStock: one(sp.inStock) === "true" || undefined,
      sort: sort && ["newest", "price_asc", "price_desc"].includes(sort) ? sort : undefined,
      q: one(sp.q) || undefined,
    },
  };
}
