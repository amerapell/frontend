import type { Metadata } from "next";
import { AddressesPage } from "@/components/account/AccountPages";

export const metadata: Metadata = { title: "Addresses" };
export default function Page() {
  return <AddressesPage />;
}
