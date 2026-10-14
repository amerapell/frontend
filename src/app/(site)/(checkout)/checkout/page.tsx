import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { catalogApi, safe } from "@/lib/api";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const zones = await safe(catalogApi.zones(), []);
  return <CheckoutView zones={zones.filter((z) => z.active)} />;
}
