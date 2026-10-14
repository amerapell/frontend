import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHead } from "@/components/home/ContentHead";
import { Markdown } from "@/components/ui/Markdown";
import { contentApi, safe } from "@/lib/api";
import { SITE_URL } from "@/lib/env";
import { longDate } from "@/lib/format";

export const revalidate = 300;
const SLUGS = ["delivery", "exchanges", "privacy", "terms"] as const;
const TITLES: Record<string, [string, string]> = {
  delivery: ["Delivery", "across Nigeria"],
  exchanges: ["Exchange,", "not refund"],
  privacy: ["Privacy", "& your data"],
  terms: ["Terms", "of sale"],
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await safe(contentApi.page(slug), null);
  return { title: page?.title ?? TITLES[slug]?.join(" ") ?? "Policy", alternates: { canonical: `${SITE_URL}/policies/${slug}` } };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) notFound();
  const page = await safe(contentApi.page(slug), null);
  const [a, b] = TITLES[slug];
  return (
    <>
      <ContentHead crumb={`POLICIES / ${slug.toUpperCase()}`} title={<>{a} <em className="navy-em">{b}</em></>} lede={page ? `Last updated ${longDate(page.updatedAt)}.` : undefined} />
      <section className="container content-body">
        <nav aria-label="Policies" className="policy-nav">
          {SLUGS.map((s) => (
            <Link key={s} href={`/policies/${s}`} className={`policy-nav__link${s === slug ? " is-on" : ""}`} aria-current={s === slug ? "page" : undefined}>
              {TITLES[s][0].replace(",", "")}
            </Link>
          ))}
        </nav>
        {page ? <Markdown source={page.bodyMarkdown} /> : <p className="body-copy">This page is being updated. Please check back shortly or contact us.</p>}
      </section>
    </>
  );
}
