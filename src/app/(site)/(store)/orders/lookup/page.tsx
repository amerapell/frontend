import type { Metadata } from "next";
import { OrderLookup } from "@/components/account/OrderLookup";

export const metadata: Metadata = { title: "Find your order", robots: { index: false } };
export default function Page() {
  return <OrderLookup />;
}
