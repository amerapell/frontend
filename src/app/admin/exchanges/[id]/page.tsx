"use client";
import { use } from "react";
import { ExchangeAdminDetail } from "@/components/admin/ExchangeDetail";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ExchangeAdminDetail id={id} />;
}
