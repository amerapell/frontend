import type { Metadata } from "next";
import { PrivacyPage } from "@/components/account/AccountPages";

export const metadata: Metadata = { title: "Privacy & data" };
export default function Page() {
  return <PrivacyPage />;
}
