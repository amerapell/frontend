import type { Metadata } from "next";
import { ContentHead } from "@/components/home/ContentHead";
import { Markdown } from "@/components/ui/Markdown";
import { AdirePattern } from "@/components/patterns/Patterns";
import { contentApi, safe } from "@/lib/api";
import { SITE_URL } from "@/lib/env";

export const revalidate = 300;
export const metadata: Metadata = { title: "About", description: "Amerapelle is a Lagos label making quiet luxury for loud entrances — tailoring, leather and silk in limited runs.", alternates: { canonical: `${SITE_URL}/about` } };

export default async function AboutPage() {
  const page = await safe(contentApi.page("about"), null);
  return (
    <>
      <ContentHead crumb="ABOUT" title={<>Cut in <em className="navy-em">Lagos</em></>} lede="Tailoring, leather and silk in navy, ink and ivory. Limited runs. No restocks." />
      <section className="container content-body content-body--art">
        {page ? <Markdown source={page.bodyMarkdown} /> : <p className="body-copy">Amerapelle is a Lagos luxury label. Every piece is made in a limited, numbered run.</p>}
        <div className="content-art" aria-hidden>
          <AdirePattern redStars />
        </div>
      </section>
    </>
  );
}
