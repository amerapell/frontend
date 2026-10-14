import type { ReactNode } from "react";
import Link from "next/link";

export function ContentHead({ crumb, title, lede, aside }: { crumb: string; title: ReactNode; lede?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="container content-head">
      <div>
        <div className="mono-label">
          <Link href="/" className="crumb">INDEX</Link> / {crumb}
        </div>
        <h1 className="serif content-head__title">{title}</h1>
      </div>
      {(lede || aside) && (
        <div className="content-head__aside">
          {lede && <p className="body-copy">{lede}</p>}
          {aside}
        </div>
      )}
    </section>
  );
}
