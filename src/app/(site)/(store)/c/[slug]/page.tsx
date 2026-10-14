import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdirePattern, AsookeStripe } from "@/components/patterns/Patterns";
import { ShopView } from "@/components/shop/ShopView";
import { catalogApi, safe, ApiError } from "@/lib/api";
import { parseFilters, type SearchParams } from "@/lib/filters";
import { SITE_URL } from "@/lib/env";
import type { CollectionPage } from "@/lib/types";

// Filters live in the query string, so this route renders per request;
// the underlying API fetches are still cached (revalidate 60s, tagged).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: SearchParams };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await safe(catalogApi.collection(slug, { pageSize: 1 }), null);
  if (!data) return { title: "Shop" };
  const c = data.collection;
  const description = c.description ?? `${c.name} at Amerapelle — limited runs, delivered across Nigeria.`;
  return {
    title: c.name,
    description,
    alternates: { canonical: `${SITE_URL}/c/${slug}` },
    openGraph: { title: `${c.name} — Amerapelle`, description, url: `${SITE_URL}/c/${slug}`, images: data.products.items[0]?.images[0]?.url ? [data.products.items[0].images[0].url] : undefined },
  };
}

export default async function CollectionPageRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  const { filters, page } = parseFilters(await searchParams);
  let data: CollectionPage | null = null;
  try {
    data = await catalogApi.collection(slug, filters);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
  }
  if (!data) {
    return (
      <div className="container empty empty--page">
        <span className="serif empty__title">The shop is <em>resting.</em></span>
        <p className="body-copy">We couldn&apos;t load this collection right now. Please try again in a moment.</p>
        <Link href="/" className="ap-link">Back to the index →</Link>
      </div>
    );
  }
  const { collection: c, products, facets } = data;

  return (
    <>
      <section className="container shop-head">
        <div className="shop-head__main">
          <div className="mono-label">
            <Link href="/" className="crumb">INDEX</Link> / {c.name.toUpperCase()}
          </div>
          <h1 className="serif shop-head__title">
            {c.name}
            <em className="shop-head__count">({c.count})</em>
          </h1>
        </div>
        <div className="shop-head__aside">
          {c.description && <p className="body-copy">{c.description}</p>}
          {c.heroPattern === "ASOOKE" ? (
            <div className="shop-head__arch shop-head__arch--asooke" aria-hidden><AsookeStripe height={128} /></div>
          ) : (
            <div className="shop-head__arch" aria-hidden><AdirePattern width={96} height={128} /></div>
          )}
        </div>
      </section>
      <ShopView slug={slug} facets={facets} products={products.items} total={products.total} page={page} showEdit={!c.isDrop} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: c.name,
            url: `${SITE_URL}/c/${slug}`,
            breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Index", item: SITE_URL }, { "@type": "ListItem", position: 2, name: c.name }] },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
