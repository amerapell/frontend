import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountShell } from "@/components/account/AccountShell";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="container empty empty--page"><span className="mono-label">LOADING…</span></div>}>
      <AccountShell>{children}</AccountShell>
    </Suspense>
  );
}
