import "server-only";
import { catalogApi, safe } from "./api";
import type { Collection, ProductCard } from "./types";
import type { DropPiece } from "@/components/motion/DropTakeover";

/** Loads a drop collection plus live stock counts for its first pieces. */
export async function loadDrop(slug: string, pieces = 4): Promise<{ collection: Collection; products: ProductCard[]; dropPieces: DropPiece[] } | null> {
  const page = await safe(catalogApi.collection(slug, { pageSize: 48, sort: "newest" }), null);
  if (!page) return null;
  const first = page.products.items.slice(0, pieces);
  const details = await Promise.all(first.map((p) => safe(catalogApi.product(p.slug), null)));
  const dropPieces = first.map((p, i) => ({ ...p, left: details[i] ? details[i]!.variants.reduce((s, v) => s + v.available, 0) : p.lowStockCount ?? 0 }));
  return { collection: page.collection, products: page.products.items, dropPieces };
}
