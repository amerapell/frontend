import type { Metadata } from "next";
import { DropHero } from "@/components/home/DropHero";
import { dropPhase } from "@/lib/drop";
import { NewIn, type NewInTab } from "@/components/home/NewIn";
import { BrandStatement, CategoryTiles, SocialStrip } from "@/components/home/HomeSections";
import { HomeDropOverlay } from "@/components/home/HomeDropOverlay";
import { catalogApi, safe } from "@/lib/api";
import { getCollections, getSettings } from "@/lib/server-data";
import { loadDrop } from "@/lib/drop-data";
import { SITE_URL } from "@/lib/env";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Amerapelle — Quiet luxury, loud entrance" },
  description: "Lagos luxury fashion — tailoring, leather and silk in limited runs. Shop the latest drop. Delivered across Nigeria; exchange, not refund.",
  alternates: { canonical: SITE_URL },
};

const empty = { items: [], page: 1, pageSize: 4, total: 0 };

export default async function HomePage() {
  const [settings, collections] = await Promise.all([getSettings(), getCollections()]);
  const drop = settings.drop;
  const [all, women, men, acc, dropData] = await Promise.all([
    safe(catalogApi.collection("new-in", { pageSize: 8, sort: "newest" }).then((r) => ({ c: r.collection, p: r.products })), null),
    safe(catalogApi.collection("women", { pageSize: 4, sort: "newest" }).then((r) => r.products), empty),
    safe(catalogApi.collection("men", { pageSize: 4, sort: "newest" }).then((r) => r.products), empty),
    safe(catalogApi.collection("bags-accessories", { pageSize: 4, sort: "newest" }).then((r) => r.products), empty),
    drop ? loadDrop(drop.collectionSlug) : Promise.resolve(null),
  ]);
  const allProducts = all?.p ?? (await safe(catalogApi.products({ pageSize: 8, sort: "newest" }), empty));
  const tabs: NewInTab[] = [
    { key: "all", label: "All", count: all?.c.count ?? allProducts.total, href: "/c/new-in", products: allProducts.items },
    { key: "women", label: "Women", count: women.total, href: "/c/women", products: women.items },
    { key: "men", label: "Men", count: men.total, href: "/c/men", products: men.items },
    { key: "acc", label: "Accessories", count: acc.total, href: "/c/bags-accessories", products: acc.items },
  ];
  const phase = dropPhase(drop).phase;

  return (
    <>
      <DropHero drop={drop} collection={dropData?.collection} pieces={dropData?.products ?? []} />
      <NewIn tabs={tabs} />
      <CategoryTiles collections={collections} />
      <BrandStatement />
      <SocialStrip settings={settings} products={allProducts.items} />
      {phase === "upcoming" && dropData && drop && <HomeDropOverlay collection={dropData.collection} title={drop.title} pieces={dropData.dropPieces} />}
    </>
  );
}
