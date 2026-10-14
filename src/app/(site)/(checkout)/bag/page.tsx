import type { Metadata } from "next";
import { BagView } from "@/components/cart/BagView";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function BagPage() {
  return <BagView />;
}
