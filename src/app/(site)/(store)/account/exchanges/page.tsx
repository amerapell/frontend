import type { Metadata } from "next";
import { ExchangesPage } from "@/components/account/ExchangesPage";

export const metadata: Metadata = { title: "Exchanges" };
export default function Page() {
  return <ExchangesPage />;
}
