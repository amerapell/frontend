import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { LookCard, ProductCard } from "@/components/product/ProductCard";
import { catalogApi, safe, ApiError } from "@/lib/api";
import { SITE_URL } from "@/lib/env";
import { italicWord } from "@/lib/format";
import type { Product, ProductCard as Card } from "@/lib/types";

export const revalidate = 60;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string): Promise<Product | null> {
  try {
    return await catalogApi.product(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await safe(load(slug), null);
  if (!p) return { title: "Product" };
  const price = `₦${Math.round(p.priceKobo / 100).toLocaleString("en-NG")}`;
  const description = p.seo.description || `${p.name} — ${price}. ${p.description}`.slice(0, 160);
  const image = p.seo.ogImage ?? p.images.find((i) => i.url)?.url;
  return {
    title: p.seo.title || p.name,
    description,
    alternates: { canonical: `${SITE_URL}/p/${p.slug}` },
    openGraph: {
      type: "website",
      title: `${p.name} — ${price}`,
      description,
      url: `${SITE_URL}/p/${p.slug}`,
      images: image ? [{ url: image, alt: p.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: `${p.name} — ${price}`, description, images: image ? [image] : undefined },
    other: {
      "product:price:amount": String(Math.round(p.priceKobo / 100)),
      "product:price:currency": "NGN",
      "og:price:amount": String(Math.round(p.priceKobo / 100)),
      "og:price:currency": "NGN",
    },
  };
}

function jsonLd(p: Product) {
  const offers = p.variants.length
    ? p.variants.map((v) => ({
        "@type": "Offer",
        sku: v.sku,
        price: (v.priceKobo / 100).toFixed(2),
        priceCurrency: "NGN",
        availability: v.available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: `${SITE_URL}/p/${p.slug}`,
        itemCondition: "https://schema.org/NewCondition",
      }))
    : [{ "@type": "Offer", price: (p.priceKobo / 100).toFixed(2), priceCurrency: "NGN", availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${SITE_URL}/p/${p.slug}` }];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: p.variants[0]?.sku ?? p.number,
    mpn: p.number,
    brand: { "@type": "Brand", name: "Amerapelle" },
    image: p.images.map((i) => i.url).filter(Boolean),
    material: p.material ?? undefined,
    color: p.options.colours.map((c) => c.name).join(", ") || undefined,
    offers: offers.length === 1 ? offers[0] : { "@type": "AggregateOffer", priceCurrency: "NGN", lowPrice: Math.min(...p.variants.map((v) => v.priceKobo)) / 100, highPrice: Math.max(...p.variants.map((v) => v.priceKobo)) / 100, offerCount: offers.length, offers },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let p: Product | null = null;
  try {
    p = await load(slug);
  } catch {
    // API unreachable — don't cache a 404 for a real product
    return (
      <div className="container empty empty--page">
        <span className="serif empty__title">One moment<em>…</em></span>
        <p className="body-copy">We couldn&apos;t load this piece right now. Please refresh in a moment.</p>
        <Link href="/" className="ap-link">Back to the index →</Link>
      </div>
    );
  }
  if (!p) notFound();

  const [zones, alsoLike] = await Promise.all([
    safe(catalogApi.zones(), []),
    (async (): Promise<Card[]> => {
      const col = p!.collections.find((c) => !["new-in", "sale"].includes(c.slug)) ?? p!.collections[0];
      if (!col) return [];
      const r = await safe(catalogApi.collection(col.slug, { pageSize: 12 }), null);
      const exclude = new Set([p!.id, ...p!.related.map((x) => x.id)]);
      return (r?.products.items ?? []).filter((x) => !exclude.has(x.id)).slice(0, 4);
    })(),
  ]);
  const [a, b, c] = italicWord("Complete the look");

  return (
    <>
      <ProductView product={p} zones={zones} />
      {p.related.length > 0 && (
        <section className="container pdp-section" aria-labelledby="look-title">
          <div className="section-head section-head--ink">
            <h2 id="look-title" className="serif section-head__title pdp-section__title">
              {a.trim()} <em>{[b, c.trim()].join(" ").trim()}</em>
            </h2>
            <span className="mono-label hide-mobile">STYLED WITH {p.number.toUpperCase()}</span>
          </div>
          <div className="look-grid">
            {p.related.slice(0, 4).map((r) => (
              <LookCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
      {alsoLike.length > 0 && (
        <section className="container pdp-section pdp-section--tight" aria-labelledby="like-title">
          <div className="section-head section-head--hair">
            <h2 id="like-title" className="serif section-head__title pdp-section__title">
              You may <em>also like</em>
            </h2>
          </div>
          <div className="product-grid product-grid--fill">
            {alsoLike.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p)).replace(/</g, "\\u003c") }} />
    </>
  );
}
