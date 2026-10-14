import type { Metadata } from "next";
import { WishlistPage } from "@/components/account/AccountPages";

export const metadata: Metadata = { title: "Saved" };
export default function Page() {
  return <WishlistPage />;
}
