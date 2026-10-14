import type { Metadata } from "next";
import Link from "next/link";
import { ContentHead } from "@/components/home/ContentHead";
import { Accordion } from "@/components/ui/Accordion";
import { contentApi, safe } from "@/lib/api";
import { SITE_URL } from "@/lib/env";
import { slugify } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = { title: "FAQ", description: "Orders, delivery, payments, exchanges (no refunds), sizing and authenticity.", alternates: { canonical: `${SITE_URL}/faq` } };

export default async function FaqPage() {
  const groups = await safe(contentApi.faq(), []);
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } }))),
  };
  return (
    <>
      <ContentHead crumb="HELP / FAQ" title={<>Questions, <em className="navy-em">answered</em></>} lede={<>Exchange, not refund — every unworn piece can become credit. Still stuck? <Link href="/contact" className="ap-link">Contact us</Link>.</>} />
      <section className="container faq">
        <nav aria-label="FAQ groups" className="faq__nav">
          {groups.map((g, i) => (
            <a key={g.group} href={`#${slugify(g.group)}`} className="faq__navlink">
              <span className="mono-xs">{String(i + 1).padStart(2, "0")}</span>
              {g.group}
            </a>
          ))}
        </nav>
        <div className="faq__groups">
          {groups.map((g, i) => (
            <div key={g.group} id={slugify(g.group)} className="faq__group">
              <div className="mono-label rule-head">({String(i + 1).padStart(2, "0")}) — {g.group.toUpperCase()}</div>
              <Accordion items={g.items.map((it) => ({ id: it.id, title: it.question, body: <p>{it.answer}</p> }))} />
            </div>
          ))}
          {!groups.length && <p className="body-copy">Our FAQ is being updated. Message us on WhatsApp in the meantime.</p>}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
