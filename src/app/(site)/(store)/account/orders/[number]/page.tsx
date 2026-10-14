import type { Metadata } from "next";
import { AccountOrderDetail } from "@/components/account/AccountPages";

export const metadata: Metadata = { title: "Order" };
export default async function Page({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <AccountOrderDetail number={decodeURIComponent(number)} />;
}
