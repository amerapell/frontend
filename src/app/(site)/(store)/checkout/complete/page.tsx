import type { Metadata } from "next";
import { CheckoutComplete } from "@/components/checkout/OrderConfirmed";
import { catalogApi, safe } from "@/lib/api";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CompletePage({ searchParams }: { searchParams: Promise<{ reference?: string; trxref?: string }> }) {
  const sp = await searchParams;
  const zones = await safe(catalogApi.zones(), []);
  return <CheckoutComplete reference={sp.reference ?? sp.trxref ?? null} zones={zones} />;
}
