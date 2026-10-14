import { Fragment, type ReactNode } from "react";

/** Minimal, safe Markdown renderer for CMS pages (headings, lists, tables, bold/italic, links). No raw HTML. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      const href = /^(https?:|mailto:|tel:|\/)/.test(lm[2]) ? lm[2] : "#";
      out.push(<a key={k} href={href}>{lm[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let b = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const key = `b${b++}`;
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = h[1].length;
      blocks.push(lvl <= 2 ? <h2 key={key}>{inline(h[2], key)}</h2> : <h3 key={key}>{inline(h[2], key)}</h3>);
      i++;
      continue;
    }
    if (/^\|/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        if (!/^\|\s*-/.test(lines[i])) rows.push(lines[i].replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <table key={key}>
          <thead><tr>{head.map((c, k) => <th key={k}>{c}</th>)}</tr></thead>
          <tbody>{body.map((r, ri) => <tr key={ri}>{r.map((c, k) => <td key={k}>{inline(c, `${key}-${ri}-${k}`)}</td>)}</tr>)}</tbody>
        </table>,
      );
      continue;
    }
    if (/^(\s*[-*]\s+|\s*\d+\.\s+)/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) {
        items.push(lines[i].replace(/^(\s*[-*]\s+|\s*\d+\.\s+)/, ""));
        i++;
      }
      const L = ordered ? "ol" : "ul";
      blocks.push(<L key={key}>{items.map((t, k) => <li key={k}>{inline(t, `${key}-${k}`)}</li>)}</L>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\||\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(<p key={key}>{inline(para.join(" "), key)}</p>);
  }
  return <div className="prose">{blocks.map((x, k) => <Fragment key={k}>{x}</Fragment>)}</div>;
}
