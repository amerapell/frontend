import { naira } from "@/lib/format";

/** Tabular price; red when on sale; optional struck compare-at. */
export function Price({ kobo, compareAt, showCompare = false, className = "" }: { kobo: number; compareAt?: number | null; showCompare?: boolean; className?: string }) {
  const sale = compareAt != null && compareAt > kobo;
  return (
    <span className={`price tnum ${sale ? "price--sale" : ""} ${className}`}>
      {sale && <span className="sr-only">Sale price </span>}
      {naira(kobo)}
      {sale && showCompare && (
        <s className="price__was">
          <span className="sr-only">was </span>
          {naira(compareAt)}
        </s>
      )}
    </span>
  );
}

export function WasPrice({ kobo }: { kobo: number }) {
  return (
    <s className="price__was">
      <span className="sr-only">was </span>
      {naira(kobo)}
    </s>
  );
}
