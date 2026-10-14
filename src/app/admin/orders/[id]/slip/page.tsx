"use client";
import { use } from "react";
import { PackingSlip } from "@/components/admin/Orders";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PackingSlip id={id} />;
}
