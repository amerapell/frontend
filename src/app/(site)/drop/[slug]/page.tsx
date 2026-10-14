import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DropTakeover } from "@/components/motion/DropTakeover";
import { ProductGridWithEdit } from "@/components/shop/ShopView";
import { loadDrop } from "@/lib/drop-data";
import { getSettings } from "@/lib/server-data";
import { SITE_URL } from "@/lib/env";
import { catalogApi, safe } from "@/lib/api";

export const revalidate = 30;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await safe(catalogApi.collection(slug, { pageSize: 1 }), null);
  if (!page) return { title: "Drop" };
  const s = await getSettings();
  const title = s.drop?.collectionSlug === slug ? `${page.collection.name} — ${s.drop.title}` : page.collection.name;
  return {
    title,
    description: page.collection.description ?? "A limited drop from Amerapelle. No restocks.",
    alternates: { canonical: `${SITE_URL}/drop/${slug}` },
    openGraph: { title: `${title} · Amerapelle`, description: page.collection.description ?? undefined, url: `${SITE_URL}/drop/${slug}` },
  };
}

export default async function DropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, settings] = await Promise.all([loadDrop(slug), getSettings()]);
  if (!data) notFound();
  const title = settings.drop?.collectionSlug === slug ? settings.drop.title : data.collection.description?.split(".")[0] ?? data.collection.name;
  const upcoming = data.collection.goLiveAt ? new Date(data.collection.goLiveAt).getTime() > Date.now() : false;
  const rest = data.products.slice(4);

  return (
    <main id="main" tabIndex={-1} className="drop-page">
      <DropTakeover collection={data.collection} title={title} pieces={data.dropPieces} />
      {!upcoming && rest.length > 0 && (
        <section className="container drop-page__rest" aria-label="More from the drop">
          <div className="section-head section-head--ink">
            <h2 className="serif section-head__title">The <em>rest</em> of the run</h2>
            <Link href={`/c/${slug}`} className="ap-link small-link">Filter &amp; sort →</Link>
          </div>
          <ProductGridWithEdit products={rest} cols={4} showEdit={false} />
        </section>
      )}
    </main>
  );
}
