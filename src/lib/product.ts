import type { Badge, Product, ProductCard, Variant, Colour } from "./types";
import { SITE_URL, WHATSAPP_FALLBACK } from "./env";

export type TagInfo = { label: string; dot: string; soldOut: boolean };

/** Badge → label + dot colour per design (New=navy; Sale/Drop/Only N left=red; Sold out=faint) */
export function tagFor(p: Pick<ProductCard, "badge" | "lowStockCount" | "inStock">): TagInfo | null {
  const b: Badge | null = !p.inStock ? "SOLD_OUT" : p.badge;
  switch (b) {
    case "NEW":
      return { label: "New", dot: "var(--navy)", soldOut: false };
    case "SALE":
      return { label: "Sale", dot: "var(--red)", soldOut: false };
    case "DROP":
      return { label: "Drop", dot: "var(--red)", soldOut: false };
    case "LOW_STOCK":
      return { label: `Only ${p.lowStockCount ?? 2} left`, dot: "var(--red)", soldOut: false };
    case "SOLD_OUT":
      return { label: "Sold out", dot: "var(--faint)", soldOut: true };
    default:
      return null;
  }
}

export type IconKind = "garment" | "bag" | "shoe";
export const ICON_PATHS: Record<IconKind, string> = {
  garment: "M8 3l-5 4 2 3 2-1v12h10V9l2 1 2-3-5-4-2 2h-4z",
  bag: "M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2",
  shoe: "M4 16c4 0 6-2 9-6l2 2c2 0 5 1 5 4H4z",
};

export function iconKind(p: { material: string | null; name?: string }): IconKind {
  const s = `${p.material ?? ""} ${p.name ?? ""}`.toLowerCase();
  if (/shoe|mule|sandal|loafer|heel|boot|sneaker/.test(s)) return "shoe";
  if (/bag|tote|clutch|jewel|hoop|belt|accessor/.test(s)) return "bag";
  return "garment";
}

/** "Lamb leather · Outerwear" → "Outerwear" */
export function categoryOf(material: string | null) {
  if (!material) return "";
  const parts = material.split("·").map((s) => s.trim());
  return parts[parts.length - 1] ?? "";
}
export function fabricOf(material: string | null) {
  if (!material) return "";
  return material.split("·")[0].trim();
}

export function variantFor(p: Product, colour: string | null, size: string | null): Variant | null {
  return (
    p.variants.find(
      (v) => (p.options.colours.length ? v.colour === colour : true) && (p.options.sizes.length ? v.size === size : true),
    ) ?? null
  );
}

export function availableFor(p: Product, colour: string | null, size: string): number {
  return p.variants.filter((v) => v.size === size && (!colour || v.colour === colour)).reduce((s, v) => s + v.available, 0);
}

export function colourAvailable(p: Product, colour: Colour): boolean {
  return p.variants.some((v) => v.colour === colour.name && v.available > 0);
}

export function productUrl(slug: string) {
  return `${SITE_URL}/p/${slug}`;
}

export function whatsappLink(number: string | null | undefined, text: string) {
  const n = (number || WHATSAPP_FALLBACK || "").replace(/[^\d]/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export const LOW_STOCK_THRESHOLD = 2;
